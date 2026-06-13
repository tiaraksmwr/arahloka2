const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Database setup
const dbDir = path.resolve(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.resolve(dbDir, 'arahloka.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('superadmin', 'tourist', 'travel_provider')) NOT NULL,
      status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create packages table with new fields
    db.run(`CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT,
      duration TEXT,
      price INTEGER,
      quota INTEGER,
      image_url TEXT,
      latitude REAL,
      longitude REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create bookings table
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tourist_id INTEGER NOT NULL,
      package_id INTEGER NOT NULL,
      travel_date TEXT NOT NULL,
      participants INTEGER NOT NULL,
      notes TEXT,
      status TEXT CHECK(status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tourist_id) REFERENCES users(id),
      FOREIGN KEY (package_id) REFERENCES packages(id)
    )`);

    // Create journey_studio table
    db.run(`CREATE TABLE IF NOT EXISTS journey_studio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT CHECK(type IN ('itinerary', 'memory', 'story')) NOT NULL,
      booking_id INTEGER,
      destination TEXT NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      rating INTEGER,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    )`);

    // Create trip_plans table
    db.run(`CREATE TABLE IF NOT EXISTS trip_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      tourist_id INTEGER NOT NULL,
      package_id INTEGER NOT NULL,
      plan_type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id),
      FOREIGN KEY (tourist_id) REFERENCES users(id),
      FOREIGN KEY (package_id) REFERENCES packages(id)
    )`);

    // Create trip_checklist table
    db.run(`CREATE TABLE IF NOT EXISTS trip_checklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      tourist_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      category TEXT NOT NULL,
      is_checked INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id),
      FOREIGN KEY (tourist_id) REFERENCES users(id)
    )`);

    // Add missing columns safely if they don't exist
    db.all("PRAGMA table_info(packages)", (err, columns) => {
      if (err) return;
      const columnNames = columns.map(c => c.name);
      if (!columnNames.includes('provider_id')) {
        db.run("ALTER TABLE packages ADD COLUMN provider_id INTEGER");
      }
      if (!columnNames.includes('quota')) {
        db.run("ALTER TABLE packages ADD COLUMN quota INTEGER DEFAULT 0");
      }
      if (!columnNames.includes('latitude')) {
        db.run("ALTER TABLE packages ADD COLUMN latitude REAL");
      }
      if (!columnNames.includes('longitude')) {
        db.run("ALTER TABLE packages ADD COLUMN longitude REAL");
      }

      // Update coordinates for existing dummy packages
      db.run("UPDATE packages SET latitude = -7.7956, longitude = 110.3695 WHERE title = 'Eksplorasi Budaya Yogyakarta' AND latitude IS NULL");
      db.run("UPDATE packages SET latitude = -8.5069, longitude = 115.2625 WHERE title = 'Bali Culture & Tradition' AND latitude IS NULL");
      db.run("UPDATE packages SET latitude = -8.4240, longitude = 115.3593 WHERE title = 'Desa Penglipuran Experience' AND latitude IS NULL");
      db.run("UPDATE packages SET latitude = -2.9700, longitude = 119.9000 WHERE title = 'Toraja Heritage Journey' AND latitude IS NULL");
      db.run("UPDATE packages SET latitude = -7.6079, longitude = 110.2038 WHERE title = 'Borobudur Sunrise Culture' AND latitude IS NULL");

      // Fix broken/incorrect seed image URLs for existing dummy packages
      db.run("UPDATE packages SET image_url = 'https://images.unsplash.com/photo-1727672100642-c8e8dfa7dca3?w=800&q=80&auto=format&fit=crop' WHERE title = 'Toraja Heritage Journey' AND (image_url IS NULL OR image_url LIKE 'https://images.unsplash.com/%' OR image_url LIKE 'https://upload.wikimedia.org/%')");
      db.run("UPDATE packages SET image_url = 'https://images.unsplash.com/photo-1705905343745-6d901a93e946?w=800&q=80&auto=format&fit=crop' WHERE title = 'Borobudur Sunrise Culture' AND (image_url IS NULL OR image_url LIKE 'https://images.unsplash.com/%' OR image_url LIKE 'https://upload.wikimedia.org/%')");
    });

    // Add completed_at column to bookings if it doesn't exist (trip completion)
    db.all("PRAGMA table_info(bookings)", (err, columns) => {
      if (err) return;
      const columnNames = columns.map(c => c.name);
      if (!columnNames.includes('completed_at')) {
        db.run("ALTER TABLE bookings ADD COLUMN completed_at DATETIME");
      }
    });

    db.all("PRAGMA table_info(journey_studio)", (err, columns) => {
      if (err) return;
      const columnNames = columns.map(c => c.name);
      if (!columnNames.includes('booking_id')) {
        db.run("ALTER TABLE journey_studio ADD COLUMN booking_id INTEGER");
      }
      if (!columnNames.includes('title')) {
        db.run("ALTER TABLE journey_studio ADD COLUMN title TEXT");
      }
    });

    // Seed superadmin if not exists
    db.get("SELECT * FROM users WHERE role = 'superadmin'", async (err, row) => {
      if (!row) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        db.run(`INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)`,
          ['Superadmin', 'admin@arahloka.com', hashedPassword, 'superadmin', 'approved']
        );
        console.log('Superadmin seeded.');
      }
    });

    // Seed approved travel providers if they don't exist
    const providers = [
      { name: 'Java Heritage Travel', email: 'provider@arahloka.com', password: 'provider123' },
      { name: 'Bali Culture Trip', email: 'bali@arahloka.com', password: 'provider123' },
      { name: 'Nusantara Culture Tour', email: 'nusantara@arahloka.com', password: 'provider123' }
    ];

    providers.forEach(p => {
      db.get("SELECT * FROM users WHERE email = ?", [p.email], async (err, row) => {
        if (!row) {
          const hashedPassword = await bcrypt.hash(p.password, 10);
          db.run(`INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)`,
            [p.name, p.email, hashedPassword, 'travel_provider', 'approved'],
            (err) => {
              if (!err) console.log(`Provider ${p.name} seeded.`);
            }
          );
        }
      });
    });

    // Check if packages table is empty before seeding
    db.get("SELECT COUNT(*) as count FROM packages", (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }
      if (row.count === 0) {
        seedDatabase();
      } else {
        // Update existing dummy packages with provider_id
        db.all("SELECT id, name, email FROM users WHERE role = 'travel_provider'", (err, users) => {
          if (err || !users) return;
          const javaId = users.find(u => u.email === 'provider@arahloka.com')?.id;
          const baliId = users.find(u => u.email === 'bali@arahloka.com')?.id;
          const nusantaraId = users.find(u => u.email === 'nusantara@arahloka.com')?.id;

          if (javaId) {
            db.run("UPDATE packages SET provider_id = ? WHERE title IN ('Eksplorasi Budaya Yogyakarta', 'Borobudur Sunrise Culture') AND provider_id IS NULL", [javaId]);
          }
          if (baliId) {
            db.run("UPDATE packages SET provider_id = ? WHERE title IN ('Bali Culture & Tradition', 'Desa Penglipuran Experience') AND provider_id IS NULL", [baliId]);
          }
          if (nusantaraId) {
            db.run("UPDATE packages SET provider_id = ? WHERE title = 'Toraja Heritage Journey' AND provider_id IS NULL", [nusantaraId]);
          }
        });
      }
    });
  });
}

