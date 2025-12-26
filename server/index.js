require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.set('trust proxy', 1); // Render vb. proxy arkasında çalışırken IP'yi doğru almak için gerekli
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const allowedOrigins = ["http://localhost:3000"];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
  // Remove trailing slash if exists in env, just in case
  const urlWithSlash = process.env.CLIENT_URL.endsWith('/') ? process.env.CLIENT_URL : `${process.env.CLIENT_URL}/`;
  const urlWithoutSlash = process.env.CLIENT_URL.endsWith('/') ? process.env.CLIENT_URL.slice(0, -1) : process.env.CLIENT_URL;
  if (!allowedOrigins.includes(urlWithSlash)) allowedOrigins.push(urlWithSlash);
  if (!allowedOrigins.includes(urlWithoutSlash)) allowedOrigins.push(urlWithoutSlash);
}

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

let onlineUsers = 0;

io.on('connection', (socket) => {
  onlineUsers++;
  io.emit('activeUsers', onlineUsers);

  socket.on('disconnect', () => {
    onlineUsers--;
    io.emit('activeUsers', onlineUsers);
  });
});
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Veritabanı Bağlantısı
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch((err) => console.error('MongoDB bağlantı hatası:', err));

// Route Tanımları
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/users', require('./routes/users'));
app.use('/api/visitors', require('./routes/visitors'));
app.use('/api/profile', require('./routes/profile'));

// Statik klasör (Resimler için)
app.use('/uploads', express.static('uploads'));

// Basit Route
app.get('/', (req, res) => {
  res.send('Spor Salonu Rezervasyon Sistemi API');
});

// Sunucuyu Başlat
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
