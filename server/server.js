import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for playlist data

// Database Setup
const dbPath = join(__dirname, 'music_app.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('✅ Connected to the SQLite database.');
        initializeDb();
    }
});

function initializeDb() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName TEXT,
            lastName TEXT,
            email TEXT UNIQUE,
            password TEXT,
            birthDate TEXT,
            country TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Playlists Table
        db.run(`CREATE TABLE IF NOT EXISTS playlists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT,
            name TEXT,
            type TEXT,
            preferences TEXT,
            tracks TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_email) REFERENCES users(email)
        )`);
    });
}

// --- API Routes ---

// Save User
app.post('/api/users', (req, res) => {
    const { firstName, lastName, email, password, birthDate, country } = req.body;
    const sql = `INSERT OR REPLACE INTO users (firstName, lastName, email, password, birthDate, country) VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(sql, [firstName, lastName, email, password, birthDate, country], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, message: "User saved successfully" });
    });
});

// Get All Users (Admin)
app.get('/api/users', (req, res) => {
    db.all("SELECT id, firstName, lastName, email, birthDate, country, created_at FROM users ORDER BY created_at DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Save Playlist
app.post('/api/playlists', (req, res) => {
    const { userEmail, name, type, preferences, tracks } = req.body;
    const sql = `INSERT INTO playlists (user_email, name, type, preferences, tracks) VALUES (?, ?, ?, ?, ?)`;

    // Store complex objects as JSON strings
    const prefString = JSON.stringify(preferences);
    const tracksString =JSON.stringify(tracks);

    db.run(sql, [userEmail, name, type, prefString, tracksString], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, message: "Playlist saved successfully" });
    });
});

// Get All Playlists (Admin)
app.get('/api/playlists', (req, res) => {
    db.all("SELECT * FROM playlists ORDER BY created_at DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});