import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Plus, Trash2, Clock, Calendar, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Subject {
  id: string;
  name: string;
  priority: 'low' | 'medium' | 'high';
  color: string;
}

interface StudySession {
  id: string;
  subjectId: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  target: string;
}

const StudyPlanner: React.FC = () => {
  // State for subjects
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Matematika', priority: 'high', color: '#ef4444' },
    { id: '2', name: 'Fisika', priority: 'medium', color: '#f59e0b' },
    { id: '3', name: 'Bahasa Inggris', priority: 'low', color: '#10b981' }
  ]);
  
  // State for study sessions
  const [studySessions, setStudySessions] = useState<StudySession[]>([
    { 
      id: '1', 
      subjectId: '1', 
      day: 'monday', 
      startTime: '09:00', 
      endTime: '10:30',
      target: 'Belajar Kalkulus Bab 3'
    },
    { 
      id: '2', 
      subjectId: '2', 
      day: 'wednesday', 
      startTime: '14:00', 
      endTime: '15:30',
      target: 'Latihan soal Fisika Mekanika'
    },
    { 
      id: '3', 
      subjectId: '3', 
      day: 'friday', 
      startTime: '16:00', 
      endTime: '17:00',
      target: 'Latihan speaking dan listening'
    }
  ]);
  
  // State for new subject
  const [newSubject, setNewSubject] = useState<{
    name: string;
    priority: 'low' | 'medium' | 'high';
  }>({
    name: '',
    priority: 'medium'
  });
  
  // State for new study session
  const [newSession, setNewSession] = useState<{
    subjectId: string;
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    startTime: string;
    endTime: string;
    target: string;
  }>({
    subjectId: '',
    day: 'monday',
    startTime: '',
    endTime: '',
    target: ''
  });
  
  // Initialize new session subject ID when subjects change
  useEffect(() => {
    if (subjects.length > 0 && !newSession.subjectId) {
      setNewSession(prev => ({ ...prev, subjectId: subjects[0].id }));
    }
  }, [subjects]);
  
  // Add new subject
  const addSubject = () => {
    if (!newSubject.name.trim()) return;
    
    // Generate a color based on priority
    let color = '';
    switch (newSubject.priority) {
      case 'high':
        color = '#ef4444'; // Red
        break;
      case 'medium':
        color = '#f59e0b'; // Yellow
        break;
      case 'low':
        color = '#10b981'; // Green
        break;
    }
    
    const newSubjectObj: Subject = {
      id: Date.now().toString(),
      name: newSubject.name.trim(),
      priority: newSubject.priority,
      color
    };
    
    setSubjects(prev => [...prev, newSubjectObj]);
    setNewSubject({
      name: '',
      priority: 'medium'
    });
  };
  
  // Remove subject
  const removeSubject = (id: string) => {
    setSubjects(prev => prev.filter(subject => subject.id !== id));
    
    // Also remove associated study sessions
    setStudySessions(prev => prev.filter(session => session.subjectId !== id));
  };
  
  // Add new study session
  const addStudySession = () => {
    if (!newSession.subjectId || !newSession.startTime || !newSession.endTime) return;
    
    const newSessionObj: StudySession = {
      id: Date.now().toString(),
      subjectId: newSession.subjectId,
      day: newSession.day,
      startTime: newSession.startTime,
      endTime: newSession.endTime,
      target: newSession.target.trim()
    };
    
    setStudySessions(prev => [...prev, newSessionObj]);
    setNewSession({
      subjectId: newSession.subjectId,
      day: 'monday',
      startTime: '',
      endTime: '',
      target: ''
    });
  };
  
  // Remove study session
  const removeStudySession = (id: string) => {
    setStudySessions(prev => prev.filter(session => session.id !== id));
  };
  
  // Get subject by ID
  const getSubject = (id: string): Subject | undefined => {
    return subjects.find(subject => subject.id === id);
  };
  
  // Get priority label
  const getPriorityLabel = (priority: 'low' | 'medium' | 'high'): string => {
    switch (priority) {
      case 'low':
        return 'Rendah';
      case 'medium':
        return 'Sedang';
      case 'high':
        return 'Tinggi';
    }
  };
  
  // Get priority color class
  const getPriorityColorClass = (priority: 'low' | 'medium' | 'high'): string => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'high':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
    }
  };
  
  // Get day label
  const getDayLabel = (day: string): string => {
    switch (day) {
      case 'monday':
        return 'Senin';
      case 'tuesday':
        return 'Selasa';
      case 'wednesday':
        return 'Rabu';
      case 'thursday':
        return 'Kamis';
      case 'friday':
        return 'Jumat';
      case 'saturday':
        return 'Sabtu';
      case 'sunday':
        return 'Minggu';
      default:
        return day;
    }
  };
  
  // Format time (24h to 12h)
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    
    if (hour < 12) {
      return `${hour === 0 ? '12' : hour}:${minutes} AM`;
    } else {
      return `${hour === 12 ? '12' : hour - 12}:${minutes} PM`;
    }
  };
  
  // Save study plan
  const saveStudyPlan = () => {
    const studyPlan = {
      subjects,
      studySessions
    };
    
    const studyPlanJson = JSON.stringify(studyPlan);
    
    // Create a download link
    const blob = new Blob([studyPlanJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'study-plan.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Export to PDF
  const exportToPDF = () => {
    alert('PDF export functionality will be implemented soon!');
  };
  
  // Get sessions for a specific day
  const getSessionsForDay = (day: string): StudySession[] => {
    return studySessions
      .filter(session => session.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };
  
  // Get time slots for schedule
  const getTimeSlots = (): string[] => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };
  
  // Check if a session is at a specific time slot
  const isSessionAtTimeSlot = (session: StudySession, timeSlot: string): boolean => {
    const [slotHour] = timeSlot.split(':').map(Number);
    const [sessionStartHour] = session.startTime.split(':').map(Number);
    const [sessionEndHour] = session.endTime.split(':').map(Number);
    
    return sessionStartHour <= slotHour && sessionEndHour > slotHour;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Study Planner
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Buat jadwal belajar mingguan untuk berbagai mata pelajaran.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-3">
            Fitur Study Planner:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-200">
            <li>Buat jadwal belajar mingguan yang terstruktur</li>
            <li>Atur waktu belajar untuk setiap mata pelajaran</li>
            <li>Tetapkan prioritas dan target untuk setiap sesi</li>
            <li>Pantau kemajuan dan capaian belajar</li>
            <li>Ekspor jadwal ke PDF atau kalender digital</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Subjects */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Mata Pelajaran
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Tambah mata pelajaran baru"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <select
                    value={newSubject.priority}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                  </select>
                  <button 
                    onClick={addSubject}
                    className="p-2 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded hover:bg-amber-200 dark:hover:bg-amber-800/30 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2 mt-4">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: subject.color }}></div>
                        <span className="text-gray-900 dark:text-white">{subject.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 ${getPriorityColorClass(subject.priority)} rounded-full`}>
                          {getPriorityLabel(subject.priority)}
                        </span>
                        <button 
                          onClick={() => removeSubject(subject.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Study Session Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tambah Sesi Belajar
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mata Pelajaran
                  </label>
                  <select
                    value={newSession.subjectId}
                    onChange={(e) => setNewSession(prev => ({ ...prev, subjectId: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hari
                  </label>
                  <select
                    value={newSession.day}
                    onChange={(e) => setNewSession(prev => ({ ...prev, day: e.target.value as any }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="monday">Senin</option>
                    <option value="tuesday">Selasa</option>
                    <option value="wednesday">Rabu</option>
                    <option value="thursday">Kamis</option>
                    <option value="friday">Jumat</option>
                    <option value="saturday">Sabtu</option>
                    <option value="sunday">Minggu</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Waktu Mulai
                    </label>
                    <input
                      type="time"
                      value={newSession.startTime}
                      onChange={(e) => setNewSession(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Waktu Selesai
                    </label>
                    <input
                      type="time"
                      value={newSession.endTime}
                      onChange={(e) => setNewSession(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Belajar
                  </label>
                  <textarea
                    placeholder="Apa yang ingin Anda pelajari dalam sesi ini?"
                    value={newSession.target}
                    onChange={(e) => setNewSession(prev => ({ ...prev, target: e.target.value }))}
                    rows={2}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <button 
                  onClick={addStudySession}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Tambah ke Jadwal</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Weekly Schedule */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Jadwal Mingguan
                </h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={saveStudyPlan}
                    className="px-3 py-1 text-sm bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded hover:bg-amber-200 dark:hover:bg-amber-800/30 transition-colors duration-200 flex items-center space-x-1"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan</span>
                  </button>
                  <button 
                    onClick={exportToPDF}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    Ekspor PDF
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="w-20 p-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Waktu
                      </th>
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                        <th key={day} className="p-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {getDayLabel(day)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {getTimeSlots().map((timeSlot) => (
                      <tr key={timeSlot}>
                        <td className="p-2 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400">
                          {timeSlot}
                        </td>
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                          const sessionsForDay = getSessionsForDay(day);
                          const sessionAtTimeSlot = sessionsForDay.find(session => isSessionAtTimeSlot(session, timeSlot));
                          
                          return (
                            <td key={`${day}-${timeSlot}`} className="p-2 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white">
                              {sessionAtTimeSlot && (
                                <div 
                                  className="p-2 rounded text-xs"
                                  style={{ backgroundColor: `${getSubject(sessionAtTimeSlot.subjectId)?.color}20` }}
                                >
                                  <div 
                                    className="font-medium" 
                                    style={{ color: getSubject(sessionAtTimeSlot.subjectId)?.color }}
                                  >
                                    {getSubject(sessionAtTimeSlot.subjectId)?.name}
                                  </div>
                                  <div className="text-gray-600 dark:text-gray-400 mt-1">
                                    {sessionAtTimeSlot.startTime} - {sessionAtTimeSlot.endTime}
                                  </div>
                                  {sessionAtTimeSlot.target && (
                                    <div className="mt-1 text-gray-500 dark:text-gray-400 italic">
                                      {sessionAtTimeSlot.target}
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
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📚</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Terstruktur</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Jadwal belajar yang terorganisir dan efisien
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">⏱️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Manajemen Waktu</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Alokasikan waktu yang tepat untuk setiap mata pelajaran
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Target Jelas</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Tetapkan tujuan spesifik untuk setiap sesi belajar
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📱</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ekspor & Bagikan</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Ekspor jadwal ke PDF atau kalender digital
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;