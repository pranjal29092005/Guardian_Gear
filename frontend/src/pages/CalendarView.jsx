import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Clock, Package } from 'lucide-react';
import { requestAPI } from '../api/requests';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingScreen } from '../components/ui/Loading';
import { cn } from '../utils/cn';

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
            const allRequests = Object.values(data).flat();
            const scheduledRequests = allRequests.filter(req => req.scheduledDate);
            setRequests(scheduledRequests);
        } catch (err) {
            console.error('Failed to fetch requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const getWeekStart = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const getWeekDays = () => {
        const weekStart = getWeekStart(currentDate);
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            return date;
        });
    };

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

    const renderMiniCalendar = () => {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDay = monthStart.getDay();
        const daysInMonth = monthEnd.getDate();

        const weeks = [];
        let week = [];

        for (let i = 0; i < startDay; i++) {
            week.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            week.push(day);
            if (week.length === 7) {
                weeks.push(week);
                week = [];
            }
        }

        if (week.length > 0) {
            while (week.length < 7) {
                week.push(null);
            }
            weeks.push(week);
        }

        return (
            <Card>
                <CardContent className="p-4">
                    <div className="text-sm font-semibold text-white mb-4 text-center">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <div key={i} className="text-xs text-gray-400 text-center font-medium">
                                {day}
                            </div>
                        ))}
                        {weeks.map((week, weekIdx) => (
                            week.map((day, dayIdx) => {
                                const dayDate = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
                                const isTodayDay = dayDate && isToday(dayDate);
                                
                                return (
                                    <div
                                        key={`${weekIdx}-${dayIdx}`}
                                        className={cn(
                                            "text-xs text-center py-1.5 rounded-lg transition-colors",
                                            day && "cursor-pointer hover:bg-white/10",
                                            isTodayDay && "bg-gradient-to-br from-primary-500 to-secondary-500 text-white font-bold shadow-glow",
                                            !isTodayDay && day && "text-gray-300"
                                        )}
                                    >
                                        {day || ''}
                                    </div>
                                );
                            })
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return <LoadingScreen message="Loading calendar..." />;
    }

    return (
        <div className="flex gap-6">
            {/* Main Calendar */}
            <div className="flex-1 space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-glow">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white">Maintenance Calendar</h1>
                                <p className="text-gray-400 mt-1">
                                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - Week {getWeekNumber(currentDate)}
                                </p>
                            </div>
                        </div>

                        {/* Navigation Controls */}
                        <div className="flex items-center gap-3">
                            <Button onClick={goToToday} variant="outline" size="sm">
                                Today
                            </Button>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={goToPreviousWeek}
                                    variant="ghost"
                                    size="icon"
                                    icon={ChevronLeft}
                                />
                                <Button
                                    onClick={goToNextWeek}
                                    variant="ghost"
                                    size="icon"
                                    icon={ChevronRight}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Calendar Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card glow>
                        <CardContent className="p-0">
                            {/* Days Header */}
                            <div className="grid grid-cols-8 border-b border-white/10">
                                <div className="p-4"></div>
                                {weekDays.map((day, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "p-4 text-center transition-colors",
                                            isToday(day) && "bg-gradient-to-b from-primary-500/20 to-transparent"
                                        )}
                                    >
                                        <div className="text-xs font-medium text-gray-400 mb-1">
                                            {dayNames[day.getDay()]}
                                        </div>
                                        <div className={cn(
                                            "text-lg font-semibold",
                                            isToday(day)
                                                ? "bg-gradient-to-br from-primary-500 to-secondary-500 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto shadow-glow"
                                                : "text-white"
                                        )}>
                                            {day.getDate()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Time Slots */}
                            <div className="overflow-y-auto max-h-[600px]">
                                {hours.map((hour, hourIdx) => (
                                    <motion.div
                                        key={hour}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: hourIdx * 0.02 }}
                                        className="grid grid-cols-8 border-b border-white/5"
                                    >
                                        {/* Hour Label */}
                                        <div className="p-3 text-right text-sm text-gray-500 border-r border-white/10 bg-white/5">
                                            <Clock className="w-4 h-4 inline mr-2" />
                                            {hour.toString().padStart(2, '0')}:00
                                        </div>

                                        {/* Day Columns */}
                                        {weekDays.map((day, idx) => {
                                            const dayRequests = getRequestsForDay(day);
                                            const hasRequest = dayRequests.length > 0;

                                            return (
                                                <div
                                                    key={idx}
                                                    className={cn(
                                                        "p-2 min-h-[70px] border-r border-white/5 relative transition-colors",
                                                        isToday(day) ? "bg-primary-500/5 hover:bg-primary-500/10" : "hover:bg-white/5"
                                                    )}
                                                >
                                                    {hasRequest && hour === 9 && (
                                                        <div className="absolute inset-2">
                                                            {dayRequests.map(req => (
                                                                <motion.div
                                                                    key={req._id}
                                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                    className="bg-gradient-to-br from-primary-500/30 to-secondary-500/30 backdrop-blur-sm border border-primary-500/50 rounded-lg p-2 shadow-glow-sm mb-2 cursor-pointer hover:scale-105 transition-transform"
                                                                >
                                                                    <div className="text-xs font-semibold text-white truncate">
                                                                        {req.subject}
                                                                    </div>
                                                                    <div className="text-xs text-gray-300 truncate flex items-center gap-1 mt-1">
                                                                        <Package className="w-3 h-3" />
                                                                        {req.equipmentId?.name || 'N/A'}
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Sidebar */}
            <div className="w-72 space-y-6">
                {/* Mini Calendar */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {renderMiniCalendar()}
                </motion.div>

                {/* Scheduled Requests Info */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card variant="gradient">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary-500/20">
                                    <Calendar className="w-5 h-5 text-primary-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Scheduled Requests</h3>
                                    <p className="text-sm text-gray-400 mb-3">
                                        Maintenance requests appear in the calendar at 9:00 AM
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-bold text-primary-400">{requests.length}</p>
                                        <p className="text-sm text-gray-400">scheduled</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Legend */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Legend</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded bg-gradient-to-br from-primary-500 to-secondary-500 shadow-glow-sm"></div>
                                <span className="text-sm text-gray-300">Today</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded bg-gradient-to-br from-primary-500/30 to-secondary-500/30 border border-primary-500/50"></div>
                                <span className="text-sm text-gray-300">Scheduled Request</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded bg-primary-500/5"></div>
                                <span className="text-sm text-gray-300">Today's Column</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default CalendarView;
