"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        gender: 'male', // Default
    });
    const [error, setError] = useState('');
    const router = useRouter();
    const { login } = useAuth(); // Oto login için opsiyonel

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
                body: {
                    ...formData,
                    // role: 'user' // Default backend already handles this
                }
            });

            // Başarılı kayıt sonrası direkt giriş veya login'e yönlendirme
            // Burada direkt token dönüyor, otomatik giriş yapalım
            login(data.token, data.user);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Kayıt olurken bir hata oluştu');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Navbar />
            <div className="flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                        Yeni Hesap Oluştur
                    </h2>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Ad Soyad
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                E-Posta
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="male">Erkek</option>
                                <option value="female">Kadın</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Seanslar cinsiyetinize göre listelenecektir.
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Kayıt Ol
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Zaten hesabın var mı? <Link href="/login" className="text-indigo-600 hover:underline">Giriş Yap</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
