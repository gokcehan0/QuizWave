
import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Statik dosyaları sun
app.use(express.static(path.join(__dirname, '../frontend')));

// JavaScript dosyalarını backend'den serve et
app.use('/js', express.static(__dirname, {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// SVG dosyalarını serve et
app.use('/svg', express.static(path.join(__dirname, 'svg')));

// Quizzes dosyalarını serve et
app.use('/quizzes', express.static(path.join(__dirname, 'quizzes')));

// Ana sayfa route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/main.html'));
});

// Diğer sayfalar için route
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
app.get('/quiz-create', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/quiz-create.html'));
});
app.get('/quiz-view', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/quiz-view.html'));
});

// Firebase Admin SDK başlatma
admin.initializeApp({
  credential: admin.credential.applicationDefault(), // GCP ortamında veya .env ile ayarlanmalı
});

const quizzes = [
  {
    id: 1,
    question: 'Türkiye’nin başkenti neresidir?',
    options: ['İstanbul', 'Ankara', 'İzmir', 'Bursa'],
    answer: 1
  }
];

// Firebase token doğrulama middleware
async function firebaseAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ message: 'Token not found.' });
  const token = header.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token.' });
  }
}

// Quiz ekleme (sadece Firebase ile giriş yapanlar)
app.post('/quiz', firebaseAuth, (req, res) => {
  const { question, options, answer } = req.body;
  if (!question || !options || typeof answer !== 'number') {
    return res.status(400).json({ message: 'Missing data.' });
  }
  quizzes.push({ id: quizzes.length + 1, question, options, answer });
  res.json({ message: 'Quiz added.' });
});

// Quizleri görüntüleme (herkes erişebilir)
app.get('/quiz', (req, res) => {
  res.json(quizzes);
});

app.listen(3002, () => console.log('Backend 3002 portunda çalışıyor'));
