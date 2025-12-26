const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const GalleryImage = require('../models/GalleryImage');

// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Benzersiz dosya adı: timestamp-orjinalad
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Sadece resim dosyaları
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
        }
        cb(null, true);
    }
});

// @route   GET api/gallery
// @desc    Tüm resimleri getir
// @access  Public
router.get('/', async (req, res) => {
    try {
        const images = await GalleryImage.find().sort({ createdAt: -1 });
        res.json(images);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu hatası');
    }
});

// @route   POST api/gallery
// @desc    Resim yükle
// @access  Private (Sadece Admin)
router.post('/', [auth, upload.single('image')], async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Bu işlem için yetkiniz yok.' });
    }

    if (!req.file) {
        return res.status(400).json({ msg: 'Lütfen bir resim seçin' });
    }

    try {
        const newImage = new GalleryImage({
            title: req.body.title || 'Adsız',
            imageUrl: `/uploads/${req.file.filename}`
        });

        const image = await newImage.save();
        res.json(image);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu hatası');
    }
});

// @route   DELETE api/gallery/:id
// @desc    Resim sil
// @access  Private (Sadece Admin)
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Bu işlem için yetkiniz yok.' });
    }

    try {
        const image = await GalleryImage.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ msg: 'Resim bulunamadı' });
        }

        // Dosya sisteminden sil
        // Şu anki yol: /uploads/filename.jpg -> __dirname/../uploads/filename.jpg
        // image.imageUrl başında /uploads/ var.
        const filePath = path.join(__dirname, '..', image.imageUrl);

        fs.unlink(filePath, (err) => {
            if (err) console.error("Dosya silinirken hata (veya dosya yok):", err);
        });

        await GalleryImage.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Resim silindi' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu hatası');
    }
});

module.exports = router;
