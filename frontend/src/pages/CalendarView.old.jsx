import { useState, useEffect } from 'react';
import { requestAPI } from '../api/requests';
import { CalendarIcon } from '../components/Icons';

const CalendarView = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await requestAPI.getKanban();
            // Flatten all stages into one array
            const allRequests = Object.values(data).flat();
            // Filter only requests with scheduled dates
            const scheduledRequests = allRequests.filter(req => req.scheduledDate);
            setRequests(scheduledRequests);
        } catch (err) {
            console.error('Failed to fetch requests:', err);
        } finally {
            setLoading(false);
        }
    };

    // Get the Monday of the current week
    const getWeekStart = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(d.setDate(diff));
    };

    // Get array of 7 days starting from Monday
    const getWeekDays = () => {
        const weekStart = getWeekStart(currentDate);
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            return date;
        });
    };

    // Generate hours array (8 AM to 8 PM)
    const hours = Array.from({ length: 13 }, (_, i) => i + 8);

    const weekDays = getWeekDays();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const goToPreviousWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const getRequestsForDay = (day) => {
        return requests.filter(req => {
            const reqDate = new Date(req.scheduledDate);
            return reqDate.getDate() === day.getDate() &&
                reqDate.getMonth() === day.getMonth() &&
                reqDate.getFullYear() === day.getFullYear();
        });
    };

    const getWeekNumber = (date) => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    };

    // Mini calendar for current month
    const renderMiniCalendar = () => {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDay = monthStart.getDay();
        const daysInMonth = monthEnd.getDate();

        const weeks = [];
        let week = [];

        // Fill empty days at start
        for (let i = 0; i < startDay; i++) {
            week.push(null);
        }

        // Fill month days
        for (let day = 1; day <= daysInMonth; day++) {
            week.push(day);
            if (week.length === 7) {
                weeks.push(week);
                week = [];
            }
        }

        // Fill remaining empty days
        if (week.length > 0) {
            while (week.length < 7) {
                week.push(null);
            }
            weeks.push(week);
        }

        return (
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm font-semibold text-gray-900 mb-2 text-center">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-xs text-gray-500 text-center font-medium">
                            {day}
                        </div>
                    ))}
                    {weeks.map((week, weekIdx) => (
                        week.map((day, dayIdx) => (
                            <div
                                key={`${weekIdx}-${dayIdx}`}
                                className={`text-xs text-center py-1 ${day ? 'cursor-pointer hover:bg-blue-50 rounded' : ''
                                    } ${day && isToday(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
                                        ? 'bg-blue-600 text-white rounded font-bold'
                                        : 'text-gray-700'
                                    }`}
                            >
                                {day || ''}
                            </div>
                        ))
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div className="flex gap-6">
            {/* Main Calendar */}
            <div className="flex-1">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <CalendarIcon className="w-8 h-8 text-blue-600" />
                        Maintenance Calendar
                    </h1>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={goToToday}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Today
                            </button>
                            <button
                                onClick={goToPreviousWeek}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                ←
                            </button>
                            <button
                                onClick={goToNextWeek}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                →
                            </button>
                            <span className="text-lg font-semibold text-gray-900">
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - Week {getWeekNumber(currentDate)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Days Header */}
                    <div className="grid grid-cols-8 border-b border-gray-200">
                        <div className="p-3 bg-gray-50"></div>
                        {weekDays.map((day, idx) => (
                            <div
                                key={idx}
                                className={`p-3 text-center ${isToday(day) ? 'bg-blue-50' : 'bg-gray-50'}`}
                            >
                                <div className="text-xs font-medium text-gray-500">
                                    {dayNames[day.getDay()]}
                                </div>
                                <div className={`text-lg font-semibold ${isToday(day) ? 'bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto' : 'text-gray-900'
                                    }`}>
                                    {day.getDate()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Time Slots */}
                    <div className="overflow-y-auto max-h-[600px]">
                        {hours.map((hour) => (
                            <div key={hour} className="grid grid-cols-8 border-b border-gray-100">
                                {/* Hour Label */}
                                <div className="p-2 text-right text-xs text-gray-500 bg-gray-50 border-r border-gray-200">
                                    {hour.toString().padStart(2, '0')}:00
                                </div>

                                {/* Day Columns */}
                                {weekDays.map((day, idx) => {
                                    const dayRequests = getRequestsForDay(day);
                                    const hasRequest = dayRequests.length > 0;

                                    return (
                                        <div
                                            key={idx}
                                            className={`p-2 min-h-[60px] border-r border-gray-100 relative ${isToday(day) ? 'bg-blue-50/30' : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            {hasRequest && hour === 9 && (
                                                <div className="absolute inset-1 bg-blue-100 border-l-4 border-blue-600 rounded p-2">
                                                    {dayRequests.map(req => (
                                                        <div key={req._id} className="text-xs">
                                                            <div className="font-semibold text-blue-900 truncate">
                                                                {req.subject}
                                                            </div>
                                                            <div className="text-blue-700 truncate">
                                                                {req.equipmentId?.name || 'N/A'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mini Calendar Sidebar */}
            <div className="w-64">
                {renderMiniCalendar()}

                {/* Scheduled Requests Info */}
                <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-blue-600" />
                        Scheduled requests are shown in the calendar
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                        {requests.length} scheduled maintenance request(s)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
