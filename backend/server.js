const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.resolve(__dirname, 'database', 'arahloka.db');
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

    // Create packages table
    db.run(`CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT,
      duration TEXT,
      price INTEGER,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

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

    // Check if packages table is empty before seeding
    db.get("SELECT COUNT(*) as count FROM packages", (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }
      if (row.count === 0) {
        seedDatabase();
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
      image_url: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Bali Culture & Tradition',
      location: 'Ubud, Bali',
      description: 'Rasakan kedamaian spiritual dan keindahan seni tari tradisional di jantung budaya Bali.',
      duration: '4 Hari 3 Malam',
      price: 3800000,
      image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Desa Penglipuran Experience',
      location: 'Bangli, Bali',
      description: 'Mengunjungi salah satu desa terbersih di dunia dan mengenal kehidupan masyarakat adat Bali.',
      duration: '1 Hari',
      price: 750000,
      image_url: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Toraja Heritage Journey',
      location: 'Tana Toraja, Sulawesi Selatan',
      description: 'Eksplorasi ritual unik Rambu Solo dan arsitektur ikonik rumah adat Tongkonan.',
      duration: '5 Hari 4 Malam',
      price: 4500000,
      image_url: 'https://images.unsplash.com/photo-1621350614838-84241316f06a?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Borobudur Sunrise Culture',
      location: 'Magelang, Jawa Tengah',
      description: 'Menikmati matahari terbit yang magis di candi Buddha terbesar di dunia.',
      duration: '2 Hari 1 Malam',
      price: 1800000,
      image_url: 'https://images.unsplash.com/photo-1596402184320-417d7178b2cd?auto=format&fit=crop&q=80&w=800'
    }
  ];

  const stmt = db.prepare(`INSERT INTO packages (title, location, description, duration, price, image_url) VALUES (?, ?, ?, ?, ?, ?)`);
  packages.forEach((pkg) => {
    stmt.run(pkg.title, pkg.location, pkg.description, pkg.duration, pkg.price, pkg.image_url);
  });
  stmt.finalize();
  console.log('Database seeded with dummy packages.');
}

// Middlewares
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
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

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", message: "ArahLoka backend is running" });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!['tourist', 'travel_provider'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      `INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, role, 'pending'],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed: users.email')) {
            return res.status(400).json({ message: 'Email already exists' });
          }
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'User registered, waiting for approval', id: this.lastID });
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

// Admin Routes
app.get('/api/admin/pending-users', authMiddleware, roleMiddleware(['superadmin']), (req, res) => {
  db.all("SELECT id, name, email, role, status, created_at FROM users WHERE status = 'pending'", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.patch('/api/admin/users/:id/approve', authMiddleware, roleMiddleware(['superadmin']), (req, res) => {
  db.run("UPDATE users SET status = 'approved' WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User approved successfully' });
  });
});

app.patch('/api/admin/users/:id/reject', authMiddleware, roleMiddleware(['superadmin']), (req, res) => {
  db.run("UPDATE users SET status = 'rejected' WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User rejected successfully' });
  });
});

app.get('/api/packages', (req, res) => {
  db.all("SELECT * FROM packages", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
