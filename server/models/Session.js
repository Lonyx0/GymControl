const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  instructor: {
    type: String, // İleride User ile ilişkilendirilebilir, şimdilik String
    required: false
  },
  dayOfWeek: {
    type: String, // 'Monday', 'Tuesday', ...
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  startTime: {
    type: String, // Örn: "14:00"
    required: true
  },
  duration: {
    type: Number, // Dakika cinsinden
    default: 60
  },
  type: {
    type: String,
    enum: ['male', 'female', 'mixed'], // Erkek, Kadın, Karma
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Session', SessionSchema);
