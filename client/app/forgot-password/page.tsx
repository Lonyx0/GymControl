"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../../utils/api';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg('');
        setError('');
        try {
            const data = await fetchApi('/auth/forgotpassword', {
                method: 'POST',
                body: { email }
            });
            setMsg('Şifre sıfırlama talimatları e-posta adresinize gönderildi.');
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Şifremi Unuttum</h2>
                {msg && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{msg}</div>}
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-posta</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200">
                        Gönder
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
                        Giriş yap
                    </Link>
                </div>
            </div>
        </div>
    );
}
