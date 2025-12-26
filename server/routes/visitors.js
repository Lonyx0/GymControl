const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');

// Ziyaretçi sayısını getir ve yeni ziyaretçiyi (IP yoksa) kaydet
router.post('/', async (req, res) => {
    try {
        // req.ip works best with app.set('trust proxy', 1)
        let ip = req.ip;

        // Fallback or explicit check if req.ip gives ::1 or similar local
        if (req.headers['x-forwarded-for']) {
            ip = req.headers['x-forwarded-for'].split(',')[0].trim();
        } else if (!ip || ip === '::1') {
            ip = req.socket.remoteAddress;
        }

        // Bu IP veritabanında var mı?
        let visitor = await Visitor.findOne({ ip });

        if (!visitor) {
            // Yoksa yeni oluştur
            visitor = new Visitor({ ip });
            await visitor.save();
        } else {
            // Varsa son ziyaret zamanını güncelle
            visitor.lastVisit = Date.now();
            await visitor.save();
        }

        // Toplam ziyaretçi sayısını döndür
        const count = await Visitor.countDocuments();
        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Sadece sayıyı getir (Görüntüleme amaçlı)
router.get('/', async (req, res) => {
    try {
        const count = await Visitor.countDocuments();
        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
