"use client";

import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import AdminDashboard from '../../components/AdminDashboard';
import UserDashboard from '../../components/UserDashboard';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 dark:text-white">Yükleniyor...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Navbar />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Hoşgeldin, {user.name}
                    </h1>

                    {user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
                </div>
            </main>
        </div>
    );
}