function seedDatabase() {
  const packages = [
    {
      title: 'Eksplorasi Budaya Yogyakarta',
      location: 'Yogyakarta',
      description: 'Menelusuri jejak sejarah Keraton Yogyakarta dan kemegahan Candi Prambanan.',
      duration: '3 Hari 2 Malam',
      price: 2500000,
      quota: 15,
      image_url: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&q=80&w=800',
      latitude: -7.7956,
      longitude: 110.3695
    },
    {
      title: 'Bali Culture & Tradition',
      location: 'Ubud, Bali',
      description: 'Rasakan kedamaian spiritual dan keindahan seni tari tradisional di jantung budaya Bali.',
      duration: '4 Hari 3 Malam',
      price: 3800000,
      quota: 10,
      image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800',
      latitude: -8.5069,
      longitude: 115.2625
    },
    {
      title: 'Desa Penglipuran Experience',
      location: 'Bangli, Bali',
      description: 'Mengunjungi salah satu desa terbersih di dunia dan mengenal kehidupan masyarakat adat Bali.',
      duration: '1 Hari',
      price: 750000,
      quota: 20,
      image_url: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&q=80&w=800',
      latitude: -8.4240,
      longitude: 115.3593
    },
    {
      title: 'Toraja Heritage Journey',
      location: 'Tana Toraja, Sulawesi Selatan',
      description: 'Eksplorasi ritual unik Rambu Solo dan arsitektur ikonik rumah adat Tongkonan.',
      duration: '5 Hari 4 Malam',
      price: 4500000,
      quota: 8,
      image_url: 'https://images.unsplash.com/photo-1727672100642-c8e8dfa7dca3?w=800&q=80&auto=format&fit=crop',
      latitude: -2.9700,
      longitude: 119.9000
    },
    {
      title: 'Borobudur Sunrise Culture',
      location: 'Magelang, Jawa Tengah',
      description: 'Menikmati matahari terbit yang magis di candi Buddha terbesar di dunia.',
      duration: '2 Hari 1 Malam',
      price: 1800000,
      quota: 12,
      image_url: 'https://images.unsplash.com/photo-1705905343745-6d901a93e946?w=800&q=80&auto=format&fit=crop',
      latitude: -7.6079,
      longitude: 110.2038
    }
  ];

  const stmt = db.prepare(`INSERT INTO packages (title, location, description, duration, price, quota, image_url, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  packages.forEach((pkg) => {
    stmt.run(pkg.title, pkg.location, pkg.description, pkg.duration, pkg.price, pkg.quota, pkg.image_url, pkg.latitude, pkg.longitude);
  });
  stmt.finalize();
  console.log('Database seeded with dummy packages.');
}

// Middlewares
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

// Input validation helpers
const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

// Reject trip-planner checklist edits when the related trip is already completed
const guardChecklistEditable = (itemId, userId, res, proceed) => {
  db.get(
    "SELECT b.completed_at FROM trip_checklist tc JOIN bookings b ON tc.booking_id = b.id WHERE tc.id = ? AND tc.tourist_id = ?",
    [itemId, userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row && row.completed_at) {
        return res.status(403).json({ message: 'Trip sudah selesai, checklist tidak bisa diubah' });
      }
      proceed();
    }
  );
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", message: "ArahLoka backend is running" });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (isBlank(name) || isBlank(email) || isBlank(password)) {
    return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Format email tidak valid' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ message: 'Password minimal 6 karakter' });
  }
  if (!['tourist', 'travel_provider'].includes(role)) {
    return res.status(400).json({ message: 'Role tidak valid' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const status = role === 'tourist' ? 'approved' : 'pending';
    
    db.run(
      `INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, role, status],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed: users.email')) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
          }
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ 
          message: role === 'tourist' ? 'User registered successfully' : 'User registered, waiting for approval', 
          id: this.lastID,
          status: status
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.status === 'pending') {
      return res.status(403).json({ message: 'Account waiting for superadmin approval' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ message: 'Account was rejected' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  db.get("SELECT id, name, email, role, status FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(user);
  });
});

