require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
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
