const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

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

    // Check if table is empty before seeding
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

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", message: "ArahLoka backend is running" });
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