// Update own profile (name, email, and optionally password)
app.put('/api/profile', authMiddleware, (req, res) => {
  const { name, email, password } = req.body;
  if (isBlank(name) || isBlank(email)) {
    return res.status(400).json({ message: 'Nama dan email wajib diisi' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Format email tidak valid' });
  }
  if (password && password.trim() && String(password).length < 6) {
    return res.status(400).json({ message: 'Password minimal 6 karakter' });
  }

  db.get("SELECT id FROM users WHERE email = ? AND id != ?", [email, req.user.id], async (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existing) return res.status(409).json({ message: 'Email sudah dipakai akun lain' });

    const done = (err) => {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT id, name, email, role, status FROM users WHERE id = ?", [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(user);
      });
    };

    try {
      if (password && password.trim()) {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?", [name, email, hashedPassword, req.user.id], done);
      } else {
        db.run("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, req.user.id], done);
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
});

// Admin Routes
app.get('/api/admin/pending-users', authMiddleware, roleMiddleware(['superadmin']), (req, res) => {
  db.all("SELECT id, name, email, role, status, created_at FROM users WHERE status = 'pending'", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/admin/stats', authMiddleware, roleMiddleware(['superadmin']), (req, res) => {
  const stats = {};
  
  db.serialize(() => {
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => { stats.total_users = row.count; });
    db.get("SELECT COUNT(*) as count FROM users WHERE role = 'tourist'", (err, row) => { stats.total_tourists = row.count; });
    db.get("SELECT COUNT(*) as count FROM users WHERE role = 'travel_provider'", (err, row) => { stats.total_providers = row.count; });
    db.get("SELECT COUNT(*) as count FROM users WHERE role = 'travel_provider' AND status = 'pending'", (err, row) => { stats.pending_providers = row.count; });
    db.get("SELECT COUNT(*) as count FROM users WHERE role = 'travel_provider' AND status = 'approved'", (err, row) => { stats.approved_providers = row.count; });
    db.get("SELECT COUNT(*) as count FROM packages", (err, row) => { stats.total_packages = row.count; });
    db.get("SELECT COUNT(*) as count FROM bookings", (err, row) => { stats.total_bookings = row.count; });
    db.get("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'", (err, row) => { stats.pending_bookings = row.count; });
    db.get("SELECT COUNT(*) as count FROM bookings WHERE status = 'accepted'", (err, row) => { stats.accepted_bookings = row.count; });
    db.get("SELECT COUNT(*) as count FROM bookings WHERE status = 'rejected'", (err, row) => { stats.rejected_bookings = row.count; });
    db.get("SELECT COUNT(*) as count FROM journey_studio WHERE type = 'memory'", (err, row) => { stats.total_memory_cards = row.count; });
    db.get("SELECT COUNT(*) as count FROM journey_studio WHERE type = 'story'", (err, row) => { 
      stats.total_story_challenges = row.count; 
      res.json(stats);
    });
  });
});

app.get('/api/admin/users', authMiddleware, roleMiddleware(['superadmin']), (req, res) => {
  db.all("SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/admin/packages', authMiddleware, roleMiddleware(['superadmin']), (req, res) => {
  const query = `
    SELECT p.id, p.title, p.location, p.price, p.quota, p.created_at, u.name as provider_name, u.email as provider_email
    FROM packages p
    LEFT JOIN users u ON p.provider_id = u.id
    ORDER BY p.created_at DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/admin/bookings', authMiddleware, roleMiddleware(['superadmin']), (req, res) => {
  const query = `
    SELECT b.id, b.travel_date, b.participants, b.status, b.created_at,
           u_tourist.name as tourist_name, u_tourist.email as tourist_email,
           p.title as package_title,
           u_provider.name as provider_name, u_provider.email as provider_email
    FROM bookings b
    JOIN users u_tourist ON b.tourist_id = u_tourist.id
    JOIN packages p ON b.package_id = p.id
    JOIN users u_provider ON p.provider_id = u_provider.id
    ORDER BY b.created_at DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/admin/activity', authMiddleware, roleMiddleware(['superadmin']), (req, res) => {
  const activities = [];
  
  db.all("SELECT 'User baru terdaftar: ' || name as text, created_at FROM users ORDER BY created_at DESC LIMIT 5", [], (err, rows) => {
    if (!err) activities.push(...rows);
    db.all("SELECT 'Paket baru dibuat: ' || title as text, created_at FROM packages ORDER BY created_at DESC LIMIT 5", [], (err, rows) => {
      if (!err) activities.push(...rows);
      db.all("SELECT 'Booking baru dikirim untuk ' || (SELECT title FROM packages WHERE id = package_id) as text, created_at FROM bookings ORDER BY created_at DESC LIMIT 5", [], (err, rows) => {
        if (!err) activities.push(...rows);
        db.all("SELECT 'Story/Memory baru dibagikan: ' || title as text, created_at FROM journey_studio ORDER BY created_at DESC LIMIT 5", [], (err, rows) => {
          if (!err) activities.push(...rows);
          activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          res.json(activities.slice(0, 10));
        });
      });
    });
  });
});

app.patch('/api/admin/users/:id/approve', authMiddleware, roleMiddleware(['superadmin']), (req, res) => {
  db.run("UPDATE users SET status = 'approved' WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User approved successfully' });
  });
});

// Delete a user. Guard: cannot delete self, cannot delete superadmin,
// cannot delete when user still has active (in-progress) bookings.
//   - tourist: any booking where status='accepted' AND completed_at IS NULL,
//              OR status='pending' is considered active.
//   - provider: any booking on their packages where status='accepted' AND
//              completed_at IS NULL, OR status='pending' is considered active.
app.delete('/api/admin/users/:id', authMiddleware, roleMiddleware(['superadmin']), (req, res) => {
  const userId = Number(req.params.id);
  if (!userId) return res.status(400).json({ message: 'User id tidak valid' });
  if (userId === req.user.id) {
    return res.status(400).json({ message: 'Tidak bisa menghapus akun Anda sendiri' });
  }

  db.get("SELECT id, name, role FROM users WHERE id = ?", [userId], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    if (user.role === 'superadmin') {
      return res.status(403).json({ message: 'Akun superadmin tidak bisa dihapus' });
    }

    const activeCondition = "(status = 'pending' OR (status = 'accepted' AND completed_at IS NULL))";
    const activeQuery = user.role === 'tourist'
      ? `SELECT COUNT(*) AS c FROM bookings WHERE tourist_id = ? AND ${activeCondition}`
      : `SELECT COUNT(*) AS c FROM bookings b
         JOIN packages p ON b.package_id = p.id
         WHERE p.provider_id = ? AND ${activeCondition}`;

    db.get(activeQuery, [userId], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row.c > 0) {
        const msg = user.role === 'tourist'
          ? `Tidak bisa menghapus turis: masih ada ${row.c} booking yang sedang berjalan atau menunggu konfirmasi.`
          : `Tidak bisa menghapus provider: masih ada ${row.c} booking aktif yang belum diselesaikan.`;
        return res.status(409).json({ message: msg });
      }

      // Safe to remove. Cascade-clean dependent rows so we don't leave orphans.
      db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        if (user.role === 'tourist') {
          db.run("DELETE FROM trip_checklist WHERE tourist_id = ?", [userId]);
          db.run("DELETE FROM trip_plans WHERE tourist_id = ?", [userId]);
          db.run("DELETE FROM journey_studio WHERE user_id = ?", [userId]);
          db.run("DELETE FROM bookings WHERE tourist_id = ?", [userId]);
        } else if (user.role === 'travel_provider') {
          // Remove bookings on this provider's packages first
          db.run(
            `DELETE FROM bookings WHERE package_id IN (SELECT id FROM packages WHERE provider_id = ?)`,
            [userId]
          );
          db.run("DELETE FROM packages WHERE provider_id = ?", [userId]);
        }
        db.run("DELETE FROM users WHERE id = ?", [userId], function(err) {
          if (err) {
            db.run("ROLLBACK");
            return res.status(500).json({ error: err.message });
          }
          db.run("COMMIT");
          res.json({ message: `Pengguna ${user.name} berhasil dihapus.` });
        });
      });
    });
  });
});

