"use client";

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [onlineCount, setOnlineCount] = useState(0);
    const [visitorCount, setVisitorCount] = useState(0);

    useEffect(() => {
        // Ziyaretçi sayısını al ve kaydet
        const fetchVisitorCount = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001'}/api/visitors`, { method: 'POST' });
                const data = await res.json();
                setVisitorCount(data.count);
            } catch (err) {
                console.error("Ziyaretçi sayısı alınamadı:", err);
            }
        };

        fetchVisitorCount();

        const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001');

        socket.on('activeUsers', (count: number) => {
            setOnlineCount(count);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <nav className="bg-gray-900 border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-white text-xl font-bold">
                            GymRezervasyon
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <div className="text-gray-300 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                {onlineCount} Online
                            </div>
                            <div className="text-gray-300 px-3 py-2 rounded-md text-sm font-medium flex items-center border-l border-gray-700 ml-2 pl-4">
                                <span>Ziyaretçi: {visitorCount}</span>
                            </div>
                            {user ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        Panel
                                    </Link>
                                    <Link
                                        href="/gallery"
                                        className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        Galeri
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        Profilim
                                    </Link>
                                    {user.role === 'admin' && (
                                        <Link
                                            href="/members"
                                            className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            Üyeler
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-300 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        Çıkış Yap
                                    </button>
                                    <span className="text-gray-500 text-sm ml-4">
                                        {user.name} ({user.role === 'admin' ? 'Yönetici' : 'Üye'})
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        Giriş
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                    >
                                        Kayıt Ol
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
