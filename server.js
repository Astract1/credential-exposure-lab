const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const VULN_DB = path.join(__dirname, 'users-vulnerable.json');
const SECURE_DB = path.join(__dirname, 'users-secure.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readDb(file) {
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

function writeDb(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ==========================================================================
// VULNERABLE: recibe la contrasena en texto plano y la guarda tal cual
// ==========================================================================
app.post('/register', (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  const users = readDb(VULN_DB);
  users.push({
    username,
    email,
    password, // <-- almacenada en texto plano (mala practica)
    createdAt: new Date().toISOString()
  });
  writeDb(VULN_DB, users);
  res.json({ ok: true, message: 'Usuario registrado (version vulnerable)' });
});

// ==========================================================================
// SEGURO: hashea la contrasena con bcrypt antes de almacenarla
// ==========================================================================
app.post('/register-secure', async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const users = readDb(SECURE_DB);
  users.push({
    username,
    email,
    passwordHash, // <-- solo se guarda el hash bcrypt
    createdAt: new Date().toISOString()
  });
  writeDb(SECURE_DB, users);
  res.json({ ok: true, message: 'Usuario registrado (version segura)' });
});

// ==========================================================================
// Endpoints de inspeccion (solo para fines didacticos del laboratorio)
// ==========================================================================
app.get('/admin/vulnerable-data', (_req, res) => res.json(readDb(VULN_DB)));
app.get('/admin/secure-data', (_req, res) => res.json(readDb(SECURE_DB)));

app.post('/admin/reset', (_req, res) => {
  if (fs.existsSync(VULN_DB)) fs.unlinkSync(VULN_DB);
  if (fs.existsSync(SECURE_DB)) fs.unlinkSync(SECURE_DB);
  res.json({ ok: true, message: 'Bases de datos reiniciadas' });
});

app.listen(PORT, () => {
  console.log('\n=== Credential Exposure Lab ===');
  console.log(`Servidor: http://localhost:${PORT}`);
  console.log('');
  console.log(`  Version vulnerable: http://localhost:${PORT}/index.html`);
  console.log(`  Version segura:     http://localhost:${PORT}/secure.html`);
  console.log('');
  console.log('Datos almacenados (inspeccion):');
  console.log(`  Vulnerable: http://localhost:${PORT}/admin/vulnerable-data`);
  console.log(`  Seguro:     http://localhost:${PORT}/admin/secure-data`);
  console.log('');
});
