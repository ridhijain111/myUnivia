import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  RotateCcw,
  Table,
  Trash2,
  Check,
} from 'lucide-react';
import { ScheduleItem, Deadline, CampusEvent, UserProfile } from '../../types';
import { OfficialTimeTableGrid } from '../OfficialTimeTableGrid';

interface CalendarViewProps {
  schedule: ScheduleItem[];
  deadlines: Deadline[];
  events: CampusEvent[];
  searchQuery?: string;
  onSearchQueryChange?: (q: string) => void;
  onAddToSchedule?: (item: ScheduleItem) => void;
  currentUser?: UserProfile;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  schedule,
  deadlines: propDeadlines,
  events,
  searchQuery = '',
  onSearchQueryChange,
  onAddToSchedule,
  currentUser,
}) => {
  const [activeTabMode, setActiveTabMode] = useState<'schedule' | 'timetable'>('schedule');

  // =========================================================================
  // PRESENT DATE & TIME STATE (Always Real-Time System Clock)
  // =========================================================================
  const [currentDateTime, setCurrentDateTime] = useState<Date>(() => new Date());

  useEffect(() => {
    // Keep live ticking clock updated every second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const presentDate = currentDateTime;

  const presentTime = useMemo(() => {
    return currentDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }, [currentDateTime]);

  // Offset in weeks relative to the week containing presentDate
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Selected day index in weekDays (0-6)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // =========================================================================
  // USER-ADDED DEADLINES STATE (Saved by user, persisted locally)
  // =========================================================================
  const [userDeadlines, setUserDeadlines] = useState<Deadline[]>(() => {
    try {
      const saved = localStorage.getItem('univia_user_deadlines');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return propDeadlines || [];
  });

  // Persist user deadlines
  useEffect(() => {
    try {
      localStorage.setItem('univia_user_deadlines', JSON.stringify(userDeadlines));
    } catch {}
  }, [userDeadlines]);

  // Synchronize when parent prop updates
  useEffect(() => {
    if (propDeadlines && propDeadlines.length > 0 && userDeadlines.length === 0) {
      setUserDeadlines(propDeadlines);
    }
  }, [propDeadlines]);

  // Modal to Add New Due Date
  const [isAddDueModalOpen, setIsAddDueModalOpen] = useState<boolean>(false);
  const [dueTitle, setDueTitle] = useState<string>('');
  const [dueCourseOrOrg, setDueCourseOrOrg] = useState<string>('');
  const [dueDateInput, setDueDateInput] = useState<string>('2026-09-18');
  const [dueTimeInput, setDueTimeInput] = useState<string>('11:59 PM');

  // Modal to Add Schedule Session
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('2:00 PM - 3:30 PM');
  const [newLocation, setNewLocation] = useState<string>('LH-05');
  const [newHost, setNewHost] = useState<string>('Faculty Mentor');
  const [newType, setNewType] = useState<ScheduleItem['type']>('class');

  // Format presentDate strings
  const presentDateFormatted = useMemo(() => {
    return presentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [presentDate]);

  const presentDayOfWeek = useMemo(() => {
    return presentDate.toLocaleDateString('en-US', { weekday: 'long' });
  }, [presentDate]);

  // Calculate the Monday of the week that contains `presentDate`
  const baseMonday = useMemo(() => {
    const d = new Date(presentDate);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diffToMonday = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diffToMonday);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [presentDate]);

  // Compute 7 days of the active week (Monday to Sunday)
  const weekDays = useMemo(() => {
    const days = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(baseMonday);
      d.setDate(baseMonday.getDate() + weekOffset * 7 + i);

      // Check if this day matches the presentDate
      const isPresentDay =
        d.getFullYear() === presentDate.getFullYear() &&
        d.getMonth() === presentDate.getMonth() &&
        d.getDate() === presentDate.getDate();

      days.push({
        index: i,
        name: dayNames[i],
        date: d.getDate(),
        month: d.toLocaleString('en-US', { month: 'short' }),
        fullDateStr: d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        isoDate: d.toISOString().split('T')[0],
        isToday: isPresentDay,
      });
    }
    return days;
  }, [baseMonday, weekOffset, presentDate]);

  // Automatically select the present day when weekOffset is 0
  useEffect(() => {
    if (weekOffset === 0) {
      const idx = weekDays.findIndex((d) => d.isToday);
      if (idx !== -1) {
        setSelectedDayIndex(idx);
      }
    }
  }, [weekOffset, weekDays]);

  const selectedDayInfo = weekDays[selectedDayIndex] || weekDays[0];

  // Week range label
  const weekRangeLabel = useMemo(() => {
    const first = weekDays[0];
    const last = weekDays[6];
    return `${first.month} ${first.date} – ${last.month} ${last.date}, ${first.month === last.month ? presentDate.getFullYear() : ''}`;
  }, [weekDays, presentDate]);

  // Daily Schedule for selected day
  const rawDaySchedule = useMemo(() => {
    const dayKey = selectedDayInfo.name;
    const personalItems = schedule.filter(
      (s) =>
        s.dayOfWeek === dayKey ||
        s.date === selectedDayInfo.name ||
        (selectedDayInfo.isToday && s.date === 'Today')
    );
    return personalItems.filter(
      (item) => !item.title.toLowerCase().includes('univia')
    );
  }, [selectedDayInfo, schedule]);

  // Filtered Schedule
  const filteredSchedule = useMemo(() => {
    if (!searchQuery.trim()) return rawDaySchedule;
    const q = searchQuery.toLowerCase();
    return rawDaySchedule.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.instructorOrHost.toLowerCase().includes(q) ||
        item.time.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        (item.courseCode && item.courseCode.toLowerCase().includes(q))
      );
    });
  }, [rawDaySchedule, searchQuery]);

  // Filtered Deadlines
  const filteredDeadlines = useMemo(() => {
    if (!searchQuery.trim()) return userDeadlines;
    const q = searchQuery.toLowerCase();
    return userDeadlines.filter((dl) => {
      return (
        dl.title.toLowerCase().includes(q) ||
        dl.courseOrOrg.toLowerCase().includes(q) ||
        dl.dueDate.toLowerCase().includes(q)
      );
    });
  }, [userDeadlines, searchQuery]);

  // Count items for day indicators
  const getDayDotCount = (dayIndex: number) => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dName = dayNames[dayIndex];
    const personalItems = schedule.filter(
      (s) =>
        s.dayOfWeek === dName ||
        s.date === dName ||
        (weekDays[dayIndex]?.isToday && s.date === 'Today')
    );
    const classes = personalItems.filter((i) => i.type === 'class').length;
    const eventsCount = personalItems.filter((i) => i.type === 'event' || i.type === 'society').length;
    return { classes, events: eventsCount };
  };

  // Add Custom Schedule Item
  const handleCreateScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: ScheduleItem = {
      id: `sched-${Date.now()}`,
      title: newTitle.trim(),
      time: newTime,
      location: newLocation.trim() || 'LH-05',
      instructorOrHost: newHost.trim() || 'Self-Scheduled',
      type: newType,
      status: 'upcoming',
      dayOfWeek: selectedDayInfo.name as ScheduleItem['dayOfWeek'],
      date: selectedDayInfo.isToday ? 'Today' : selectedDayInfo.name,
    };

    if (onAddToSchedule) {
      onAddToSchedule(newItem);
    }
    setNewTitle('');
    setIsAddModalOpen(false);
  };

  // Add User Due Date
  const handleAddUserDueDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueTitle.trim()) return;

    const dueD = new Date(dueDateInput);
    const diffTime = dueD.getTime() - presentDate.getTime();
    const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const newDl: Deadline = {
      id: `dl-${Date.now()}`,
      title: dueTitle.trim(),
      courseOrOrg: dueCourseOrOrg.trim() || 'General Course',
      dueDate: `${dueDateInput} • ${dueTimeInput}`,
      daysLeft,
      urgency: daysLeft <= 2 ? 'high' : daysLeft <= 5 ? 'medium' : 'normal',
      type: 'Assignment',
      isCompleted: false,
    };

    setUserDeadlines((prev) => [newDl, ...prev]);
    setDueTitle('');
    setDueCourseOrOrg('');
    setIsAddDueModalOpen(false);
  };

  // Toggle user deadline completion
  const handleToggleDeadline = (id: string) => {
    setUserDeadlines((prev) =>
      prev.map((dl) =>
        dl.id === id ? { ...dl, isCompleted: !dl.isCompleted } : dl
      )
    );
  };

  // Delete user deadline
  const handleDeleteDeadline = (id: string) => {
    setUserDeadlines((prev) => prev.filter((dl) => dl.id !== id));
  };

  return (
    <div
      id="univia-calendar-view"
      className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200"
    >
      {/* Calendar Top Header with View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#211B33] tracking-tight">
              Academic Calendar &amp; Schedule
            </h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EFEBFA] text-[#7033F5] border border-[#DDD1F5]">
              Session 2026-2027
            </span>
          </div>
          <p className="text-xs text-[#766E87] mt-1">
            Weekly academic schedule, classes, user-added due dates, and official timetable matrix.
          </p>
        </div>

        {/* Top Controls: View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-white border border-[#DDD0F4] rounded-2xl p-1 shadow-2xs">
            <button
              onClick={() => setActiveTabMode('schedule')}
              className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                activeTabMode === 'schedule'
                  ? 'bg-[#7033F5] text-white shadow-xs'
                  : 'text-[#615975] hover:bg-[#F6F2FD]'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Agenda Schedule</span>
            </button>
            <button
              onClick={() => setActiveTabMode('timetable')}
              className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                activeTabMode === 'timetable'
                  ? 'bg-[#7033F5] text-white shadow-xs'
                  : 'text-[#615975] hover:bg-[#F6F2FD]'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Time-Table Grid</span>
            </button>
          </div>

          {activeTabMode === 'schedule' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#7033F5] hover:bg-[#5E22E2] text-white text-xs font-bold transition-all shadow-md shadow-[#7033F5]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Entry</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRESENT DATE & TIME CONTROLLER (Defaults to 13 Sept 2026, user editable)  */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-[#FAF8FE] via-white to-[#F6F1FD] border border-[#E4D7F5] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#7033F5]/10 border border-[#7033F5]/20 text-[#7033F5] flex items-center justify-center shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#7033F5] bg-[#EFE8FB] px-2 py-0.5 rounded-full">
                Present Date &amp; Time
              </span>
              <span className="text-[11px] font-bold text-[#867B9E]">
                {presentDayOfWeek}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <p className="text-sm sm:text-base font-black text-[#211B33]">
                {presentDateFormatted}
              </p>
              <span className="text-xs font-bold text-[#5726BA] bg-white border border-[#E1D4F4] px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#7033F5]" />
                {presentTime}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 border border-[#E4D7F5] text-xs font-semibold text-[#665D7B] shadow-2xs self-start sm:self-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Local Campus Time</span>
        </div>
      </div>

      {activeTabMode === 'timetable' ? (
        <OfficialTimeTableGrid />
      ) : (
        <>
          {/* Week Selector Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EDE7F5] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#7033F5]" />
                <h2 className="font-extrabold text-sm sm:text-base text-[#211B33]">
                  {weekRangeLabel}
                </h2>
                {weekOffset !== 0 && (
                  <button
                    onClick={() => setWeekOffset(0)}
                    className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#F1EBFB] text-[#7033F5] hover:bg-[#E7DCF8] transition-colors ml-2"
                    title="Jump to current week"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Jump to Present Week</span>
                  </button>
                )}
              </div>

              {/* Working < and > navigation buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  id="calendar-prev-week-btn"
                  onClick={() => setWeekOffset((prev) => prev - 1)}
                  aria-label="Previous week"
                  className="p-2 rounded-xl bg-[#FAF7FD] hover:bg-[#F0E9F9] border border-[#EBE3F5] text-[#554C68] hover:text-[#7033F5] transition-colors flex items-center gap-1 text-xs font-bold group cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="hidden sm:inline">Prev Week</span>
                </button>

                <button
                  id="calendar-next-week-btn"
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                  aria-label="Next week"
                  className="p-2 rounded-xl bg-[#FAF7FD] hover:bg-[#F0E9F9] border border-[#EBE3F5] text-[#554C68] hover:text-[#7033F5] transition-colors flex items-center gap-1 text-xs font-bold group cursor-pointer"
                >
                  <span className="hidden sm:inline">Next Week</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Days grid: 7 interactive columns */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
              {weekDays.map((d) => {
                const isSelected = d.index === selectedDayIndex;
                const dots = getDayDotCount(d.index);

                return (
                  <button
                    key={d.index}
                    onClick={() => setSelectedDayIndex(d.index)}
                    className={`p-2 sm:p-3.5 rounded-2xl text-center transition-all flex flex-col items-center justify-between min-h-[72px] sm:min-h-[88px] relative cursor-pointer ${
                      isSelected
                        ? 'bg-[#7033F5] text-white shadow-lg shadow-[#7033F5]/30 font-bold scale-[1.02]'
                        : d.isToday
                        ? 'bg-[#F2EDFB] text-[#4F22B1] font-bold border-2 border-[#CBB3F2] hover:bg-[#EAE0F9]'
                        : 'bg-[#FAF8FE] text-[#4A4259] hover:bg-[#F3EDFB] border border-[#EDE7F5]'
                    }`}
                  >
                    <div className="w-full">
                      <p
                        className={`text-[10px] sm:text-xs uppercase font-extrabold tracking-wider ${
                          isSelected ? 'text-purple-100' : 'text-[#7D748E]'
                        }`}
                      >
                        {d.name}
                      </p>
                      <p className="text-base sm:text-xl font-black mt-0.5 leading-none">
                        {d.date}
                      </p>
                    </div>

                    {/* Day status */}
                    <div className="flex items-center gap-1 mt-1.5">
                      {dots.classes > 0 && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-[#7033F5]'
                          }`}
                          title={`${dots.classes} classes`}
                        ></span>
                      )}
                      {dots.events > 0 && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-amber-300' : 'bg-pink-500'
                          }`}
                          title={`${dots.events} events`}
                        ></span>
                      )}
                    </div>

                    {d.isToday && !isSelected && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#7033F5] text-white mt-1">
                        Present
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Day Schedule & Deadlines Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Schedule Column (Clean cards, extra time column removed) */}
            <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-3xl border border-[#EDE7F5] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F2EDFA] gap-2">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#211B33] flex items-center gap-2">
                    <span>
                      Schedule for {selectedDayInfo.name}, {selectedDayInfo.fullDateStr}
                    </span>
                    {selectedDayInfo.isToday && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                        Present Day
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-[#7B738C] mt-0.5">
                    {filteredSchedule.length} session{filteredSchedule.length === 1 ? '' : 's'} on record
                  </p>
                </div>
              </div>

              {/* Schedule List */}
              <div className="space-y-3">
                {filteredSchedule.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-2xl bg-[#FAF8FE] border border-dashed border-[#E7DCF7]">
                    <CalendarIcon className="w-8 h-8 text-[#A89EC0] mx-auto mb-2" />
                    <p className="text-sm font-bold text-[#2A233C]">
                      No scheduled sessions for this day
                    </p>
                    <p className="text-xs text-[#766E87] mt-1">
                      Enjoy your free day or click &quot;Add Entry&quot; to plan a session.
                    </p>
                  </div>
                ) : (
                  filteredSchedule.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border transition-all bg-[#FAF8FE] border-[#ECE4F6] hover:border-[#D5C4F2] hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#5527B8] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#7033F5]" />
                            <span>{item.time}</span>
                          </span>
                          {item.courseCode && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#EDE6FA] text-[#7033F5]">
                              {item.courseCode}
                            </span>
                          )}
                          {item.isLab && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                              Lab Practical
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-[#211B33]">{item.title}</h4>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#6A627B]">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#7033F5]" />
                            <span>{item.location}</span>
                          </span>
                          <span>•</span>
                          <span>{item.instructorOrHost}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            item.type === 'class'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : item.type === 'society'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : item.type === 'event'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* DEADLINES & UPCOMING DUE DATES COLUMN (Added by user only)                */}
            {/* ========================================================================= */}
            <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#EDE7F5] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#F2EDFA]">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <h3 className="font-extrabold text-sm text-[#211B33]">
                    Upcoming Due Dates
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddDueModalOpen(true)}
                  className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-[#7033F5] text-white hover:bg-[#5E22E2] transition-colors shadow-2xs cursor-pointer"
                  title="Add user due date"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Due Date</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {filteredDeadlines.length === 0 ? (
                  <div className="text-center py-8 px-3 rounded-2xl bg-[#FAF8FD] border border-dashed border-[#EDE7F5]">
                    <p className="text-xs text-[#8A819C]">No upcoming due dates added yet.</p>
                    <button
                      onClick={() => setIsAddDueModalOpen(true)}
                      className="mt-2 text-xs font-bold text-[#7033F5] hover:underline"
                    >
                      + Add your first deadline
                    </button>
                  </div>
                ) : (
                  filteredDeadlines.map((dl) => (
                    <div
                      key={dl.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-all ${
                        dl.isCompleted
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-[#FAF8FD] border-[#EDE7F5] hover:border-[#DFCFF5]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-[#79718A]">
                          {dl.courseOrOrg}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleDeadline(dl.id)}
                            className={`p-1 rounded-lg transition-colors ${
                              dl.isCompleted
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white border border-slate-200 text-slate-400 hover:text-emerald-600'
                            }`}
                            title={dl.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteDeadline(dl.id)}
                            className="p-1 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Delete due date"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <p
                        className={`font-bold text-[#211B33] leading-snug ${
                          dl.isCompleted ? 'line-through text-[#8A819C]' : ''
                        }`}
                      >
                        {dl.title}
                      </p>

                      <p className="text-[11px] text-[#635B74] flex items-center gap-1 pt-0.5">
                        <Clock className="w-3 h-3 text-[#8D83A1]" />
                        <span>{dl.dueDate}</span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD USER DUE DATE                                                */}
      {/* ========================================================================= */}
      {isAddDueModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#EDE7F5] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F2EDFA]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <h3 className="font-extrabold text-base text-[#211B33]">
                  Add Upcoming Due Date
                </h3>
              </div>
              <button
                onClick={() => setIsAddDueModalOpen(false)}
                className="p-1.5 rounded-xl text-[#7A728D] hover:bg-[#F3ECFB] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserDueDate} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#342D45] block mb-1">
                  Task / Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  value={dueTitle}
                  onChange={(e) => setDueTitle(e.target.value)}
                  placeholder="e.g. Machine Learning Lab Assignment 2"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                />
              </div>

              <div>
                <label className="font-bold text-[#342D45] block mb-1">
                  Course or Organization *
                </label>
                <input
                  type="text"
                  required
                  value={dueCourseOrOrg}
                  onChange={(e) => setDueCourseOrOrg(e.target.value)}
                  placeholder="e.g. BAS-103 / AssetMerkle / ACM"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#342D45] block mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDateInput}
                    onChange={(e) => setDueDateInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#342D45] block mb-1">
                    Due Time
                  </label>
                  <input
                    type="text"
                    value={dueTimeInput}
                    onChange={(e) => setDueTimeInput(e.target.value)}
                    placeholder="11:59 PM"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#F2EDFA]">
                <button
                  type="button"
                  onClick={() => setIsAddDueModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#6D657F] hover:bg-[#F3EEFA] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7033F5] text-white font-bold hover:bg-[#5E22E2] shadow-xs cursor-pointer"
                >
                  Save Due Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD SCHEDULE ITEM                                                */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#EDE7F5] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F2EDFA]">
              <h3 className="font-extrabold text-base text-[#211B33]">
                Add Session to Timetable
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-[#7A728D] hover:bg-[#F3ECFB] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateScheduleItem} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#342D45] block mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems Lecture"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#342D45] block mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 10:00 AM - 11:30 AM"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#342D45] block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ScheduleItem['type'])}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  >
                    <option value="class">Class / Lecture</option>
                    <option value="society">Society Meet</option>
                    <option value="meeting">Team Meeting</option>
                    <option value="study">Study Session</option>
                    <option value="event">Campus Event</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#342D45] block mb-1">Location / Venue</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Audi-1 or LH-102"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#342D45] block mb-1">Host / Faculty</label>
                  <input
                    type="text"
                    value={newHost}
                    onChange={(e) => setNewHost(e.target.value)}
                    placeholder="e.g. Dr. Verma"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#F2EDFA]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#6D657F] hover:bg-[#F3EEFA] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7033F5] text-white font-bold hover:bg-[#5E22E2] shadow-xs cursor-pointer"
                >
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
