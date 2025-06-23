import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, Plus, Trash2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TimeZone {
  id: string;
  name: string;
  city: string;
  offset: number; // Offset in minutes from UTC
  countryCode: string;
}

interface Location {
  id: string;
  timezone: TimeZone;
  workingHours: {
    start: string; // Format: "09:00"
    end: string;   // Format: "17:00"
  };
}

const WorldTimeCalculator: React.FC = () => {
  // State for locations
  const [locations, setLocations] = useState<Location[]>([
    {
      id: '1',
      timezone: {
        id: 'asia_jakarta',
        name: 'WIB (UTC+7)',
        city: 'Jakarta',
        offset: 420, // UTC+7 in minutes
        countryCode: 'ID'
      },
      workingHours: {
        start: '09:00',
        end: '17:00'
      }
    },
    {
      id: '2',
      timezone: {
        id: 'america_new_york',
        name: 'EST (UTC-5)',
        city: 'New York',
        offset: -300, // UTC-5 in minutes
        countryCode: 'US'
      },
      workingHours: {
        start: '09:00',
        end: '17:00'
      }
    },
    {
      id: '3',
      timezone: {
        id: 'europe_london',
        name: 'GMT (UTC+0)',
        city: 'London',
        offset: 0, // UTC+0 in minutes
        countryCode: 'GB'
      },
      workingHours: {
        start: '09:00',
        end: '17:00'
      }
    }
  ]);
  
  // State for search and add location
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredTimezones, setFilteredTimezones] = useState<TimeZone[]>([]);
  const [selectedTimezone, setSelectedTimezone] = useState<TimeZone | null>(null);
  const [workingHoursStart, setWorkingHoursStart] = useState<string>('09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState<string>('17:00');
  
  // State for current time
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'comparison' | 'meeting' | 'converter'>('comparison');
  
  // State for meeting finder
  const [meetingDate, setMeetingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [meetingTime, setMeetingTime] = useState<string>('14:00');
  const [meetingTimezone, setMeetingTimezone] = useState<string>('asia_jakarta');
  const [meetingDuration, setMeetingDuration] = useState<number>(60); // minutes
  
  // Reference for interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Available timezones
  const availableTimezones: TimeZone[] = [
    { id: 'asia_jakarta', name: 'WIB (UTC+7)', city: 'Jakarta', offset: 420, countryCode: 'ID' },
    { id: 'asia_makassar', name: 'WITA (UTC+8)', city: 'Makassar', offset: 480, countryCode: 'ID' },
    { id: 'asia_jayapura', name: 'WIT (UTC+9)', city: 'Jayapura', offset: 540, countryCode: 'ID' },
    { id: 'america_new_york', name: 'EST (UTC-5)', city: 'New York', offset: -300, countryCode: 'US' },
    { id: 'america_los_angeles', name: 'PST (UTC-8)', city: 'Los Angeles', offset: -480, countryCode: 'US' },
    { id: 'america_chicago', name: 'CST (UTC-6)', city: 'Chicago', offset: -360, countryCode: 'US' },
    { id: 'europe_london', name: 'GMT (UTC+0)', city: 'London', offset: 0, countryCode: 'GB' },
    { id: 'europe_paris', name: 'CET (UTC+1)', city: 'Paris', offset: 60, countryCode: 'FR' },
    { id: 'europe_berlin', name: 'CET (UTC+1)', city: 'Berlin', offset: 60, countryCode: 'DE' },
    { id: 'asia_tokyo', name: 'JST (UTC+9)', city: 'Tokyo', offset: 540, countryCode: 'JP' },
    { id: 'asia_singapore', name: 'SGT (UTC+8)', city: 'Singapore', offset: 480, countryCode: 'SG' },
    { id: 'australia_sydney', name: 'AEST (UTC+10)', city: 'Sydney', offset: 600, countryCode: 'AU' },
    { id: 'asia_dubai', name: 'GST (UTC+4)', city: 'Dubai', offset: 240, countryCode: 'AE' },
    { id: 'asia_kolkata', name: 'IST (UTC+5:30)', city: 'Mumbai', offset: 330, countryCode: 'IN' },
    { id: 'america_sao_paulo', name: 'BRT (UTC-3)', city: 'São Paulo', offset: -180, countryCode: 'BR' }
  ];
  
  // Update current time every second
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Filter timezones based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTimezones([]);
      return;
    }
    
    const filtered = availableTimezones.filter(tz => 
      tz.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tz.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredTimezones(filtered);
  }, [searchTerm]);
  
  // Add a new location
  const addLocation = () => {
    if (!selectedTimezone) return;
    
    const newLocation: Location = {
      id: Date.now().toString(),
      timezone: selectedTimezone,
      workingHours: {
        start: workingHoursStart,
        end: workingHoursEnd
      }
    };
    
    setLocations(prev => [...prev, newLocation]);
    setSearchTerm('');
    setSelectedTimezone(null);
  };
  
  // Remove a location
  const removeLocation = (id: string) => {
    setLocations(prev => prev.filter(location => location.id !== id));
  };
  
  // Get time in a specific timezone
  const getTimeInTimezone = (date: Date, offsetMinutes: number): Date => {
    // Get UTC time in milliseconds
    const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
    
    // Create new date object for the target timezone
    return new Date(utcTime + offsetMinutes * 60000);
  };
  
  // Format time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };
  
  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Check if time is within working hours
  const isWorkingHours = (time: Date, workingHours: { start: string, end: string }): boolean => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const timeInMinutes = hours * 60 + minutes;
    
    const [startHours, startMinutes] = workingHours.start.split(':').map(Number);
    const [endHours, endMinutes] = workingHours.end.split(':').map(Number);
    
    const startInMinutes = startHours * 60 + startMinutes;
    const endInMinutes = endHours * 60 + endMinutes;
    
    return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
  };
  
  // Find best meeting time
  const findBestMeetingTime = (): { time: string, status: 'optimal' | 'partial' | 'outside' }[] => {
    // This is a simplified implementation
    // In a real app, you would need a more sophisticated algorithm
    
    // For now, just return some sample times
    return [
      { time: '13:00 - 15:00 WIB', status: 'optimal' },
      { time: '16:00 - 18:00 WIB', status: 'partial' },
      { time: '22:00 - 00:00 WIB', status: 'outside' }
    ];
  };
  
  // Convert meeting time to all timezones
  const convertMeetingTime = (): { location: Location, localTime: string, status: 'working' | 'outside' }[] => {
    if (!meetingDate || !meetingTime || !meetingTimezone) return [];
    
    // Find the source timezone
    const sourceTimezone = availableTimezones.find(tz => tz.id === meetingTimezone);
    if (!sourceTimezone) return [];
    
    // Create date object for the meeting time in the source timezone
    const [year, month, day] = meetingDate.split('-').map(Number);
    const [hours, minutes] = meetingTime.split(':').map(Number);
    
    // Create a date in UTC, then adjust for the source timezone
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    const sourceOffset = sourceTimezone.offset;
    const utcTime = utcDate.getTime() - sourceOffset * 60000;
    
    // Convert to each location's timezone
    return locations.map(location => {
      const localDate = new Date(utcTime + location.timezone.offset * 60000);
      const localTimeStr = formatTime(localDate);
      const isWorking = isWorkingHours(localDate, location.workingHours);
      
      return {
        location,
        localTime: `${formatDate(localDate)} ${localTimeStr}`,
        status: isWorking ? 'working' : 'outside'
      };
    });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/20 rounded-full mb-4">
            <Clock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Kalkulator Waktu Dunia
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Bandingkan zona waktu & cari jadwal rapat ideal untuk tim global.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-3">
            Fitur Kalkulator Waktu Dunia:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-indigo-800 dark:text-indigo-200">
            <li>Bandingkan waktu di berbagai kota di seluruh dunia</li>
            <li>Temukan waktu yang cocok untuk rapat tim internasional</li>
            <li>Konversi waktu antar zona waktu dengan mudah</li>
            <li>Lihat jam kerja yang tumpang tindih untuk tim global</li>
            <li>Simpan zona waktu favorit untuk akses cepat</li>
          </ul>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-6">
            <button 
              onClick={() => setActiveTab('comparison')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'comparison'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Perbandingan Zona Waktu
            </button>
            <button 
              onClick={() => setActiveTab('meeting')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'meeting'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Pencari Waktu Rapat
            </button>
            <button 
              onClick={() => setActiveTab('converter')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'converter'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Konverter Zona Waktu
            </button>
          </div>

          {/* Time Zone Comparison */}
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              {/* Add Location */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari kota atau zona waktu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                {filteredTimezones.length > 0 && (
                  <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredTimezones.map(timezone => (
                      <button
                        key={timezone.id}
                        onClick={() => {
                          setSelectedTimezone(timezone);
                          setSearchTerm('');
                          setFilteredTimezones([]);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{timezone.city}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{timezone.name}</div>
                      </button>
                    ))}
                  </div>
                )}
                
                {selectedTimezone && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{selectedTimezone.city}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{selectedTimezone.name}</div>
                      </div>
                      <button
                        onClick={() => setSelectedTimezone(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Jam Kerja Mulai
                        </label>
                        <input
                          type="time"
                          value={workingHoursStart}
                          onChange={(e) => setWorkingHoursStart(e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Jam Kerja Selesai
                        </label>
                        <input
                          type="time"
                          value={workingHoursEnd}
                          onChange={(e) => setWorkingHoursEnd(e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={addLocation}
                      className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded font-medium transition-colors duration-200"
                    >
                      Tambahkan Lokasi
                    </button>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {availableTimezones.slice(0, 5).map((timezone) => (
                    <button 
                      key={timezone.id}
                      onClick={() => {
                        setSelectedTimezone(timezone);
                        setSearchTerm('');
                        setFilteredTimezones([]);
                      }}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      {timezone.city} ({timezone.name.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Time Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lokasi</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Zona Waktu</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Waktu Saat Ini</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jam Kerja</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {locations.map((location) => {
                      const localTime = getTimeInTimezone(currentTime, location.timezone.offset);
                      const isWorking = isWorkingHours(localTime, location.workingHours);
                      
                      return (
                        <tr key={location.id}>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{location.timezone.city}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{location.timezone.name}</td>
                          <td className="px-4 py-3 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                            {formatTime(localTime)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {location.workingHours.start} - {location.workingHours.end}
                            <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                              isWorking 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {isWorking ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button 
                              onClick={() => removeLocation(location.id)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-center">
                <button 
                  onClick={() => setSearchTerm('Search')} // This will trigger the search dropdown
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/30 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Lokasi</span>
                </button>
              </div>
            </div>
          )}

          {/* Meeting Finder */}
          {activeTab === 'meeting' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tanggal Rapat
                    </label>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Waktu Mulai
                    </label>
                    <input
                      type="time"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Zona Waktu
                    </label>
                    <select
                      value={meetingTimezone}
                      onChange={(e) => setMeetingTimezone(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {availableTimezones.map(timezone => (
                        <option key={timezone.id} value={timezone.id}>
                          {timezone.city} ({timezone.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Durasi (menit)
                    </label>
                    <select
                      value={meetingDuration}
                      onChange={(e) => setMeetingDuration(parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value={30}>30 menit</option>
                      <option value={60}>1 jam</option>
                      <option value={90}>1.5 jam</option>
                      <option value={120}>2 jam</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Waktu Lokal di Setiap Zona
                  </h3>
                  
                  {convertMeetingTime().map((item, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {item.location.timezone.city}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {item.localTime}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'working'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {item.status === 'working' ? 'Jam Kerja' : 'Di Luar Jam Kerja'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-3">
                  Rekomendasi Waktu Rapat
                </h3>
                
                <div className="space-y-3">
                  {findBestMeetingTime().map((slot, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg ${
                        slot.status === 'optimal'
                          ? 'bg-green-100 dark:bg-green-900/20'
                          : slot.status === 'partial'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20'
                            : 'bg-red-100 dark:bg-red-900/20'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium">
                          {slot.time}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          slot.status === 'optimal'
                            ? 'bg-green-200 text-green-800 dark:bg-green-800/30 dark:text-green-300'
                            : slot.status === 'partial'
                              ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300'
                              : 'bg-red-200 text-red-800 dark:bg-red-800/30 dark:text-red-300'
                        }`}>
                          {slot.status === 'optimal' 
                            ? 'Semua dalam jam kerja' 
                            : slot.status === 'partial'
                              ? 'Sebagian dalam jam kerja'
                              : 'Di luar jam kerja'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Time Zone Converter */}
          {activeTab === 'converter' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dari Zona Waktu
                  </label>
                  <select
                    value={meetingTimezone}
                    onChange={(e) => setMeetingTimezone(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {availableTimezones.map(timezone => (
                      <option key={timezone.id} value={timezone.id}>
                        {timezone.city} ({timezone.name})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal & Waktu
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input
                      type="time"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ke Zona Waktu
                  </label>
                  <div className="space-y-2">
                    {locations.map(location => (
                      <div key={location.id} className="flex items-center">
                        <input
                          type="radio"
                          id={`to-${location.id}`}
                          name="to-timezone"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
                        />
                        <label htmlFor={`to-${location.id}`} className="ml-2 block text-sm text-gray-900 dark:text-white">
                          {location.timezone.city} ({location.timezone.name})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200">
                  Konversi Waktu
                </button>
              </div>
              
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-4">
                  Hasil Konversi
                </h3>
                
                <div className="space-y-4">
                  {convertMeetingTime().map((item, index) => (
                    <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        {item.location.timezone.city}
                      </div>
                      <div className="text-xl text-indigo-600 dark:text-indigo-400">
                        {item.localTime}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {item.location.timezone.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🌍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Global</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Mendukung semua zona waktu di seluruh dunia
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🤝</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tim Remote</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Ideal untuk tim yang bekerja di berbagai zona waktu
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Real-time</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Waktu diperbarui secara real-time
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🔄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">DST Otomatis</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Menyesuaikan dengan Daylight Saving Time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldTimeCalculator;