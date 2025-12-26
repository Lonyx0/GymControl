"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const data = await fetchApi('/auth/login', {
                method: 'POST',
                body: { email, password }
            });

            login(data.token, data.user);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Giriş yapılırken bir hata oluştu');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Navbar />
            <div className="flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
                        Giriş Yap
                    </h2>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                E-Posta Adresi
                            </label>
                            <input
                                type="email"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Şifre
                            </label>
                            <input
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="text-right">
                            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
                                Şifremi Unuttum
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Giriş Yap
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Hesabın yok mu? <Link href="/register" className="text-indigo-600 hover:underline">Kayıt Ol</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
