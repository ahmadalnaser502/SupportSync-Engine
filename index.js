require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs'); // مكتبة النظام لقراءة الملفات

const app = express();
const port = process.env.PORT || 3000;
const appHost = process.env.APP_HOST || 'localhost';

// --- معالجة Swagger ديناميكياً ---
// 1. قراءة ملف الـ JSON
const swaggerRawData = fs.readFileSync('./swagger.json');
let swaggerDocument = JSON.parse(swaggerRawData);

// 2. حقن القيم من ملف .env داخل كائن الـ Swagger
swaggerDocument.servers[0].url = `http://${appHost}:${port}`;

// 3. تشغيل الواجهة بالبيانات المحقونة
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- بقية كود السيرفر ---
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) console.error('❌ DB Connection Error:', err.message);
  else console.log('✅ Connected to MySQL on vm-3');
});

app.get('/api/tickets', (req, res) => {
  db.query('SELECT * FROM tickets', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.get('/', (req, res) => {
  res.send('SupportSync Engine Online. Check /api-docs');
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://${appHost}:${port}`);
  console.log(`📖 Dynamic Swagger: http://${appHost}:${port}/api-docs`);
});