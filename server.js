require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const { QUESTIONS, calculateScores } = require('./scoring-config');

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || 'ayuressence-development-secret';
const useMemory = String(process.env.ALLOW_MEMORY_FALLBACK || 'true').toLowerCase() === 'true';
let pool;
let databaseReady = false;
let nextIds = { user: 1, patient: 1, assessment: 1, answer: 1 };
const memory = { users: [], patients: [], assessments: [], answers: [] };

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function tokenFor(user) { return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' }); }
function cleanUser(user) { return { id: user.id, name: user.name, email: user.email, role: user.role }; }
function required(value, label) { if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required.`); return value.trim(); }
function integer(value, label, min, max) { const parsed = Number(value); if (!Number.isInteger(parsed) || parsed < min || parsed > max) throw new Error(`${label} must be between ${min} and ${max}.`); return parsed; }
function auth(req, res, next) { try { const header = req.headers.authorization || ''; if (!header.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required.' }); req.user = jwt.verify(header.slice(7), JWT_SECRET); next(); } catch { return res.status(401).json({ error: 'Invalid or expired session.' }); } }
function fail(res, error) { const message = error.message || 'Request could not be completed.'; const status = /required|must be|already registered|not found|answer every/i.test(message) ? 400 : 500; return res.status(status).json({ error: message }); }

async function initDatabase() {
  try {
    pool = mysql.createPool({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, waitForConnections: true, connectionLimit: 10 });
    await pool.query('SELECT 1');
    databaseReady = true;
    console.log('MySQL connected.');
  } catch (error) {
    if (!useMemory) throw error;
    console.warn('MySQL unavailable; using in-memory demo storage. Configure .env for persistence.');
  }
}
async function findUserByEmail(email) { if (databaseReady) { const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]); return rows[0]; } return memory.users.find((user) => user.email === email); }
async function getUser(id) { if (databaseReady) { const [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [id]); return rows[0]; } return memory.users.find((user) => user.id === Number(id)); }
async function createUser(data) { if (databaseReady) { const [result] = await pool.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [data.name, data.email, data.passwordHash, data.role]); return { ...data, id: result.insertId }; } const user = { ...data, id: nextIds.user++ }; memory.users.push(user); return user; }
async function userPatient(id, userId) { if (databaseReady) { const [rows] = await pool.query('SELECT * FROM patients WHERE id = ? AND user_id = ?', [id, userId]); return rows[0]; } return memory.patients.find((patient) => patient.id === Number(id) && patient.user_id === Number(userId)); }

app.get('/api/health', (req, res) => res.json({ ok: true, database: databaseReady ? 'mysql' : 'memory-demo' }));
app.post('/api/register', async (req, res) => { try { const name = required(req.body.name, 'Name'); const email = required(req.body.email, 'Email').toLowerCase(); const password = required(req.body.password, 'Password'); const role = ['doctor', 'student'].includes(req.body.role) ? req.body.role : null; if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Enter a valid email address.'); if (password.length < 8) throw new Error('Password must be at least 8 characters.'); if (!role) throw new Error('Role must be doctor or student.'); if (await findUserByEmail(email)) throw new Error('An account with this email already exists.'); const user = await createUser({ name, email, passwordHash: await bcrypt.hash(password, 12), role }); res.status(201).json({ token: tokenFor(user), user: cleanUser(user) }); } catch (error) { fail(res, error); } });
app.post('/api/login', async (req, res) => { try { const email = required(req.body.email, 'Email').toLowerCase(); const password = required(req.body.password, 'Password'); const user = await findUserByEmail(email); if (!user || !(await bcrypt.compare(password, user.password_hash || user.passwordHash))) return res.status(401).json({ error: 'Email or password is incorrect.' }); res.json({ token: tokenFor(user), user: cleanUser(user) }); } catch (error) { fail(res, error); } });
app.get('/api/me', auth, async (req, res) => { const user = await getUser(req.user.id); if (!user) return res.status(404).json({ error: 'User not found.' }); res.json({ user }); });
app.get('/api/questions', auth, (req, res) => res.json({ questions: QUESTIONS.map(({ weights, ...question }) => question) }));

app.get('/api/patients', auth, async (req, res) => { if (databaseReady) { const [rows] = await pool.query('SELECT * FROM patients WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]); return res.json({ patients: rows }); } res.json({ patients: memory.patients.filter((patient) => patient.user_id === req.user.id).sort((a, b) => b.id - a.id) }); });
app.post('/api/patients', auth, async (req, res) => { try { const name = required(req.body.name, 'Patient name'); const age = integer(req.body.age, 'Age', 0, 130); const gender = required(req.body.gender, 'Gender'); const phone = String(req.body.phone || '').trim(); const notes = String(req.body.notes || '').trim(); if (databaseReady) { const [result] = await pool.query('INSERT INTO patients (user_id, name, age, gender, phone, notes) VALUES (?, ?, ?, ?, ?, ?)', [req.user.id, name, age, gender, phone, notes]); return res.status(201).json({ patient: { id: result.insertId, user_id: req.user.id, name, age, gender, phone, notes } }); } const patient = { id: nextIds.patient++, user_id: req.user.id, name, age, gender, phone, notes, created_at: new Date().toISOString() }; memory.patients.push(patient); res.status(201).json({ patient }); } catch (error) { fail(res, error); } });
app.get('/api/patients/:id', auth, async (req, res) => { const patient = await userPatient(req.params.id, req.user.id); if (!patient) return res.status(404).json({ error: 'Patient not found.' }); res.json({ patient }); });

app.post('/api/assessments', auth, async (req, res) => { try { const patient = await userPatient(req.body.patientId, req.user.id); if (!patient) throw new Error('Patient not found.'); const observations = String(req.body.observations || '').trim(); if (observations.length > 5000) throw new Error('Observations must be 5,000 characters or fewer.'); const { totals, percentages, dominant } = calculateScores(req.body.answers || {}); if (databaseReady) { const connection = await pool.getConnection(); try { await connection.beginTransaction(); const [result] = await connection.query('INSERT INTO assessments (patient_id, user_id, observations, vata_pct, pitta_pct, kapha_pct, dominant_dosha) VALUES (?, ?, ?, ?, ?, ?, ?)', [patient.id, req.user.id, observations, percentages.Vata, percentages.Pitta, percentages.Kapha, dominant]); const assessmentId = result.insertId; for (const question of QUESTIONS) await connection.query('INSERT INTO assessment_answers (assessment_id, question_id, response_value) VALUES (?, ?, ?)', [assessmentId, question.id, req.body.answers[question.id]]); await connection.commit(); return res.status(201).json({ assessment: { id: assessmentId, patient, observations, totals, percentages, dominant } }); } finally { connection.release(); } } const assessment = { id: nextIds.assessment++, patient_id: patient.id, user_id: req.user.id, observations, vata_pct: percentages.Vata, pitta_pct: percentages.Pitta, kapha_pct: percentages.Kapha, dominant_dosha: dominant, dominant, totals, percentages, answers: req.body.answers, created_at: new Date().toISOString() }; memory.assessments.push(assessment); res.status(201).json({ assessment: { ...assessment, patient } }); } catch (error) { fail(res, error); } });
app.get('/api/assessments', auth, async (req, res) => { if (databaseReady) { const [rows] = await pool.query('SELECT a.*, p.name AS patient_name FROM assessments a JOIN patients p ON p.id = a.patient_id WHERE a.user_id = ? ORDER BY a.created_at DESC', [req.user.id]); return res.json({ assessments: rows }); } const rows = memory.assessments.filter((a) => a.user_id === req.user.id).map((a) => ({ ...a, patient_name: memory.patients.find((p) => p.id === a.patient_id)?.name || 'Unknown' })); res.json({ assessments: rows }); });
app.get('/api/assessments/:id', auth, async (req, res) => { if (databaseReady) { const [rows] = await pool.query('SELECT a.*, p.name AS patient_name, p.age, p.gender, p.phone, p.notes, u.name AS assessor_name, u.role AS assessor_role FROM assessments a JOIN patients p ON p.id = a.patient_id JOIN users u ON u.id = a.user_id WHERE a.id = ? AND a.user_id = ?', [req.params.id, req.user.id]); if (!rows[0]) return res.status(404).json({ error: 'Assessment not found.' }); const [answers] = await pool.query('SELECT question_id, response_value FROM assessment_answers WHERE assessment_id = ?', [req.params.id]); return res.json({ assessment: { ...rows[0], answers } }); } const assessment = memory.assessments.find((a) => a.id === Number(req.params.id) && a.user_id === req.user.id); if (!assessment) return res.status(404).json({ error: 'Assessment not found.' }); const patient = memory.patients.find((p) => p.id === assessment.patient_id); const user = memory.users.find((u) => u.id === req.user.id); res.json({ assessment: { ...assessment, patient_name: patient.name, age: patient.age, gender: patient.gender, phone: patient.phone, notes: patient.notes, assessor_name: user.name, assessor_role: user.role } }); });

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
initDatabase().then(() => app.listen(PORT, () => console.log(`AyurEssence running at http://localhost:${PORT}`))).catch((error) => { console.error('Unable to start:', error.message); process.exit(1); });
