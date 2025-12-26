"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, login } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        height: '',
        weight: '',
    });
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/login');
        } else {
            // Load existing data
            const loadProfile = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001'}/api/profile`, {
                        headers: { 'x-auth-token': token || '' }
                    });
                    const data = await res.json();
                    setFormData({
                        height: data.height || '',
                        weight: data.weight || '',
                    });
                    if (data.profilePicture) {
                        setPreviewUrl(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001'}${data.profilePicture}`);
                    }
                } catch (err) {
                    console.error(err);
                }
            };
            loadProfile();
        }
    }, [user, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProfilePic(e.target.files[0]);
            setPreviewUrl(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');

        const data = new FormData();
        data.append('height', formData.height);
        data.append('weight', formData.weight);
        if (profilePic) {
            data.append('profilePicture', profilePic);
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001'}/api/profile`, {
                method: 'PUT',
                headers: {
                    'x-auth-token': token || ''
                },
                body: data
            });

            if (!res.ok) throw new Error('Güncelleme başarısız');

            const updatedUser = await res.json();
            setMsg('Profil başarıyla güncellendi!');

            // Eğer AuthContext'te user state'i güncellemek gerekirse burada yapılabilir
            // Ancak şu an basitçe sayfada kalıyoruz

        } catch (err: any) {
            setMsg('Hata: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Navbar />
            <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profilim</h1>

                    {msg && (
                        <div className={`p-4 mb-4 rounded ${msg.includes('Hata') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {msg}
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sol Taraf: Profil Resmi ve Özet */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-2 border-indigo-500">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Profil" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="text-center">
                                <h2 className="text-xl font-semibold dark:text-white">{user.name}</h2>
                                <p className="text-gray-500 dark:text-gray-400">{user.role === 'admin' ? 'Yönetici' : 'Üye'}</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500">{user.email}</p>
                            </div>
                        </div>

                        {/* Sağ Taraf: Form */}
                        <div className="flex-1">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Boy (cm)</label>
                                        <input
                                            type="number"
                                            name="height"
                                            value={formData.height}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="Örn: 180"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kilo (kg)</label>
                                        <input
                                            type="number"
                                            name="weight"
                                            value={formData.weight}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="Örn: 75"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profil Fotoğrafı Güncelle</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="mt-1 block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-indigo-50 file:text-indigo-700
                                        hover:file:bg-indigo-100 dark:text-gray-300"
                                    />
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
