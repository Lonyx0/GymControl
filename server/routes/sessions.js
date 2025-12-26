const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Session = require('../models/Session');

// Helper to sort days
const daysOrder = {
    'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7
};

// @route   GET api/sessions
// @desc    Tüm seans şablonlarını getir
// @access  Public
router.get('/', async (req, res) => {
    try {
        let sessions = await Session.find().sort({ startTime: 1 });
        // Günlere göre sırala (MongoDB sort string enum ile zor)
        sessions.sort((a, b) => {
            const dayDiff = daysOrder[a.dayOfWeek] - daysOrder[b.dayOfWeek];
            if (dayDiff !== 0) return dayDiff;
            return a.startTime.localeCompare(b.startTime);
        });

        res.json(sessions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu hatası');
    }
});

// @route   POST api/sessions
// @desc    Yeni seans şablonu ekle
// @access  Private (Sadece Admin)
router.post('/', auth, async (req, res) => {
    // Admin kontrolü
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Bu işlem için yetkiniz yok.' });
    }

    // date yerine dayOfWeek alıyoruz
    const { title, instructor, dayOfWeek, startTime, duration, type, capacity } = req.body;

    try {
        const newSession = new Session({
            title,
            instructor,
            dayOfWeek, // 'Monday' vb.
            startTime,
            duration,
            type,
            capacity
        });

        const session = await newSession.save();
        res.json(session);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu hatası');
    }
});

// @route   DELETE api/sessions/:id
// @desc    Seans sil
// @access  Private (Sadece Admin)
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Bu işlem için yetkiniz yok.' });
    }

    try {
        let session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ msg: 'Seans bulunamadı' });

        // İlişkili rezervasyonları da silmek gerekebilir veya kalabilir (geçmiş veri)
        // Şimdilik sadece seansı siliyoruz
        await Session.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Seans silindi' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu hatası');
    }
});

module.exports = router;
