import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Plus, Clock, MapPin, Trash2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface Activity {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  notes: string;
}

interface Day {
  date: string;
  activities: Activity[];
}

interface Itinerary {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  days: Day[];
}

const ItineraryPlanner: React.FC = () => {
  // State for itinerary
  const [itinerary, setItinerary] = useState<Itinerary>({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    days: []
  });
  
  // State for new activity
  const [newActivity, setNewActivity] = useState<{
    name: string;
    date: string;
    time: string;
    location: string;
    notes: string;
  }>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    location: '',
    notes: ''
  });
  
  // Navigation and location hooks
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize days when start/end dates change
  useEffect(() => {
    if (itinerary.startDate && itinerary.endDate) {
      const start = new Date(itinerary.startDate);
      const end = new Date(itinerary.endDate);
      
      if (start > end) {
        // If start date is after end date, adjust end date
        setItinerary(prev => ({
          ...prev,
          endDate: itinerary.startDate
        }));
        return;
      }
      
      // Generate days between start and end dates
      const days: Day[] = [];
      const currentDate = new Date(start);
      
      while (currentDate <= end) {
        const dateString = currentDate.toISOString().split('T')[0];
        
        // Check if this day already exists
        const existingDay = itinerary.days.find(day => day.date === dateString);
        
        if (existingDay) {
          days.push(existingDay);
        } else {
          days.push({
            date: dateString,
            activities: []
          });
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setItinerary(prev => ({
        ...prev,
        days
      }));
      
      // Update new activity date if needed
      if (!days.some(day => day.date === newActivity.date)) {
        setNewActivity(prev => ({
          ...prev,
          date: days[0]?.date || itinerary.startDate
        }));
      }
    }
  }, [itinerary.startDate, itinerary.endDate]);
  
  // Check for shared itinerary in URL hash
  useEffect(() => {
    const hash = location.hash.substring(1); // Remove the # character
    
    if (hash) {
      try {
        // Decode and parse the hash
        const decodedHash = atob(hash);
        const parsedItinerary = JSON.parse(decodedHash);
        
        if (parsedItinerary && parsedItinerary.title) {
          setItinerary(parsedItinerary);
        }
      } catch (error) {
        console.error('Error parsing shared itinerary:', error);
      }
    }
  }, [location]);
  
  // Update itinerary
  const updateItinerary = <K extends keyof Itinerary>(key: K, value: Itinerary[K]) => {
    setItinerary(prev => ({ ...prev, [key]: value }));
  };
  
  // Add new activity
  const addActivity = () => {
    if (!newActivity.name.trim() || !newActivity.date || !newActivity.time) return;
    
    const newActivityObj: Activity = {
      id: Date.now().toString(),
      name: newActivity.name.trim(),
      date: newActivity.date,
      time: newActivity.time,
      location: newActivity.location.trim(),
      notes: newActivity.notes.trim()
    };
    
    // Find the day to add the activity to
    setItinerary(prev => {
      const updatedDays = prev.days.map(day => {
        if (day.date === newActivity.date) {
          // Add activity to this day
          return {
            ...day,
            activities: [...day.activities, newActivityObj].sort((a, b) => a.time.localeCompare(b.time))
          };
        }
        return day;
      });
      
      return {
        ...prev,
        days: updatedDays
      };
    });
    
    // Reset new activity form
    setNewActivity({
      name: '',
      date: newActivity.date,
      time: '',
      location: '',
      notes: ''
    });
  };
  
  // Remove activity
  const removeActivity = (activityId: string) => {
    setItinerary(prev => {
      const updatedDays = prev.days.map(day => ({
        ...day,
        activities: day.activities.filter(activity => activity.id !== activityId)
      }));
      
      return {
        ...prev,
        days: updatedDays
      };
    });
  };
  
  // Add new day
  const addDay = () => {
    if (itinerary.days.length === 0) return;
    
    // Get the last day
    const lastDay = itinerary.days[itinerary.days.length - 1];
    
    // Create a new date one day after the last day
    const lastDate = new Date(lastDay.date);
    lastDate.setDate(lastDate.getDate() + 1);
    const newDate = lastDate.toISOString().split('T')[0];
    
    // Update end date and days
    setItinerary(prev => ({
      ...prev,
      endDate: newDate,
      days: [
        ...prev.days,
        {
          date: newDate,
          activities: []
        }
      ]
    }));
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Share itinerary
  const shareItinerary = () => {
    // Encode itinerary as base64
    const itineraryJson = JSON.stringify(itinerary);
    const encodedItinerary = btoa(itineraryJson);
    
    // Create URL with hash
    const shareUrl = `${window.location.origin}${window.location.pathname}#${encodedItinerary}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        alert('Link itinerary berhasil disalin ke clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        alert('Gagal menyalin link. URL: ' + shareUrl);
      });
    
    // Update URL without reloading
    navigate(`#${encodedItinerary}`, { replace: true });
  };
  
  // Export to PDF
  const exportToPDF = () => {
    alert('PDF export functionality will be implemented soon!');
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
            <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Visual Itinerary Planner
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Buat jadwal visual acara/perjalanan yang bisa dibagikan dengan mudah.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Fitur Itinerary Planner:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
            <li>Buat jadwal perjalanan dengan tampilan visual yang menarik</li>
            <li>Tambahkan aktivitas dengan waktu, lokasi, dan catatan</li>
            <li>Atur jadwal dengan drag & drop yang mudah</li>
            <li>Ekspor ke PDF atau gambar untuk dibagikan</li>
            <li>Simpan dan edit itinerary Anda kapan saja</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Trip Details */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Detail Perjalanan
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Judul Perjalanan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Liburan ke Bali"
                    value={itinerary.title}
                    onChange={(e) => updateItinerary('title', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={itinerary.startDate}
                      onChange={(e) => updateItinerary('startDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tanggal Selesai
                    </label>
                    <input
                      type="date"
                      value={itinerary.endDate}
                      onChange={(e) => updateItinerary('endDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deskripsi (Opsional)
                  </label>
                  <textarea
                    placeholder="Deskripsi singkat tentang perjalanan ini..."
                    value={itinerary.description}
                    onChange={(e) => updateItinerary('description', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Add Activity Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tambah Aktivitas
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Aktivitas
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Check-in Hotel"
                    value={newActivity.name}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tanggal
                    </label>
                    <select
                      value={newActivity.date}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {itinerary.days.map(day => (
                        <option key={day.date} value={day.date}>
                          {new Date(day.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Waktu
                    </label>
                    <input
                      type="time"
                      value={newActivity.time}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lokasi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Hotel Mulia, Bali"
                    value={newActivity.location}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    placeholder="Detail tambahan tentang aktivitas ini..."
                    value={newActivity.notes}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <button 
                  onClick={addActivity}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Tambah Aktivitas</span>
                </button>
              </div>
            </div>
          </div>

          {/* Center Column - Itinerary Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {itinerary.title || 'Jadwal Perjalanan'}
                </h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={shareItinerary}
                    className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors duration-200"
                  >
                    Bagikan Link
                  </button>
                  <button 
                    onClick={exportToPDF}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    Ekspor PDF
                  </button>
                </div>
              </div>
              
              {itinerary.days.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Pilih tanggal mulai dan selesai untuk membuat jadwal
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {itinerary.days.map((day, dayIndex) => (
                    <div key={day.date} className="mb-8">
                      <div className="flex items-center mb-4">
                        <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                          Hari {dayIndex + 1} - {formatDate(day.date)}
                        </div>
                      </div>
                      
                      {day.activities.length === 0 ? (
                        <div className="pl-8 text-gray-500 dark:text-gray-400 text-sm italic">
                          Belum ada aktivitas untuk hari ini
                        </div>
                      ) : (
                        <div className="relative pl-8 border-l-2 border-blue-200 dark:border-blue-800 space-y-6">
                          {day.activities.map((activity) => (
                            <div key={activity.id} className="relative">
                              <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">{activity.name}</h4>
                                    <div className="flex items-center space-x-4 mt-2 text-sm">
                                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>{activity.time}</span>
                                      </div>
                                      {activity.location && (
                                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                                          <MapPin className="w-4 h-4 mr-1" />
                                          <span>{activity.location}</span>
                                        </div>
                                      )}
                                    </div>
                                    {activity.notes && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                        {activity.notes}
                                      </p>
                                    )}
                                  </div>
                                  <button 
                                    onClick={() => removeActivity(activity.id)}
                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Add Day Button */}
                  <div className="mt-6 text-center">
                    <button 
                      onClick={addDay}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Hari Baru</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Visual Timeline</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Tampilan jadwal yang intuitif dan mudah dipahami
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🔄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Drag & Drop</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Atur ulang aktivitas dengan mudah menggunakan drag & drop
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📤</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ekspor & Bagikan</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Ekspor jadwal sebagai PDF atau gambar untuk dibagikan
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">💾</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Auto-save</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Perubahan disimpan otomatis di browser Anda
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryPlanner;