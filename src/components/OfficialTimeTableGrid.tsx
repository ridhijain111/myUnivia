import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Building2,
  Clock,
  MapPin,
  User,
  Printer,
  Calendar,
  CheckCircle2,
  Layers,
  Upload,
  Image as ImageIcon,
  Edit2,
  Trash2,
  X,
  Maximize2,
  RotateCcw,
  Sparkles,
  Plus,
} from 'lucide-react';

export interface TimetableCell {
  subject: string;
  code: string;
  faculty: string;
  venue: string;
  type: 'theory' | 'lab' | 'tutorial' | 'break' | 'free';
}

export type TimetableGridData = Record<string, Record<string, TimetableCell>>;

const TIME_SLOTS = [
  '9:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 1:00',
  '1:00 - 2:00',
  '2:00 - 3:00',
  '3:00 - 4:00',
  '4:00 - 5:00',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const DEFAULT_GRID_DATA: TimetableGridData = {
  Mon: {
    '9:00 - 10:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '10:00 - 11:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '11:00 - 12:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '12:00 - 1:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '1:00 - 2:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '2:00 - 3:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '3:00 - 4:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '4:00 - 5:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
  },
  Tue: {
    '9:00 - 10:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '10:00 - 11:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '11:00 - 12:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '12:00 - 1:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '1:00 - 2:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '2:00 - 3:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '3:00 - 4:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '4:00 - 5:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
  },
  Wed: {
    '9:00 - 10:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '10:00 - 11:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '11:00 - 12:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '12:00 - 1:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '1:00 - 2:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '2:00 - 3:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '3:00 - 4:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '4:00 - 5:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
  },
  Thu: {
    '9:00 - 10:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '10:00 - 11:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '11:00 - 12:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '12:00 - 1:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '1:00 - 2:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '2:00 - 3:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '3:00 - 4:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '4:00 - 5:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
  },
  Fri: {
    '9:00 - 10:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '10:00 - 11:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '11:00 - 12:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '12:00 - 1:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '1:00 - 2:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '2:00 - 3:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '3:00 - 4:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
    '4:00 - 5:00': { subject: '', code: '', faculty: '', venue: '', type: 'free' },
  },
};

interface OfficialTimeTableGridProps {
  onSelectSlot?: (courseCode: string, slotTitle: string) => void;
}

export const OfficialTimeTableGrid: React.FC<OfficialTimeTableGridProps> = ({
  onSelectSlot,
}) => {
  // Mode switcher: 'grid' or 'image'
  const [activeSubTab, setActiveSubTab] = useState<'grid' | 'image'>('grid');

  // =========================================================================
  // TIMETABLE IMAGE STATE (Stored in localStorage)
  // =========================================================================
  const [timetableImage, setTimetableImage] = useState<string | null>(() => {
    try {
      return localStorage.getItem('univia_timetable_image');
    } catch {
      return null;
    }
  });

  const [isZoomImageOpen, setIsZoomImageOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const rawResult = loadEvt.target?.result as string;
      if (!rawResult) return;

      const img = new Image();
      img.onload = () => {
        // Safe canvas compression to prevent localStorage quota errors
        const maxDim = 1400;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setTimetableImage(compressed);
          setActiveSubTab('image');
          try {
            localStorage.setItem('univia_timetable_image', compressed);
          } catch (err) {
            console.warn('LocalStorage timetable image save error:', err);
          }
        } else {
          setTimetableImage(rawResult);
          setActiveSubTab('image');
          try {
            localStorage.setItem('univia_timetable_image', rawResult);
          } catch {}
        }
      };
      img.onerror = () => {
        setTimetableImage(rawResult);
        setActiveSubTab('image');
        try {
          localStorage.setItem('univia_timetable_image', rawResult);
        } catch {}
      };
      img.src = rawResult;
    };
    reader.readAsDataURL(file);
    // Reset file input value so selecting the exact same file again still fires onChange
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setTimetableImage(null);
    try {
      localStorage.removeItem('univia_timetable_image');
    } catch {}
  };

  // =========================================================================
  // EDITABLE TIMETABLE GRID STATE
  // =========================================================================
  const [gridData, setGridData] = useState<TimetableGridData>(() => {
    try {
      const saved = localStorage.getItem('univia_timetable_grid_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return DEFAULT_GRID_DATA;
  });

  // Persist gridData to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('univia_timetable_grid_v2', JSON.stringify(gridData));
    } catch {}
  }, [gridData]);

  const totalClassesCount = Object.values(gridData)
    .flatMap((d) => Object.values(d))
    .filter((c) => c.subject && c.subject.trim().length > 0).length;

  // Selected filter pill
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');

  // Dynamic courses list from user's actual timetable grid
  const availableCourses = useMemo(() => {
    const courseSet = new Set<string>();
    DAYS.forEach((day) => {
      Object.values(gridData[day] || {}).forEach((cell) => {
        const identifier = cell.code?.trim() || cell.subject?.trim();
        if (identifier) courseSet.add(identifier);
      });
    });
    return Array.from(courseSet);
  }, [gridData]);

  // Cell editing modal state
  const [editingCell, setEditingCell] = useState<{
    day: string;
    slot: string;
    cell: TimetableCell;
  } | null>(null);

  // Form states for editing cell
  const [cellSubject, setCellSubject] = useState<string>('');
  const [cellCode, setCellCode] = useState<string>('');
  const [cellFaculty, setCellFaculty] = useState<string>('');
  const [cellVenue, setCellVenue] = useState<string>('');
  const [cellType, setCellType] = useState<TimetableCell['type']>('theory');

  // Open edit modal for specific slot
  const openEditModal = (day: string, slot: string) => {
    const current = gridData[day]?.[slot] || {
      subject: '',
      code: '',
      faculty: '',
      venue: '',
      type: 'free',
    };
    setEditingCell({ day, slot, cell: current });
    setCellSubject(current.subject);
    setCellCode(current.code);
    setCellFaculty(current.faculty);
    setCellVenue(current.venue);
    setCellType(current.type || 'theory');
  };

  // Save edited cell
  const handleSaveCell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCell) return;

    const updatedCell: TimetableCell = {
      subject: cellSubject.trim(),
      code: cellCode.trim().toUpperCase(),
      faculty: cellFaculty.trim(),
      venue: cellVenue.trim(),
      type: cellType,
    };

    setGridData((prev) => ({
      ...prev,
      [editingCell.day]: {
        ...prev[editingCell.day],
        [editingCell.slot]: updatedCell,
      },
    }));

    setEditingCell(null);
  };

  // Clear slot to free
  const handleClearSlot = () => {
    if (!editingCell) return;
    setGridData((prev) => ({
      ...prev,
      [editingCell.day]: {
        ...prev[editingCell.day],
        [editingCell.slot]: {
          subject: '',
          code: '',
          faculty: '',
          venue: '',
          type: 'free',
        },
      },
    }));
    setEditingCell(null);
  };

  // Clear all slots in timetable grid
  const handleResetToDefault = () => {
    if (window.confirm('Clear all classes in timetable grid?')) {
      setGridData(DEFAULT_GRID_DATA);
      try {
        localStorage.setItem('univia_timetable_grid_v2', JSON.stringify(DEFAULT_GRID_DATA));
      } catch {}
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Timetable Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EDE7F5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#FAF8FE] text-[#7033F5] border border-[#EDE7F5]">
              <Calendar className="w-4 h-4" />
            </span>
            <p className="text-xs uppercase tracking-wider text-[#7033F5] font-bold">
              Class Schedule
            </p>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#211B33]">
            Academic Time-Table
          </h2>
          <p className="text-xs text-[#7A728C]">
            View and organize your weekly classes, lectures, and lab slots. Click any cell to add or modify.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-[#7033F5] hover:bg-[#F3EEFC] border border-[#D9C8F0] text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Upload or update timetable photo"
          >
            <Upload className="w-3.5 h-3.5 text-[#7033F5]" />
            <span>{timetableImage ? 'Update Photo' : 'Upload Photo'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF8FE] text-[#7033F5] hover:bg-[#F3EEFC] border border-[#EAE0F8] text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Print Timetable"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Global Hidden File Input - always rendered so click handlers across all tabs work reliably */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Sub-Tabs: Grid vs Timetable Image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#EDE7F5] shadow-2xs">
        <div className="flex items-center gap-1.5 bg-[#FAF8FE] p-1 rounded-xl border border-[#EDE7F5]">
          <button
            onClick={() => setActiveSubTab('grid')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'grid'
                ? 'bg-[#7033F5] text-white shadow-2xs'
                : 'text-[#615975] hover:bg-[#F3ECFB]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Matrix Grid</span>
          </button>
          <button
            onClick={() => setActiveSubTab('image')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'image'
                ? 'bg-[#7033F5] text-white shadow-2xs'
                : 'text-[#615975] hover:bg-[#F3ECFB]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Timetable Photo / Image</span>
            {timetableImage && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5"></span>
            )}
          </button>
        </div>

        {activeSubTab === 'grid' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-[#DDD3ED] text-[#211B33] hover:bg-[#F4EFFB] transition-all shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#7033F5]" />
              <span>{timetableImage ? 'Update Photo' : 'Upload Photo'}</span>
            </button>
            <button
              onClick={() => openEditModal('Mon', '9:00 - 10:00')}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#7033F5] text-white hover:bg-[#5E24D9] transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Class / Slot</span>
            </button>
            <button
              onClick={handleResetToDefault}
              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg text-[#6E6582] hover:text-[#7033F5] hover:bg-[#F4EFFB] transition-colors cursor-pointer"
              title="Clear time table"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INTERACTIVE TIMETABLE MATRIX                                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'grid' && (
        <div className="space-y-4">
          {totalClassesCount === 0 && !timetableImage && (
            <div className="bg-[#FAF8FE] border border-[#E9DCFA] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EDE4FA] text-[#7033F5] flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#211B33]">No Time Table Added Yet</h4>
                  <p className="text-[11px] text-[#716885]">
                    Click "+ Add Class / Slot" or click any slot in the grid below to customize your schedule.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEditModal('Mon', '9:00 - 10:00')}
                  className="px-3 py-1.5 bg-[#7033F5] text-white text-xs font-bold rounded-xl hover:bg-[#5E24D9] transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New Time Table</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white border border-[#DDD3ED] text-[#211B33] text-xs font-bold rounded-xl hover:bg-[#F4EFFB] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#7033F5]" />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>
          )}
          {/* Course Highlighting Pills */}
          {availableCourses.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-[#6D6380] mr-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#7033F5]" />
                Filter by Subject:
              </span>
              <button
                onClick={() => setSelectedCourseFilter('all')}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedCourseFilter === 'all'
                    ? 'bg-[#7033F5] text-white shadow-xs'
                    : 'bg-white text-[#5F5670] hover:bg-[#F4EFFB] border border-[#EBE3F5]'
                }`}
              >
                Show All
              </button>
              {availableCourses.map((course) => (
                <button
                  key={course}
                  onClick={() => setSelectedCourseFilter(course)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedCourseFilter === course
                      ? 'bg-[#7033F5] text-white shadow-xs'
                      : 'bg-white text-[#5F5670] hover:bg-[#F4EFFB] border border-[#EBE3F5]'
                  }`}
                >
                  {course}
                </button>
              ))}
            </div>
          )}

          {/* Full Timetable Matrix Grid */}
          <div className="bg-white rounded-3xl border border-[#EDE7F5] shadow-xs overflow-hidden">
            <div className="p-4 bg-[#FAF8FE] border-b border-[#EDE7F5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-[#211B33]">
                  Weekly Time-Table Matrix (Click cell to edit)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFEBFA] text-[#7033F5]">
                  8 Daily Time Slots
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#736A85] font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-blue-100 border border-blue-300 inline-block"></span>
                  Lecture
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-300 inline-block"></span>
                  Lab Practical
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-300 inline-block"></span>
                  Break / Tutorial
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-[#F6F2FB] dark:bg-[#1E293B] text-[#4E4461] dark:text-[#E2E8F0] border-b border-[#E6DCF5] dark:border-[#334155] text-center font-bold">
                    <th className="py-3 px-3 w-20 text-left border-r border-[#E6DCF5] dark:border-[#334155]">
                      Day / Time
                    </th>
                    {TIME_SLOTS.map((slot) => (
                      <th key={slot} className="py-3 px-2 border-r border-[#E6DCF5] dark:border-[#334155] last:border-r-0">
                        {slot}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE7F5] dark:divide-[#334155]">
                  {DAYS.map((day) => (
                    <tr key={day} className="hover:bg-[#FCFAFE] dark:hover:bg-[#1E293B]/40 transition-colors">
                      <td className="p-3 font-extrabold text-[#211B33] dark:text-[#F8FAFC] bg-[#FAF8FE] dark:bg-[#1E293B]/70 border-r border-[#EDE7F5] dark:border-[#334155]">
                        {day}
                      </td>
                      {TIME_SLOTS.map((slot) => {
                        const cell = gridData[day]?.[slot] || {
                          subject: '',
                          code: '',
                          faculty: '',
                          venue: '',
                          type: 'free',
                        };

                        const isMatchFilter =
                          selectedCourseFilter === 'all' ||
                          (cell.code && cell.code.toUpperCase() === selectedCourseFilter.toUpperCase());

                        const isFree = !cell.subject || cell.type === 'free';
                        const isBreak = cell.type === 'break';
                        const isLab = cell.type === 'lab';
                        const isTutorial = cell.type === 'tutorial';

                        let cellBg = 'bg-[#FAF8FD] dark:bg-[#0F172A] text-[#9E95AF] dark:text-[#64748B]';
                        if (!isFree) {
                          if (isBreak) cellBg = 'bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800/60';
                          else if (isLab) cellBg = 'bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/60';
                          else if (isTutorial) cellBg = 'bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800/60';
                          else cellBg = 'bg-purple-50/80 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-950 dark:text-purple-200 border-purple-200 dark:border-purple-800/60';
                        }

                        return (
                          <td
                            key={slot}
                            onClick={() => openEditModal(day, slot)}
                            className={`p-2 text-center cursor-pointer transition-all border-r border-[#EDE7F5] dark:border-[#334155] last:border-r-0 relative group ${cellBg} ${
                              !isMatchFilter && !isFree ? 'opacity-25' : ''
                            }`}
                            title="Click to edit or view this slot"
                          >
                            {isFree ? (
                              <div className="py-2 text-[#ABA2BD] dark:text-[#64748B] group-hover:text-[#7033F5] dark:group-hover:text-[#A78BFA] transition-colors">
                                <span className="text-xs group-hover:hidden">—</span>
                                <span className="hidden group-hover:inline text-[10px] font-bold">
                                  + Edit
                                </span>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <div className="font-extrabold text-[11px] leading-tight">
                                  {cell.subject}
                                </div>
                                {cell.code && (
                                  <span className="inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-white/80 dark:bg-white/15 text-[#211B33] dark:text-white">
                                    {cell.code}
                                  </span>
                                )}
                                {cell.faculty && (
                                  <div className="text-[10px] opacity-80 truncate">
                                    {cell.faculty}
                                  </div>
                                )}
                                {cell.venue && (
                                  <div className="text-[9px] opacity-70">
                                    {cell.venue}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TIMETABLE PHOTO / IMAGE UPLOAD & PREVIEW                           */}
      {/* ========================================================================= */}
      {activeSubTab === 'image' && (
        <div className="bg-white rounded-3xl border border-[#EDE7F5] p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F2EDFA]">
            <div>
              <h3 className="font-extrabold text-base text-[#211B33] flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#7033F5]" />
                <span>My Official Timetable Photo / Notice</span>
              </h3>
              <p className="text-xs text-[#7A728E] mt-0.5">
                Keep a photo of your college notice board, classroom schedule chart, or scanned timetable.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#7033F5] text-white hover:bg-[#5E22E2] text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{timetableImage ? 'Update Photo / New Image' : 'Upload Timetable Photo'}</span>
              </button>

              {timetableImage && (
                <button
                  onClick={handleRemoveImage}
                  className="p-2 rounded-xl bg-[#FAF8FE] border border-[#E9E1F5] text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {timetableImage && timetableImage.trim() ? (
            <div className="space-y-3">
              <div className="relative rounded-2xl border border-[#EDE7F5] bg-[#F9F7FC] overflow-hidden group flex items-center justify-center p-2 max-h-[600px]">
                <img
                  src={timetableImage}
                  alt="Student Timetable Schedule"
                  className="max-h-[580px] w-auto max-w-full object-contain rounded-xl shadow-xs"
                />
                <button
                  onClick={() => setIsZoomImageOpen(true)}
                  className="absolute top-4 right-4 p-2.5 rounded-xl bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs transition-colors flex items-center gap-1 text-xs font-bold shadow-md cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Full View</span>
                </button>
              </div>
              <p className="text-xs text-[#7B728D] text-center">
                Stored in browser storage. Click &quot;Full View&quot; to inspect full resolution.
              </p>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#DDCFF2] rounded-3xl p-10 text-center bg-[#FAF8FE] hover:bg-[#F4EEFC] transition-colors cursor-pointer space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#EFE8FA] text-[#7033F5] flex items-center justify-center mx-auto shadow-2xs">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#211B33]">
                  Click to Upload Your Class Timetable Image
                </h4>
                <p className="text-xs text-[#7B728D] mt-1 max-w-md mx-auto">
                  Take a picture of the university notice board or upload your department&apos;s timetable screenshot (PNG, JPG, WEBP).
                </p>
              </div>
              <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-white border border-[#DDD0F4] text-[#7033F5]">
                Select Image from Device
              </span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT TIME SLOT                                                   */}
      {/* ========================================================================= */}
      {editingCell && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#EDE7F5] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F2EDFA]">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#7033F5]" />
                <h3 className="font-extrabold text-base text-[#211B33]">
                  Edit Slot: {editingCell.day} ({editingCell.slot})
                </h3>
              </div>
              <button
                onClick={() => setEditingCell(null)}
                className="p-1.5 rounded-xl text-[#7A728D] hover:bg-[#F3ECFB] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCell} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#342D45] block mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={cellSubject}
                  onChange={(e) => setCellSubject(e.target.value)}
                  placeholder="e.g. Programming with Python"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#342D45] block mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={cellCode}
                    onChange={(e) => setCellCode(e.target.value)}
                    placeholder="e.g. BAI-110"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#342D45] block mb-1">
                    Slot Type
                  </label>
                  <select
                    value={cellType}
                    onChange={(e) => setCellType(e.target.value as TimetableCell['type'])}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  >
                    <option value="theory">Lecture / Theory</option>
                    <option value="lab">Lab Practical</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="break">Lunch / Break</option>
                    <option value="free">Free / Empty</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#342D45] block mb-1">
                    Faculty / Teacher
                  </label>
                  <input
                    type="text"
                    value={cellFaculty}
                    onChange={(e) => setCellFaculty(e.target.value)}
                    placeholder="e.g. Dr. Aarti"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#342D45] block mb-1">
                    Room / Lab Venue
                  </label>
                  <input
                    type="text"
                    value={cellVenue}
                    onChange={(e) => setCellVenue(e.target.value)}
                    placeholder="e.g. LH-05 or Lab 102"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-[#F2EDFA]">
                <button
                  type="button"
                  onClick={handleClearSlot}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Slot</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCell(null)}
                    className="px-4 py-2 rounded-xl text-[#6D657F] hover:bg-[#F3EEFA] font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#7033F5] text-white font-bold hover:bg-[#5E22E2] shadow-xs cursor-pointer"
                  >
                    Save Slot
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FULL IMAGE ZOOM PREVIEW                                          */}
      {/* ========================================================================= */}
      {isZoomImageOpen && timetableImage && timetableImage.trim() && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setIsZoomImageOpen(false)}
              className="absolute -top-12 right-0 px-3 py-1.5 rounded-xl bg-white text-[#211B33] font-bold text-xs hover:bg-gray-100 flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <X className="w-4 h-4" />
              <span>Close Fullscreen</span>
            </button>
            <img
              src={timetableImage}
              alt="Timetable Zoomed"
              className="max-h-[85vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
};
