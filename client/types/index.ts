export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    gender: 'male' | 'female';
}

export interface Session {
    _id: string;
    title: string;
    instructor?: string;
    dayOfWeek: string; // 'Monday' | 'Tuesday' ...
    startTime: string;
    duration: number;
    type: 'male' | 'female' | 'mixed';
    capacity: number;
    // currentEnrollment removed, dynamic calculation used now
}

export interface Reservation {
    _id: string;
    user: User | string;
    session: Session | string;
    sessionDate: string; // YYYY-MM-DD
    createdAt: string;
    status: 'active' | 'cancelled';
}

export interface Announcement {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
}
