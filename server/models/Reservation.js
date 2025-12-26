const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  sessionDate: {
    type: String, // YYYY-MM-DD
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active'
  }
});

// Bir kullanıcı aynı seansa aynı gün için iki kere rezervasyon yapamasın
ReservationSchema.index({ user: 1, session: 1, sessionDate: 1 }, { unique: true });

module.exports = mongoose.model('Reservation', ReservationSchema);
