"use client";

import { useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';
import { Session, Reservation } from '../types';
import { useAuth } from '../context/AuthContext';

const daysMap: Record<number, string> = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
};

const dayLabels: Record<string, string> = {
    'Monday': 'Pazartesi',
    'Tuesday': 'Salı',
    'Wednesday': 'Çarşamba',
    'Thursday': 'Perşembe',
    'Friday': 'Cuma',
    'Saturday': 'Cumartesi',
    'Sunday': 'Pazar'
};

export default function UserDashboard() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [myReservations, setMyReservations] = useState<Reservation[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [upcomingDays, setUpcomingDays] = useState<Date[]>([]);

    const [announcements, setAnnouncements] = useState<any[]>([]);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('token');

            const [sessionsData, countsData, announcementsData] = await Promise.all([
                fetchApi('/sessions'),
                fetchApi('/reservations/counts'),
                fetchApi('/announcements')
            ]);

            setSessions(sessionsData);
            setCounts(countsData);
            setAnnouncements(announcementsData);

            if (token) {
                const reservationsData = await fetchApi('/reservations/my', { token });
                setMyReservations(reservationsData);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadData();

        // Generate next 7 days
        const days = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            days.push(d);
        }
        setUpcomingDays(days);
    }, []);

    const handleBook = async (sessionId: string, dateStr: string) => {
        try {
            const token = localStorage.getItem('token') || '';
            await fetchApi('/reservations', {
                method: 'POST',
                body: { sessionId, sessionDate: dateStr },
                token
            });
            alert('Rezervasyon başarılı!');
            loadData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleCancel = async (reservationId: string) => {
        if (!confirm('İptal etmek istediğinize emin misiniz?')) return;
        try {
            const token = localStorage.getItem('token') || '';
            await fetchApi(`/reservations/${reservationId}`, { method: 'DELETE', token });
            loadData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const isSessionSuitable = (session: Session) => {
        if (session.type !== 'mixed' && session.type !== user?.gender) return false;
        return true;
    };

    const hasReservation = (sessionId: string, dateStr: string) => {
        return myReservations.some(r => {
            const rSessionId = typeof r.session === 'string' ? r.session : r.session._id;
            return rSessionId === sessionId && r.sessionDate === dateStr;
        });
    };

    const getCapacity = (sessionId: string, dateStr: string) => {
        return counts[`${sessionId}_${dateStr}`] || 0;
    };

    return (
        <div className="space-y-8">

            {/* Duyurular */}
            {announcements.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center">
                        <span className="mr-2">📢</span> Duyurular
                    </h2>
                    <div className="space-y-4">
                        {announcements.map((ann) => (
                            <div key={ann._id} className="pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{ann.title}</h3>
                                <div className="text-xs text-gray-500 mb-1">{new Date(ann.createdAt).toLocaleDateString()}</div>
                                <p className="text-gray-700 dark:text-gray-300">{ann.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rezervasyonlarım */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Rezervasyonlarım</h2>
                {myReservations.length === 0 ? (
                    <p className="text-gray-500">Henüz bir rezervasyonunuz yok.</p>
                ) : (
                    <ul className="space-y-3">
                        {myReservations.map(res => {
                            const session = res.session as Session;
                            // sessionDate format: YYYY-MM-DD
                            return (
                                <li key={res._id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                    <div>
                                        <p className="font-semibold dark:text-white">{session.title}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-300">
                                            {res.sessionDate} - {session.startTime}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleCancel(res._id)}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                    >
                                        İptal Et
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Gelecek 7 Gün Takvimi */}
            <div>
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Haftalık Program</h2>
                <div className="space-y-8">
                    {upcomingDays.map((dateObj) => {
                        const dayName = daysMap[dateObj.getDay()]; // 'Monday'
                        const dateStr = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
                        const displayDate = dateObj.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

                        // Find sessions for this day
                        const todaysSessions = sessions.filter(s => s.dayOfWeek === dayName && isSessionSuitable(s));

                        if (todaysSessions.length === 0) return null;

                        return (
                            <div key={dateStr} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 dark:text-blue-400 text-blue-600">
                                    {displayDate}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {todaysSessions.map(session => {
                                        const booked = hasReservation(session._id, dateStr);
                                        const currentCount = getCapacity(session._id, dateStr);
                                        const full = currentCount >= session.capacity;

                                        return (
                                            <div key={session._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-lg dark:text-white">{session.title}</h4>
                                                    <span className={`text-xs px-2 py-1 rounded ${session.type === 'mixed' ? 'bg-purple-100 text-purple-800' :
                                                        session.type === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                                                        }`}>
                                                        {session.type === 'mixed' ? 'Karma' : session.type === 'male' ? 'Erkek' : 'Kadın'}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{session.instructor}</p>
                                                <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                                    <p>⏰ {session.startTime} ({session.duration} dk)</p>
                                                    <p>👥 Doluluk: {currentCount}/{session.capacity}</p>
                                                </div>

                                                <button
                                                    onClick={() => handleBook(session._id, dateStr)}
                                                    disabled={booked || full}
                                                    className={`mt-4 w-full py-2 rounded text-sm font-medium transition-colors ${booked ? 'bg-green-100 text-green-800 cursor-default' :
                                                        full ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                                                            'bg-indigo-600 text-white hover:bg-indigo-700'
                                                        }`}
                                                >
                                                    {booked ? 'Rezerve Edildi' : full ? 'Kapasite Dolu' : 'Rezervasyon Yap'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
