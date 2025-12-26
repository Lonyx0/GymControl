const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/users
// @desc    Tüm kullanıcıları getir
// @access  Private (Sadece Admin)
router.get('/', auth, async (req, res) => {
    try {
        // Rol kontrolü
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Bu işlem için yetkiniz yok.' });
        }

        // Şifre hariç tüm bilgileri getir
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu hatası');
    }
});

// @route   DELETE api/users/:id
// @desc    Kullanıcıyı sil
// @access  Private (Sadece Admin)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Bu işlem için yetkiniz yok.' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'Kullanıcı bulunamadı' });
        }

        // Admin kendini silemesin (İsteğe bağlı güvenlik)
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ msg: 'Kendinizi silemezsiniz.' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Kullanıcı silindi' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu hatası');
    }
});

module.exports = router;