app.patch('/api/admin/users/:id/reject', authMiddleware, roleMiddleware(['superadmin']), (req, res) => {
  db.run("UPDATE users SET status = 'rejected' WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User rejected successfully' });
  });
});

// Provider Package Routes
app.get('/api/provider/packages', authMiddleware, roleMiddleware(['travel_provider']), (req, res) => {
  db.all("SELECT * FROM packages WHERE provider_id = ?", [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Normalize lat/lon: blank -> null, otherwise number. If missing, auto-geocode from location text.
const resolveCoords = async (latitude, longitude, location) => {
  const latNum = isBlank(latitude) ? null : Number(latitude);
  const lonNum = isBlank(longitude) ? null : Number(longitude);
  if (latNum !== null && lonNum !== null && !Number.isNaN(latNum) && !Number.isNaN(lonNum)) {
    return { lat: latNum, lon: lonNum };
  }
  const geo = await geocodeLocation(location);
  if (geo) return { lat: geo.lat, lon: geo.lon };
  return { lat: null, lon: null };
};

app.post('/api/packages', authMiddleware, roleMiddleware(['travel_provider']), async (req, res) => {
  const { title, location, description, duration, price, quota, image_url, latitude, longitude } = req.body;

  if (isBlank(title) || isBlank(location) || isBlank(description) || isBlank(duration)) {
    return res.status(400).json({ message: 'Judul, lokasi, deskripsi, dan durasi paket wajib diisi' });
  }
  if (isBlank(price) || isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ message: 'Harga harus berupa angka dan tidak boleh negatif' });
  }
  if (isBlank(quota) || isNaN(Number(quota)) || Number(quota) < 0) {
    return res.status(400).json({ message: 'Kuota harus berupa angka dan tidak boleh negatif' });
  }

  const { lat, lon } = await resolveCoords(latitude, longitude, location);

  db.run(
    "INSERT INTO packages (provider_id, title, location, description, duration, price, quota, image_url, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [req.user.id, title, location, description, duration, price, quota, image_url, lat, lon],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, message: 'Package created successfully' });
    }
  );
});

app.put('/api/packages/:id', authMiddleware, roleMiddleware(['travel_provider']), async (req, res) => {
  const { title, location, description, duration, price, quota, image_url, latitude, longitude } = req.body;

  if (isBlank(title) || isBlank(location) || isBlank(description) || isBlank(duration)) {
    return res.status(400).json({ message: 'Judul, lokasi, deskripsi, dan durasi paket wajib diisi' });
  }
  if (isBlank(price) || isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ message: 'Harga harus berupa angka dan tidak boleh negatif' });
  }
  if (isBlank(quota) || isNaN(Number(quota)) || Number(quota) < 0) {
    return res.status(400).json({ message: 'Kuota harus berupa angka dan tidak boleh negatif' });
  }

  const { lat, lon } = await resolveCoords(latitude, longitude, location);

  db.run(
    "UPDATE packages SET title = ?, location = ?, description = ?, duration = ?, price = ?, quota = ?, image_url = ?, latitude = ?, longitude = ? WHERE id = ? AND provider_id = ?",
    [title, location, description, duration, price, quota, image_url, lat, lon, req.params.id, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ message: 'Package not found or unauthorized' });
      res.json({ message: 'Package updated successfully' });
    }
  );
});

