const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const VULN_DB = path.join(__dirname, 'users-vulnerable.json');

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
// Endpoint de inspeccion (solo para fines didacticos del laboratorio)
// ==========================================================================
app.get('/admin/vulnerable-data', (_req, res) => res.json(readDb(VULN_DB)));

app.post('/admin/reset', (_req, res) => {
  if (fs.existsSync(VULN_DB)) fs.unlinkSync(VULN_DB);
  res.json({ ok: true, message: 'Base de datos reiniciada' });
});

app.listen(PORT, () => {
  console.log('\n=== Credential Exposure Lab ===');
  console.log(`Servidor: http://localhost:${PORT}`);
  console.log('');
  console.log(`  Formulario:        http://localhost:${PORT}/index.html`);
  console.log(`  Datos almacenados: http://localhost:${PORT}/admin/vulnerable-data`);
  console.log('');
});
