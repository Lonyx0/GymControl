"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import Navbar from '../../components/Navbar';

interface GalleryImage {
    _id: string;
    title: string;
    imageUrl: string;
}

const API_BASE_URL = 'http://localhost:5001'; // Used for full image URL

export default function GalleryPage() {
    const { user } = useAuth();
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [uploadTitle, setUploadTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const loadImages = async () => {
        try {
            const data = await fetchApi('/gallery');
            setImages(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadImages();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return alert('Lütfen bir resim seçin');

        const formData = new FormData();
        formData.append('title', uploadTitle);
        formData.append('image', selectedFile);

        setLoading(true);
        setMsg('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/gallery`, {
                method: 'POST',
                headers: {
                    'x-auth-token': token || ''
                    // Content-Type otomatik olarak ayarlanır (multipart/form-data)
                },
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.msg || 'Yükleme başarısız');
            }

            setMsg('Resim başarıyla yüklendi!');
            setUploadTitle('');
            setSelectedFile(null);
            // Reset file input manually if needed via ref, but state clear is basics
            loadImages();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu resmi silmek istediğinize emin misiniz?')) return;
        try {
            const token = localStorage.getItem('token') || '';
            await fetchApi(`/gallery/${id}`, { method: 'DELETE', token });
            loadImages();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Navbar />
            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Galeri</h1>

                {/* Admin Upload Section */}
                {user?.role === 'admin' && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
                        <h2 className="text-xl font-semibold mb-4 dark:text-white">Yeni Resim Yükle</h2>
                        {msg && <p className="text-green-600 mb-2">{msg}</p>}
                        <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Başlık</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={uploadTitle}
                                    onChange={(e) => setUploadTitle(e.target.value)}
                                    placeholder="Örn: Yoga Sınıfı"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resim Seç</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Yükleniyor...' : 'Yükle'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Image Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {images.map((img) => (
                        <div key={img._id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden group relative">
                            <div className="aspect-w-16 aspect-h-9 w-full h-48 bg-gray-200 dark:bg-gray-700">
                                <img
                                    src={`${API_BASE_URL}${img.imageUrl}`}
                                    alt={img.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">{img.title}</h3>
                            </div>

                            {/* Delete Button (Admin Only) */}
                            {user?.role === 'admin' && (
                                <button
                                    onClick={() => handleDelete(img._id)}
                                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
                                    title="Sil"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {images.length === 0 && (
                    <p className="text-center text-gray-500 mt-12">Henüz hiç resim yüklenmemiş.</p>
                )}
            </div>
        </div>
    );
}
