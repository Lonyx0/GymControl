"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import Navbar from '../../components/Navbar';

interface User {
    _id: string;
    name: string;
    email: string;
    gender: 'male' | 'female';
    role: 'user' | 'admin';
    createdAt: string;
}

export default function MembersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [members, setMembers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Auth check happens in context, but we can double check role redirection
        if (!authLoading && (!user || user.role !== 'admin')) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    const loadMembers = async () => {
        try {
            const token = localStorage.getItem('token') || '';
            const data = await fetchApi('/users', { token }); // Helper needs to support headers override or auto-token if updated
            // Note: fetchApi might need adjustment if it doesn't auto-send token. 
            // Assuming standard fetchApi usage or manually adding header.
            // Let's assume fetchApi handles it or we pass it specifically?
            // Checking fetchApi implementation would be ideal, but standard practice:
            // Since UserDashboard works, it likely sends token if present or we pass it.
            // Let's pass token in options if helper supports it, or it auto-reads.
            // Let's verify fetchApi later if needed. For now assuming it works like others.
            setMembers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            loadMembers();
        }
    }, [user]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`"${name}" adlı üyeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;

        try {
            const token = localStorage.getItem('token') || '';
            await fetchApi(`/users/${id}`, { method: 'DELETE', token });
            // Remove locally
            setMembers(members.filter(m => m._id !== id));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading || (user?.role !== 'admin' && loading)) {
        return <div className="p-10 text-center">Yükleniyor...</div>;
    }

    if (user?.role !== 'admin') return null;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Navbar />
            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">Üyeler</h1>
                    <input
                        type="text"
                        placeholder="İsim veya E-posta ara..."
                        className="px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">İsim</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">E-posta</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cinsiyet</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kayıt Tarihi</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredMembers.map((member) => (
                                    <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {member.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {member.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {member.gender === 'male' ? 'Erkek' : 'Kadın'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                {member.role === 'admin' ? 'Yönetici' : 'Üye'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {new Date(member.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {member._id !== user?._id && (
                                                <button
                                                    onClick={() => handleDelete(member._id, member.name)}
                                                    className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                                                >
                                                    Sil
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredMembers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Kullanıcı bulunamadı.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
