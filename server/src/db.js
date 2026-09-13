const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial state schema
const defaultState = {
  users: [],
  resources: [],
  downloads: [],
  password_resets: []
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultState, null, 2), 'utf8');
      return defaultState;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file:', err);
    return defaultState;
  }
}

function writeDb(data) {
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing to database file:', err);
    // Fallback direct write
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  }
}

// User methods
const Users = {
  list(search = '') {
    const db = readDb();
    let list = db.users || [];
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) || 
        (u.email && u.email.toLowerCase().includes(q))
      );
    }
    // NEVER return password_hash to callers, especially admin or user listings
    return list.map(({ password_hash, ...safeUser }) => safeUser);
  },

  findById(id, includePassword = false) {
    const db = readDb();
    const user = (db.users || []).find(u => u.id === id);
    if (!user) return null;
    if (includePassword) return { ...user };
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  findByEmail(email, includePassword = false) {
    if (!email) return null;
    const db = readDb();
    const user = (db.users || []).find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) return null;
    if (includePassword) return { ...user };
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  create({ name, email, password_hash, role = 'user' }) {
    const db = readDb();
    const now = new Date().toISOString();
    const newUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password_hash,
      role: role || 'user',
      status: 'active',
      created_at: now,
      last_login_at: now,
      download_count: 0
    };
    db.users.push(newUser);
    writeDb(db);
    const { password_hash: _, ...safeUser } = newUser;
    return safeUser;
  },

  update(id, updates) {
    const db = readDb();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    db.users[index] = { ...db.users[index], ...updates };
    writeDb(db);
    const { password_hash, ...safeUser } = db.users[index];
    return safeUser;
  },

  updateLastLogin(id) {
    return this.update(id, { last_login_at: new Date().toISOString() });
  },

  updatePassword(id, password_hash) {
    const db = readDb();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    db.users[index].password_hash = password_hash;
    writeDb(db);
    return true;
  }
};

// Resource methods
const Resources = {
  list(topic = '') {
    const db = readDb();
    let list = db.resources || [];
    if (topic && topic.trim() && topic.toLowerCase() !== 'all') {
      const t = topic.trim().toLowerCase();
      list = list.filter(r => r.topic && r.topic.toLowerCase() === t);
    }
    return list;
  },

  findById(id) {
    const db = readDb();
    return (db.resources || []).find(r => r.id === id) || null;
  },

  create({ title, description, topic, file_name, file_path, file_size, author = 'DigitalDefender Security Team' }) {
    const db = readDb();
    const newResource = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      topic: topic.trim(),
      file_name,
      file_path,
      file_size: file_size || 'Unknown',
      author,
      download_count: 0,
      created_at: new Date().toISOString()
    };
    db.resources.push(newResource);
    writeDb(db);
    return newResource;
  },

  delete(id) {
    const db = readDb();
    const resource = db.resources.find(r => r.id === id);
    if (!resource) return null;
    db.resources = db.resources.filter(r => r.id !== id);
    writeDb(db);
    return resource;
  }
};

// Download tracking
const Downloads = {
  record(userId, resourceId) {
    const db = readDb();
    const now = new Date().toISOString();
    
    // Create download log entry
    const logEntry = {
      id: crypto.randomUUID(),
      user_id: userId,
      resource_id: resourceId,
      downloaded_at: now
    };
    db.downloads.push(logEntry);

    // Increment user's download count
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.download_count = (user.download_count || 0) + 1;
    }

    // Increment resource's download count
    const resource = db.resources.find(r => r.id === resourceId);
    if (resource) {
      resource.download_count = (resource.download_count || 0) + 1;
    }

    writeDb(db);
    return {
      logEntry,
      userDownloadCount: user ? user.download_count : 0,
      resourceDownloadCount: resource ? resource.download_count : 0
    };
  },

  listByUser(userId) {
    const db = readDb();
    return (db.downloads || []).filter(d => d.user_id === userId);
  },

  totalCount() {
    const db = readDb();
    return (db.downloads || []).length;
  }
};

// Password Resets
const PasswordResets = {
  create(userId) {
    const db = readDb();
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    const record = {
      id: crypto.randomUUID(),
      user_id: userId,
      token,
      expires_at: expiresAt,
      used: false,
      created_at: new Date().toISOString()
    };
    db.password_resets.push(record);
    writeDb(db);
    return token;
  },

  findByToken(token) {
    if (!token) return null;
    const db = readDb();
    const record = (db.password_resets || []).find(r => r.token === token);
    if (!record) return null;
    if (record.used) return null;
    if (new Date(record.expires_at) < new Date()) return null;
    return record;
  },

  markUsed(token) {
    const db = readDb();
    const record = db.password_resets.find(r => r.token === token);
    if (record) {
      record.used = true;
      writeDb(db);
      return true;
    }
    return false;
  }
};

// Admin Stats
function getStats() {
  const db = readDb();
  const totalUsers = (db.users || []).length;
  const activeUsers = (db.users || []).filter(u => u.status === 'active').length;
  const totalDownloads = (db.downloads || []).length;
  const totalResources = (db.resources || []).length;

  return {
    totalUsers,
    activeUsers,
    totalDownloads,
    totalResources
  };
}

module.exports = {
  readDb,
  writeDb,
  Users,
  Resources,
  Downloads,
  PasswordResets,
  getStats
};
