const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Announcement = require('../models/Announcement');

// @route   GET api/announcements
// @desc    Tüm duyuruları getir
// @access  Public (veya User)
router.get('/', async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu hatası');
    }
});

// @route   POST api/announcements
// @desc    Yeni duyuru ekle
// @access  Private (Sadece Admin)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Bu işlem için yetkiniz yok.' });
    }

    const { title, content } = req.body;

    try {
        const newAnnouncement = new Announcement({
            title,
            content
        });

        const announcement = await newAnnouncement.save();
        res.json(announcement);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu hatası');
    }
});

// @route   DELETE api/announcements/:id
// @desc    Duyuru sil
// @access  Private (Sadece Admin)
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Bu işlem için yetkiniz yok.' });
    }

    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ msg: 'Duyuru bulunamadı' });
        }

        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Duyuru silindi' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu hatası');
    }
});

module.exports = router;
