const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @route   POST api/auth/register
// @desc    Kullanıcı kaydı
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, gender, role } = req.body;

    try {
        // Kullanıcı var mı kontrol et
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'Bu e-posta adresi zaten kayıtlı.' });
        }

        const user = new User({
            name,
            email,
            password,
            gender,
            role: role || 'user'
        });

        // Şifreyi hashle
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Token oluştur
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, role: user.role, gender: user.gender } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu hatası');
    }
});

// @route   POST api/auth/login
// @desc    Kullanıcı girişi
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Geçersiz kimlik bilgileri.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Geçersiz kimlik bilgileri.' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, role: user.role, gender: user.gender } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu hatası');
    }
});

// @route   POST api/auth/forgotpassword
// @desc    Şifre sıfırlama e-postası gönder
// @access  Public
router.post('/forgotpassword', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ msg: 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı' });
        }

        // Reset Token Oluştur
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hashle ve kaydet
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // 10 dakika geçerli
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Reset URL
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

        const message = `
        Şifrenizi sıfırlamak için aşağıdaki linke tıklayın: \n\n ${resetUrl} \n\n
        Bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Şifre Sıfırlama İsteği',
                message
            });

            res.status(200).json({ success: true, data: 'E-posta gönderildi' });
        } catch (err) {
            console.error(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ msg: 'E-posta gönderilemedi' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu hatası');
    }
});

// @route   PUT api/auth/resetpassword/:resettoken
// @desc    Yeni şifre belirle
// @access  Public
router.put('/resetpassword/:resettoken', async (req, res) => {
    try {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ msg: 'Geçersiz veya süresi dolmuş token' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, data: 'Şifre güncellendi' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu hatası');
    }
});

module.exports = router;