app.delete('/api/packages/:id', authMiddleware, roleMiddleware(['travel_provider']), (req, res) => {
  db.run(
    "DELETE FROM packages WHERE id = ? AND provider_id = ?",
    [req.params.id, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ message: 'Package not found or unauthorized' });
      res.json({ message: 'Package deleted successfully' });
    }
  );
});

// Public Package Routes
app.get('/api/packages', (req, res) => {
  const query = `
    SELECT p.*, u.name as provider_name, u.email as provider_email
    FROM packages p
    LEFT JOIN users u ON p.provider_id = u.id
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/packages/:id', (req, res) => {
  const query = `
    SELECT p.*, u.name as provider_name, u.email as provider_email
    FROM packages p
    LEFT JOIN users u ON p.provider_id = u.id
    WHERE p.id = ?
  `;
  db.get(query, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ message: 'Package not found' });
    res.json(row);
  });
});

// Booking Routes
app.post('/api/bookings', authMiddleware, roleMiddleware(['tourist']), (req, res) => {
  const { package_id, travel_date, participants, notes } = req.body;

  if (isBlank(package_id)) {
    return res.status(400).json({ message: 'Paket wajib dipilih' });
  }
  if (isBlank(travel_date)) {
    return res.status(400).json({ message: 'Tanggal perjalanan wajib diisi' });
  }
  if (!participants || isNaN(Number(participants)) || Number(participants) < 1) {
    return res.status(400).json({ message: 'Jumlah peserta minimal 1' });
  }

  // Validate package exists
  db.get("SELECT id FROM packages WHERE id = ?", [package_id], (err, pkg) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    db.run(
      "INSERT INTO bookings (tourist_id, package_id, travel_date, participants, notes) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, package_id, travel_date, participants, notes],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, message: 'Booking created successfully' });
      }
    );
  });
});

app.get('/api/bookings/my', authMiddleware, roleMiddleware(['tourist']), (req, res) => {
  const query = `
    SELECT b.*, p.title, p.location, p.price, p.image_url, p.duration 
    FROM bookings b
    JOIN packages p ON b.package_id = p.id
    WHERE b.tourist_id = ?
    ORDER BY b.created_at DESC
  `;
  db.all(query, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/bookings/provider', authMiddleware, roleMiddleware(['travel_provider']), (req, res) => {
  const query = `
    SELECT b.*, u.name as tourist_name, u.email as tourist_email, p.title as package_title
    FROM bookings b
    JOIN packages p ON b.package_id = p.id
    JOIN users u ON b.tourist_id = u.id
    WHERE p.provider_id = ?
    ORDER BY b.created_at DESC
  `;
  db.all(query, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.patch('/api/bookings/:id/status', authMiddleware, roleMiddleware(['travel_provider']), (req, res) => {
  const { status } = req.body;
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  // Ensure the booking belongs to a package owned by this provider
  const verifyQuery = `
    SELECT b.id FROM bookings b
    JOIN packages p ON b.package_id = p.id
    WHERE b.id = ? AND p.provider_id = ?
  `;

  db.get(verifyQuery, [req.params.id, req.user.id], (err, booking) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!booking) return res.status(404).json({ message: 'Booking not found or unauthorized' });

    db.run(
      "UPDATE bookings SET status = ? WHERE id = ?",
      [status, req.params.id],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `Booking ${status} successfully` });
      }
    );
  });
});

// Provider marks an accepted booking as completed (trip finished)
app.patch('/api/bookings/:id/complete', authMiddleware, roleMiddleware(['travel_provider']), (req, res) => {
  // Ensure the booking belongs to a package owned by this provider and is accepted
  const verifyQuery = `
    SELECT b.id, b.status, b.completed_at FROM bookings b
    JOIN packages p ON b.package_id = p.id
    WHERE b.id = ? AND p.provider_id = ?
  `;

  db.get(verifyQuery, [req.params.id, req.user.id], (err, booking) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan atau bukan milik Anda' });
    if (booking.status !== 'accepted') {
      return res.status(400).json({ message: 'Hanya booking yang sudah diterima yang bisa diselesaikan' });
    }
    if (booking.completed_at) {
      return res.status(400).json({ message: 'Trip ini sudah ditandai selesai' });
    }

    db.run(
      "UPDATE bookings SET completed_at = CURRENT_TIMESTAMP WHERE id = ?",
      [req.params.id],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Trip berhasil ditandai selesai' });
      }
    );
  });
});

// Upload Route
app.post('/api/upload', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ image_url: imageUrl });
});

// Trip Planner Routes
app.get('/api/trip-planner/my', authMiddleware, roleMiddleware(['tourist']), (req, res) => {
  const query = `
    SELECT tp.*, p.title as package_title, p.location, b.travel_date
    FROM trip_plans tp
    JOIN packages p ON tp.package_id = p.id
    JOIN bookings b ON tp.booking_id = b.id
    WHERE tp.tourist_id = ?
    GROUP BY tp.booking_id
  `;
  db.all(query, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/trip-planner/:bookingId', authMiddleware, roleMiddleware(['tourist']), (req, res) => {
  const bookingId = req.params.bookingId;
  
  const query = `
    SELECT b.*, p.title, p.location, p.duration, p.image_url, p.description
    FROM bookings b
    JOIN packages p ON b.package_id = p.id
    WHERE b.id = ? AND b.tourist_id = ?
  `;

  db.get(query, [bookingId, req.user.id], (err, booking) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    db.all("SELECT * FROM trip_plans WHERE booking_id = ?", [bookingId], (err, plans) => {
      if (err) return res.status(500).json({ error: err.message });
      
      db.all("SELECT * FROM trip_checklist WHERE booking_id = ?", [bookingId], (err, checklist) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ booking, plans, checklist });
      });
    });
  });
});

app.post('/api/trip-planner/:bookingId/generate', authMiddleware, roleMiddleware(['tourist']), (req, res) => {
  const bookingId = req.params.bookingId;

  const query = `
    SELECT b.*, p.title, p.location, p.duration, p.description
    FROM bookings b
    JOIN packages p ON b.package_id = p.id
    WHERE b.id = ? AND b.tourist_id = ?
  `;

  db.get(query, [bookingId, req.user.id], (err, trip) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!trip) return res.status(404).json({ message: 'Booking not found' });
    if (trip.completed_at) return res.status(403).json({ message: 'Trip sudah selesai, rencana tidak bisa diubah' });

    const durationDays = parseInt(trip.duration) || 1;
    
    // Generate Itineraries
    const dailyPlan = Array.from({ length: durationDays }, (_, i) => 
      `Hari ${i + 1}: Eksplorasi ${trip.location} - Fokus pada destinasi ${trip.title.split(' ')[0]}. Nikmati suasana lokal dan kuliner khas.`
    ).join('\n');

    const timePlan = `08.00 - Persiapan dan sarapan
10.00 - Kunjungan ke objek wisata budaya
12.00 - Istirahat dan makan siang kuliner lokal
14.00 - Aktivitas pengalaman budaya interaktif
17.00 - Kembali ke penginapan, istirahat, dan dokumentasi`;

    // Generate Checklist
    const checklistItems = [
      { name: 'Identitas diri (KTP/Passport)', cat: 'Dokumen' },
      { name: 'Tiket atau bukti booking ArahLoka', cat: 'Dokumen' },
      { name: 'Dompet dan uang tunai secukupnya', cat: 'Barang Pribadi' },
      { name: 'Handphone, charger, dan powerbank', cat: 'Barang Pribadi' },
      { name: 'Obat-obatan pribadi', cat: 'Barang Pribadi' },
      { name: 'Botol minum reusable', cat: 'Perlengkapan Perjalanan' }
    ];

    if (durationDays > 1) {
      checklistItems.push(
        { name: 'Pakaian ganti secukupnya', cat: 'Barang Pribadi' },
        { name: 'Perlengkapan mandi', cat: 'Barang Pribadi' },
        { name: 'Sandal atau sepatu jalan yang nyaman', cat: 'Perlengkapan Perjalanan' }
      );
    }

    const culturalKeywords = ['Bali', 'Yogyakarta', 'Borobudur', 'Toraja', 'Penglipuran', 'Budaya', 'Candi', 'Keraton'];
    if (culturalKeywords.some(key => trip.title.includes(key) || trip.location.includes(key) || trip.description.includes(key))) {
      checklistItems.push(
        { name: 'Pakaian sopan untuk kunjungan budaya', cat: 'Budaya dan Etika Lokal' },
        { name: 'Kain tradisional atau outer (jika diperlukan)', cat: 'Budaya dan Etika Lokal' },
        { name: 'Kamera untuk dokumentasi', cat: 'Barang Pribadi' },
        { name: 'Catatan etika lokal (cek di ArahLoka)', cat: 'Budaya dan Etika Lokal' }
      );
    }

    checklistItems.push(
      { name: 'Payung kecil atau jas hujan lipat', cat: 'Perlengkapan Perjalanan' },
      { name: 'Topi atau kacamata hitam', cat: 'Perlengkapan Perjalanan' },
      { name: 'Sunscreen / Tabir surya', cat: 'Barang Pribadi' }
    );

    db.serialize(() => {
      // Clear existing for this booking
      db.run("DELETE FROM trip_plans WHERE booking_id = ?", [bookingId]);
      
      // Insert Plans
      const stmtPlan = db.prepare("INSERT INTO trip_plans (booking_id, tourist_id, package_id, plan_type, title, content) VALUES (?, ?, ?, ?, ?, ?)");
      stmtPlan.run(bookingId, req.user.id, trip.package_id, 'daily', 'Daily Itinerary', dailyPlan);
      stmtPlan.run(bookingId, req.user.id, trip.package_id, 'time', 'Time Plan', timePlan);
      stmtPlan.finalize();

      // Check if checklist already exists
      db.get("SELECT id FROM trip_checklist WHERE booking_id = ? LIMIT 1", [bookingId], (err, row) => {
        if (!row) {
          const stmtCheck = db.prepare("INSERT INTO trip_checklist (booking_id, tourist_id, item_name, category) VALUES (?, ?, ?, ?)");
          checklistItems.forEach(item => {
            stmtCheck.run(bookingId, req.user.id, item.name, item.cat);
          });
          stmtCheck.finalize();
        }
        res.json({ message: 'Trip Planner generated successfully' });
      });
    });
  });
});

app.patch('/api/trip-planner/checklist/:itemId', authMiddleware, roleMiddleware(['tourist']), (req, res) => {
  guardChecklistEditable(req.params.itemId, req.user.id, res, () => {
    db.run(
      "UPDATE trip_checklist SET is_checked = (NOT is_checked), updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tourist_id = ?",
      [req.params.itemId, req.user.id],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Item not found or unauthorized' });
        res.json({ message: 'Checklist item updated' });
      }
    );
  });
});

app.post('/api/trip-planner/:bookingId/checklist', authMiddleware, roleMiddleware(['tourist']), (req, res) => {
  const { item_name, category } = req.body;
  const bookingId = req.params.bookingId;

  if (!item_name) {
    return res.status(400).json({ message: 'Nama item wajib diisi' });
  }

  // Validate booking belongs to user
  db.get("SELECT id, completed_at FROM bookings WHERE id = ? AND tourist_id = ?", [bookingId, req.user.id], (err, booking) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!booking) return res.status(404).json({ message: 'Booking not found or unauthorized' });
    if (booking.completed_at) return res.status(403).json({ message: 'Trip sudah selesai, checklist tidak bisa diubah' });

    db.run(
      "INSERT INTO trip_checklist (booking_id, tourist_id, item_name, category) VALUES (?, ?, ?, ?)",
      [bookingId, req.user.id, item_name, category || 'Tambahan Pribadi'],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, item_name, category: category || 'Tambahan Pribadi', is_checked: 0 });
      }
    );
  });
});

app.put('/api/trip-planner/checklist/:itemId', authMiddleware, roleMiddleware(['tourist']), (req, res) => {
  const { item_name, category } = req.body;
  
  if (!item_name) {
    return res.status(400).json({ message: 'Nama item wajib diisi' });
  }

  guardChecklistEditable(req.params.itemId, req.user.id, res, () => {
    db.run(
      "UPDATE trip_checklist SET item_name = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tourist_id = ?",
      [item_name, category, req.params.itemId, req.user.id],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Item not found or unauthorized' });
        res.json({ message: 'Checklist item updated successfully' });
      }
    );
  });
});

app.delete('/api/trip-planner/checklist/:itemId', authMiddleware, roleMiddleware(['tourist']), (req, res) => {
  guardChecklistEditable(req.params.itemId, req.user.id, res, () => {
    db.run(
      "DELETE FROM trip_checklist WHERE id = ? AND tourist_id = ?",
      [req.params.itemId, req.user.id],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Item not found or unauthorized' });
        res.json({ message: 'Checklist item deleted successfully' });
      }
    );
  });
});

app.put('/api/trip-planner/:bookingId/plan', authMiddleware, roleMiddleware(['tourist']), (req, res) => {
  const { plan_type, title, content } = req.body;
  const bookingId = req.params.bookingId;

  if (!['daily', 'time'].includes(plan_type)) {
    return res.status(400).json({ message: 'Tipe rencana tidak valid' });
  }
  if (isBlank(title) || isBlank(content)) {
    return res.status(400).json({ message: 'Judul dan isi rencana wajib diisi' });
  }

  // Validate booking belongs to user
  db.get("SELECT package_id, completed_at FROM bookings WHERE id = ? AND tourist_id = ?", [bookingId, req.user.id], (err, booking) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!booking) return res.status(404).json({ message: 'Booking not found or unauthorized' });
    if (booking.completed_at) return res.status(403).json({ message: 'Trip sudah selesai, rencana tidak bisa diubah' });

    db.get("SELECT id FROM trip_plans WHERE booking_id = ? AND plan_type = ?", [bookingId, plan_type], (err, plan) => {
      if (err) return res.status(500).json({ error: err.message });

      if (plan) {
        db.run(
          "UPDATE trip_plans SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [title, content, plan.id],
          function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Itinerary updated successfully' });
          }
        );
      } else {
        db.run(
          "INSERT INTO trip_plans (booking_id, tourist_id, package_id, plan_type, title, content) VALUES (?, ?, ?, ?, ?, ?)",
          [bookingId, req.user.id, booking.package_id, plan_type, title, content],
          function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, message: 'Itinerary created successfully' });
          }
        );
      }
    });
  });
});

// Memory Card Routes
app.post('/api/memory-cards', authMiddleware, roleMiddleware(['tourist']), upload.single('image'), (req, res) => {
  const { booking_id, destination, title, content, rating } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (isBlank(destination) || isBlank(title) || isBlank(content)) {
    return res.status(400).json({ message: 'Destinasi, judul, dan cerita wajib diisi' });
  }

  const saveCard = () => {
    db.run(
      "INSERT INTO journey_studio (user_id, type, booking_id, destination, title, content, rating, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [req.user.id, 'memory', booking_id || null, destination, title, content, rating, image_url],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, message: 'Memory Lane Card saved successfully' });
      }
    );
  };

  if (isBlank(booking_id)) {
    return res.status(400).json({ message: 'Pilih trip yang sudah selesai untuk membuat kartu kenangan' });
  }
  db.get("SELECT completed_at FROM bookings WHERE id = ? AND tourist_id = ?", [booking_id, req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(403).json({ message: 'Booking tidak ditemukan atau bukan milik Anda' });
    if (!row.completed_at) return res.status(400).json({ message: 'Trip belum selesai. Kartu kenangan hanya bisa dibuat setelah trip selesai.' });
    saveCard();
  });
});

app.get('/api/memory-cards/my', authMiddleware, roleMiddleware(['tourist']), (req, res) => {
  db.all("SELECT * FROM journey_studio WHERE user_id = ? AND type = 'memory' ORDER BY created_at DESC", [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/memory-cards', (req, res) => {
  const query = `
    SELECT j.*, u.name as user_name 
    FROM journey_studio j
    JOIN users u ON j.user_id = u.id
    WHERE j.type = 'memory'
    ORDER BY j.created_at DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Story Challenge Routes
app.post('/api/story-challenges', authMiddleware, roleMiddleware(['tourist']), upload.single('image'), (req, res) => {
  const { booking_id, destination, title, content, rating } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (isBlank(destination) || isBlank(title) || isBlank(content)) {
    return res.status(400).json({ message: 'Destinasi, judul, dan cerita wajib diisi' });
  }

  const saveStory = () => {
    db.run(
      "INSERT INTO journey_studio (user_id, type, booking_id, destination, title, content, rating, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [req.user.id, 'story', booking_id || null, destination, title, content, rating, image_url],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, message: 'Story shared successfully' });
      }
    );
  };

  if (isBlank(booking_id)) {
    return res.status(400).json({ message: 'Pilih trip yang sudah selesai untuk membagikan kisah' });
  }
  db.get("SELECT completed_at FROM bookings WHERE id = ? AND tourist_id = ?", [booking_id, req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(403).json({ message: 'Booking tidak ditemukan atau bukan milik Anda' });
    if (!row.completed_at) return res.status(400).json({ message: 'Trip belum selesai. Kisah hanya bisa dibagikan setelah trip selesai.' });
    saveStory();
  });
});

app.get('/api/story-challenges', (req, res) => {
  const query = `
    SELECT j.*, u.name as user_name 
    FROM journey_studio j
    JOIN users u ON j.user_id = u.id
    WHERE j.type = 'story'
    ORDER BY j.created_at DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Legacy generic journey-studio endpoints for compatibility if needed
app.get('/api/journey-studio', (req, res) => {
  const query = `
    SELECT j.*, u.name as user_name 
    FROM journey_studio j
    JOIN users u ON j.user_id = u.id
    ORDER BY j.created_at DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Geocode helper: resolve free-text location -> {lat, lon, name}
// Uses Open-Meteo's free geocoding API (no key required)
const geocodeCache = new Map();
const geocodeLocation = async (location) => {
  const key = String(location).trim().toLowerCase();
  if (!key) return null;
  if (geocodeCache.has(key)) return geocodeCache.get(key);

  // Try the raw query first, then progressively simpler variants
  // (e.g. "Ubud, Bali" -> "Ubud" -> "Bali")
  const variants = [location];
  if (location.includes(',')) {
    location.split(',').forEach(part => {
      const p = part.trim();
      if (p && !variants.includes(p)) variants.push(p);
    });
  }

  for (const q of variants) {
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=id&format=json`;
      const r = await fetch(url);
      if (!r.ok) continue;
      const data = await r.json();
      const hit = data?.results?.[0];
      if (hit && hit.latitude && hit.longitude) {
        const resolved = { lat: hit.latitude, lon: hit.longitude, name: hit.name };
        geocodeCache.set(key, resolved);
        return resolved;
      }
    } catch (e) {
      // try next variant
    }
  }
  geocodeCache.set(key, null);
  return null;
};

// Weather Route
app.get('/api/weather', async (req, res) => {
  let { lat, lon, location } = req.query;

  // Fallback: resolve lat/lon from a location name when not provided
  if ((!lat || !lon) && location) {
    const geo = await geocodeLocation(location);
    if (geo) {
      lat = geo.lat;
      lon = geo.lon;
    }
  }

  if (!lat || !lon) {
    return res.status(400).json({ message: 'Latitude/longitude atau location wajib diisi' });
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather API response not ok');
    const data = await response.json();

    const weatherCodes = {
      0: 'Cerah',
      1: 'Cerah Berawan',
      2: 'Berawan',
      3: 'Mendung',
      45: 'Berkabut',
      48: 'Kabut Berembun',
      51: 'Gerimis Ringan',
      53: 'Gerimis Sedang',
      55: 'Gerimis Lebat',
      61: 'Hujan Ringan',
      63: 'Hujan Sedang',
      65: 'Hujan Lebat',
      80: 'Hujan Showers Ringan',
      81: 'Hujan Showers Sedang',
      82: 'Hujan Showers Lebat',
      95: 'Badai Petir'
    };

    const current = data.current_weather;
    res.json({
      temperature: current.temperature,
      condition: weatherCodes[current.weathercode] || 'Tidak Diketahui',
      windspeed: current.windspeed,
      latitude: lat,
      longitude: lon,
      unit: data.current_weather_units?.temperature || '°C'
    });
  } catch (err) {
    console.error('Weather API Error:', err.message);
    res.status(500).json({ message: 'Gagal mengambil data cuaca' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
