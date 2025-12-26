"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { fetchApi } from '../../utils/api';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        gender: 'male',
    });
    const [verificationCode, setVerificationCode] = useState('');
    const [step, setStep] = useState<'register' | 'verify'>('register');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(formData.email)) {
            setError('Lütfen geçerli bir e-posta adresi giriniz.');
            return;
        }

        try {
            const data = await fetchApi('/auth/register', {
                method: 'POST',
                body: formData
            });

            setStep('verify');
            setError('');
            alert(data.msg); // "Doğrulama kodu gönderildi"
        } catch (err: any) {
            setError(err.message || 'Kayıt olurken bir hata oluştu');
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const data = await fetchApi('/auth/verify', {
                method: 'POST',
                body: {
                    email: formData.email,
                    code: verificationCode
                }
            });

            login(data.token, data.user);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Doğrulama hatası');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Navbar />
            <div className="flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
                        {step === 'register' ? 'Yeni Hesap Oluştur' : 'E-posta Doğrulama'}
                    </h2>

                    {step === 'verify' && (
                        <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
                            Lütfen <span className="font-semibold">{formData.email}</span> adresine gönderilen 6 haneli kodu giriniz.
                        </p>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {step === 'register' ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Ad Soyad
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    E-Posta Adresi
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Şifre
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Cinsiyet
                                </label>
                                <select
                                    name="gender"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="male">Erkek</option>
                                    <option value="female">Kadın</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                                    Seanslar cinsiyetinize göre listelenecektir.
                                </p>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Kayıt Ol
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-2">
                                    Doğrulama Kodu
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    required
                                    className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center text-3xl tracking-[0.5em] font-mono"
                                    placeholder="------"
                                    maxLength={6}
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                />
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    Doğrula ve Giriş Yap
                                </button>
                            </div>

                            <div className="text-center mt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep('register')}
                                    className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline"
                                >
                                    Geri Dön (Bilgileri Düzenle)
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Zaten hesabın var mı? <Link href="/login" className="text-indigo-600 hover:underline">Giriş Yap</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
