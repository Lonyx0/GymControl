const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Reservation = require('../models/Reservation');
const Session = require('../models/Session');
const User = require('../models/User');

// @route   POST api/reservations
// @desc    Seansa rezervasyon yap (Tarih bazlı)
// @access  Private
router.post('/', auth, async (req, res) => {
    const { sessionId, sessionDate } = req.body; // sessionDate: YYYY-MM-DD

    try {
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ msg: 'Seans bulunamadı' });
        }

        // 1. Kapasite Kontrolü (Dinamik)
        const currentCount = await Reservation.countDocuments({
            session: sessionId,
            sessionDate: sessionDate,
            status: 'active'
        });

        if (currentCount >= session.capacity) {
            return res.status(400).json({ msg: 'Seans kapasitesi dolu.' });
        }

        // 2. Cinsiyet Kontrolü
        const user = await User.findById(req.user.id);
        if (session.type !== 'mixed' && session.type !== user.gender) {
            return res.status(400).json({ msg: `Bu seans sadece ${session.type === 'male' ? 'erkekler' : 'kadınlar'} içindir.` });
        }

        // 3. Daha önce rezervasyon yapmış mı?
        const existingReservation = await Reservation.findOne({
            user: req.user.id,
            session: sessionId,
            sessionDate: sessionDate,
            status: 'active'
        });

        if (existingReservation) {
            return res.status(400).json({ msg: 'Bu seansa zaten rezervasyonunuz var.' });
        }

        // Rezervasyonu Oluştur
        const newReservation = new Reservation({
            user: req.user.id,
            session: sessionId,
            sessionDate: sessionDate
        });

        await newReservation.save();

        // Session modelinde enrollment artırmaya gerek yok artık, dinamik sayıyoruz.

        res.json(newReservation);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu hatası');
    }
});

// @route   GET api/reservations/my
// @desc    Kullanıcının kendi rezervasyonlarını listele
// @access  Private
router.get('/my', auth, async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.user.id })
            .populate('session')
            .sort({ sessionDate: 1, createdAt: -1 }); // Tarihe göre sırala
        res.json(reservations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu hatası');
    }
});

// @route   DELETE api/reservations/:id
// @desc    Rezervasyon İptal Et
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ msg: 'Rezervasyon bulunamadı' });
        }

        if (reservation.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Yetkisiz işlem' });
        }

        // Hard delete veya status change. Cancelled yapalım ki geçmiş görülsün mü? Kullanıcı silmek isterse silsin.
        // Kullanıcı talebi iptal etmek.
        await Reservation.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Rezervasyon iptal edildi' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu hatası');
    }
});

// @route   GET api/reservations/session/:sessionId
// @desc    Bir seansa (ve opsiyonel tarihe) yapılan rezervasyonları listele (Admin)
// @access  Private (Admin)
router.get('/session/:sessionId', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Yetkisiz işlem' });
    }

    const { date } = req.query; // Opsiyonel tarih filtresi
    const filter = { session: req.params.sessionId };
    if (date) {
        filter.sessionDate = date;
    }

    try {
        const reservations = await Reservation.find(filter)
            .populate('user', 'name email gender')
            .sort({ sessionDate: 1, createdAt: 1 });
        res.json(reservations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu hatası');
    }
});

// @route GET api/reservations/counts
// @desc Belirli bir tarih aralığındaki seanslar için doluluk sayılarını getir (Frontend optimizasyonu)
// @access Public (veya Private)
router.get('/counts', async (req, res) => {
    // Basitçe tüm active rezervasyonları gruplayıp dönebiliriz veya query params ile filtreleyebiliriz.
    // Şimdilik tüm aktif rezervasyon sayılarını session+date bazında dönelim.
    try {
        const counts = await Reservation.aggregate([
            { $match: { status: 'active' } },
            {
                $group: {
                    _id: { session: "$session", date: "$sessionDate" },
                    count: { $sum: 1 }
                }
            }
        ]);
        // Format: { "sessionId_YYYY-MM-DD": count }
        const countMap = {};
        counts.forEach(c => {
            countMap[`${c._id.session}_${c._id.date}`] = c.count;
        });
        res.json(countMap);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
