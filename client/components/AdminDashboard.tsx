"use client";

import { useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';
import { Session } from '../types';

const daysOfWeek = [
    { val: 'Monday', label: 'Pazartesi' },
    { val: 'Tuesday', label: 'Salı' },
    { val: 'Wednesday', label: 'Çarşamba' },
    { val: 'Thursday', label: 'Perşembe' },
    { val: 'Friday', label: 'Cuma' },
    { val: 'Saturday', label: 'Cumartesi' },
    { val: 'Sunday', label: 'Pazar' },
];

export default function AdminDashboard() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        instructor: '',
        dayOfWeek: 'Monday',
        startTime: '',
        duration: 60,
        type: 'mixed',
        capacity: 10
    });

    const [counts, setCounts] = useState<Record<string, number>>({});

    const loadData = async () => {
        try {
            const [sessionsData, countsData] = await Promise.all([
                fetchApi('/sessions'),
                fetchApi('/reservations/counts')
            ]);
            setSessions(sessionsData);
            setCounts(countsData);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadData();
        loadAnnouncements();
    }, []);

    // ... existing handlers ...

    // Helper to find the next date (YYYY-MM-DD) for a specific day name
    const getNextOccurrenceDate = (dayName: string) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const targetIndex = days.indexOf(dayName);
        if (targetIndex === -1) return '';

        const today = new Date();
        const currentDayIndex = today.getDay();

        let diff = targetIndex - currentDayIndex;
        if (diff < 0) diff += 7;
        // If today is the day, shows today. 

        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + diff);
        return nextDate.toISOString().split('T')[0];
    };

    const getCapacityCount = (session: Session) => {
        const nextDate = getNextOccurrenceDate(session.dayOfWeek);
        if (!nextDate) return 0;
        return counts[`${session._id}_${nextDate}`] || 0;
    };

    // ... inside return ...


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [selectedSessionReservations, setSelectedSessionReservations] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [selectedDateFilter, setSelectedDateFilter] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token') || '';
            await fetchApi('/sessions', {
                method: 'POST',
                body: formData,
                token
            });
            alert('Seans şablonu oluşturuldu!');
            loadData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu seans şablonunu silmek istediğinize emin misiniz?')) return;
        try {
            const token = localStorage.getItem('token') || '';
            await fetchApi(`/sessions/${id}`, { method: 'DELETE', token });
            loadData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleOpenParticipantsModal = (session: Session) => {
        setSelectedSession(session);
        // Default to the next occurrence date, matching the table view
        const nextDate = getNextOccurrenceDate(session.dayOfWeek);
        setSelectedDateFilter(nextDate);
        setSelectedSessionReservations([]);
        setIsModalOpen(true);
    };

    const fetchParticipants = async () => {
        if (!selectedSession || !selectedDateFilter) return;
        try {
            const token = localStorage.getItem('token') || '';
            const data = await fetchApi(`/reservations/session/${selectedSession._id}?date=${selectedDateFilter}`, { token });
            setSelectedSessionReservations(data);
        } catch (err: any) {
            alert(err.message);
        }
    };

    // Effect to auto-fetch when date changes in modal
    useEffect(() => {
        if (isModalOpen && selectedSession) {
            fetchParticipants();
        }
    }, [selectedDateFilter, isModalOpen]);

    const [activeTab, setActiveTab] = useState<'sessions' | 'announcements'>('sessions');

    // Announcement Logic
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });

    const loadAnnouncements = async () => {
        try {
            const data = await fetchApi('/announcements');
            setAnnouncements(data);
        } catch (err: any) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const handleAnnouncementSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token') || '';
            await fetchApi('/announcements', {
                method: 'POST',
                body: announcementForm,
                token
            });
            alert('Duyuru yayınlandı!');
            setAnnouncementForm({ title: '', content: '' });
            loadAnnouncements();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDeleteAnnouncement = async (id: string) => {
        if (!confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;
        try {
            const token = localStorage.getItem('token') || '';
            await fetchApi(`/announcements/${id}`, { method: 'DELETE', token });
            loadAnnouncements();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const INPUT_CLASS = "w-full px-3 py-2 border-2 border-gray-300 bg-white rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-500 dark:text-white transition-all duration-200 opacity-100";

    return (
        <div className="space-y-8 relative">
            {/* Modal */}
            {isModalOpen && selectedSession && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full m-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold dark:text-white">Katılımcılar: {selectedSession.title}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">✕</button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tarih Seçin</label>
                            <input
                                type="date"
                                value={selectedDateFilter}
                                onChange={(e) => setSelectedDateFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <p className="text-xs text-gray-500 mt-1">Seans Günü: {daysOfWeek.find(d => d.val === selectedSession.dayOfWeek)?.label}</p>
                        </div>

                        {selectedSessionReservations.length === 0 ? (
                            <p className="text-gray-500">Bu tarih için henüz katılımcı yok.</p>
                        ) : (
                            <ul className="space-y-2 max-h-60 overflow-y-auto">
                                {selectedSessionReservations.map((res: any, idx) => (
                                    <li key={idx} className="border-b border-gray-100 dark:border-gray-700 py-2">
                                        <p className="font-semibold dark:text-white">{res.user.name}</p>
                                        <p className="text-sm text-gray-500">{res.user.email} ({res.user.gender === 'male' ? 'Erkek' : 'Kadın'})</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="mt-6 text-right">
                            <button onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">Kapat</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('sessions')}
                    className={`py-2 px-4 font-medium ${activeTab === 'sessions' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    Seans Yönetimi
                </button>
                <button
                    onClick={() => setActiveTab('announcements')}
                    className={`py-2 px-4 font-medium ${activeTab === 'announcements' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    Duyuru ve Haberler
                </button>
            </div>

            {activeTab === 'sessions' ? (
                <>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Yeni Haftalık Seans Ekle</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seans Başlığı</label>
                                <input type="text" name="title" required className={INPUT_CLASS} onChange={handleChange} value={formData.title} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Eğitmen İsmi</label>
                                <input type="text" name="instructor" className={INPUT_CLASS} onChange={handleChange} value={formData.instructor} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seans Günü</label>
                                <select name="dayOfWeek" className={INPUT_CLASS} onChange={handleChange} value={formData.dayOfWeek}>
                                    {daysOfWeek.map(d => (
                                        <option key={d.val} value={d.val}>{d.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Başlangıç Saati</label>
                                <input type="time" name="startTime" required className={INPUT_CLASS} onChange={handleChange} value={formData.startTime} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Süre (Dakika)</label>
                                <input type="number" name="duration" className={INPUT_CLASS} onChange={handleChange} value={formData.duration} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seans Tipi</label>
                                <select name="type" className={INPUT_CLASS} onChange={handleChange} value={formData.type}>
                                    <option value="mixed">Karma</option>
                                    <option value="male">Erkek</option>
                                    <option value="female">Kadın</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kapasite</label>
                                <input type="number" name="capacity" required className={INPUT_CLASS} onChange={handleChange} value={formData.capacity} />
                            </div>

                            <div className="col-span-full mt-2">
                                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium">Seans Oluştur</button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Haftalık Program</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gün/Saat</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Başlık</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tip</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Doluluk (Gelecek Seans)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {sessions.map((session) => {
                                        const count = getCapacityCount(session);
                                        return (
                                            <tr key={session._id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    <span className="font-bold">{daysOfWeek.find(d => d.val === session.dayOfWeek)?.label}</span> - {session.startTime}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{session.title}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {session.type === 'male' ? 'Erkek' : session.type === 'female' ? 'Kadın' : 'Karma'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    <span className={`font-bold ${count >= session.capacity ? 'text-red-600' : 'text-green-600'}`}>
                                                        {count}
                                                    </span>
                                                    <span className="text-gray-400"> / {session.capacity}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <button onClick={() => handleOpenParticipantsModal(session)} className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400">Katılımcılar</button>
                                                    <button onClick={() => handleDelete(session._id)} className="text-red-600 hover:text-red-900 dark:hover:text-red-400">Sil</button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Yeni Duyuru Ekle</h2>
                        <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Başlık</label>
                                <input
                                    type="text"
                                    className={INPUT_CLASS}
                                    value={announcementForm.title}
                                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">İçerik</label>
                                <textarea
                                    className={INPUT_CLASS}
                                    rows={4}
                                    value={announcementForm.content}
                                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-medium">Yayınla</button>
                        </form>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Yayınlanan Duyurular</h2>
                        {announcements.length === 0 ? (
                            <p className="text-gray-500">Henüz duyuru yok.</p>
                        ) : (
                            <ul className="space-y-4">
                                {announcements.map((ann: any) => (
                                    <li key={ann._id} className="border border-gray-200 dark:border-gray-700 p-4 rounded bg-gray-50 dark:bg-gray-700/50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{ann.title}</h3>
                                                <span className="text-xs text-gray-500">{new Date(ann.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <button onClick={() => handleDeleteAnnouncement(ann._id)} className="text-red-500 hover:text-red-700">Sil</button>
                                        </div>
                                        <p className="mt-2 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{ann.content}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
