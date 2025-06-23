import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, Play, Pause, RotateCcw, Settings, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PomodoroSettings {
  workDuration: number;    // dalam menit
  shortBreak: number;      // dalam menit
  longBreak: number;       // dalam menit
  longBreakInterval: number; // setelah berapa sesi work
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const PomodoroTimer: React.FC = () => {
  const [settings, setSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4
  });

  const [currentMode, setCurrentMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60); // dalam detik
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalWorkTime, setTotalWorkTime] = useState(0); // dalam detik
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inisialisasi audio notification
  useEffect(() => {
    // Membuat audio notification sederhana menggunakan Web Audio API
    const createNotificationSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
    };

    audioRef.current = { play: createNotificationSound } as any;
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Update timer saat mode berubah
  useEffect(() => {
    let duration: number;
    switch (currentMode) {
      case 'work':
        duration = settings.workDuration * 60;
        break;
      case 'shortBreak':
        duration = settings.shortBreak * 60;
        break;
      case 'longBreak':
        duration = settings.longBreak * 60;
        break;
    }
    setTimeLeft(duration);
    setIsRunning(false);
  }, [currentMode, settings]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Play notification sound
    if (soundEnabled && audioRef.current) {
      try {
        audioRef.current.play();
      } catch (error) {
        console.log('Could not play notification sound');
      }
    }

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const messages = {
        work: 'Waktu kerja selesai! Saatnya istirahat.',
        shortBreak: 'Istirahat selesai! Kembali bekerja.',
        longBreak: 'Istirahat panjang selesai! Siap untuk sesi baru?'
      };
      
      new Notification('Pomodoro Timer', {
        body: messages[currentMode],
        icon: '/favicon.ico'
      });
    }

    // Update statistics dan mode
    if (currentMode === 'work') {
      setCompletedSessions(prev => prev + 1);
      setTotalWorkTime(prev => prev + settings.workDuration * 60);
      
      // Tentukan break selanjutnya
      const nextSessionNumber = completedSessions + 1;
      if (nextSessionNumber % settings.longBreakInterval === 0) {
        setCurrentMode('longBreak');
      } else {
        setCurrentMode('shortBreak');
      }
    } else {
      setCurrentMode('work');
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    let duration: number;
    switch (currentMode) {
      case 'work':
        duration = settings.workDuration * 60;
        break;
      case 'shortBreak':
        duration = settings.shortBreak * 60;
        break;
      case 'longBreak':
        duration = settings.longBreak * 60;
        break;
    }
    setTimeLeft(duration);
  };

  const resetSession = () => {
    setIsRunning(false);
    setCurrentMode('work');
    setTimeLeft(settings.workDuration * 60);
    setCompletedSessions(0);
    setTotalWorkTime(0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}j ${mins}m`;
    }
    return `${mins}m`;
  };

  const getProgress = (): number => {
    let totalDuration: number;
    switch (currentMode) {
      case 'work':
        totalDuration = settings.workDuration * 60;
        break;
      case 'shortBreak':
        totalDuration = settings.shortBreak * 60;
        break;
      case 'longBreak':
        totalDuration = settings.longBreak * 60;
        break;
    }
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  };

  const getModeInfo = () => {
    switch (currentMode) {
      case 'work':
        return { title: 'Waktu Kerja', color: 'red', bgColor: 'bg-red-100 dark:bg-red-900/20', textColor: 'text-red-600 dark:text-red-400' };
      case 'shortBreak':
        return { title: 'Istirahat Pendek', color: 'green', bgColor: 'bg-green-100 dark:bg-green-900/20', textColor: 'text-green-600 dark:text-green-400' };
      case 'longBreak':
        return { title: 'Istirahat Panjang', color: 'blue', bgColor: 'bg-blue-100 dark:bg-blue-900/20', textColor: 'text-blue-600 dark:text-blue-400' };
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const modeInfo = getModeInfo();

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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
            <Clock className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pomodoro Timer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Tingkatkan fokus dan produktivitas dengan teknik Pomodoro. Bekerja 25 menit, istirahat 5 menit.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-3">
            Teknik Pomodoro:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-red-800 dark:text-red-200">
            <li>Bekerja fokus selama 25 menit</li>
            <li>Istirahat pendek 5 menit</li>
            <li>Ulangi 4 kali, lalu istirahat panjang 15 menit</li>
            <li>Mulai siklus baru</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer Display */}
          <div className="lg:col-span-2">
            <div className={`${modeInfo.bgColor} rounded-xl border border-gray-200 dark:border-gray-700 p-8`}>
              {/* Mode Indicator */}
              <div className="text-center mb-6">
                <h2 className={`text-2xl font-bold ${modeInfo.textColor} mb-2`}>
                  {modeInfo.title}
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Sesi #{completedSessions + 1}
                </div>
              </div>

              {/* Timer Circle */}
              <div className="relative w-80 h-80 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-gray-300 dark:text-gray-600"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                    className={modeInfo.textColor}
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                  />
                </svg>
                
                {/* Timer Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-lg text-gray-600 dark:text-gray-400">
                      {Math.round(getProgress())}% selesai
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleTimer}
                  className={`flex items-center space-x-2 px-8 py-4 ${
                    isRunning 
                      ? 'bg-yellow-600 hover:bg-yellow-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white rounded-lg font-medium transition-colors duration-200`}
                >
                  {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <span>{isRunning ? 'Pause' : 'Start'}</span>
                </button>
                
                <button
                  onClick={resetTimer}
                  className="flex items-center space-x-2 px-6 py-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Statistics & Settings */}
          <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Statistik Hari Ini
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Sesi Selesai</span>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {completedSessions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Waktu Kerja</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatTotalTime(totalWorkTime)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Sesi Hingga Break Panjang</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {settings.longBreakInterval - (completedSessions % settings.longBreakInterval)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Mode Cepat
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setCurrentMode('work')}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                    currentMode === 'work'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  }`}
                >
                  Waktu Kerja ({settings.workDuration}m)
                </button>
                <button
                  onClick={() => setCurrentMode('shortBreak')}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                    currentMode === 'shortBreak'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  }`}
                >
                  Istirahat Pendek ({settings.shortBreak}m)
                </button>
                <button
                  onClick={() => setCurrentMode('longBreak')}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                    currentMode === 'longBreak'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  }`}
                >
                  Istirahat Panjang ({settings.longBreak}m)
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pengaturan
                </h3>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              {showSettings && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Waktu Kerja (menit)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.workDuration}
                      onChange={(e) => setSettings(prev => ({ ...prev, workDuration: parseInt(e.target.value) || 25 }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Istirahat Pendek (menit)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.shortBreak}
                      onChange={(e) => setSettings(prev => ({ ...prev, shortBreak: parseInt(e.target.value) || 5 }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Istirahat Panjang (menit)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.longBreak}
                      onChange={(e) => setSettings(prev => ({ ...prev, longBreak: parseInt(e.target.value) || 15 }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Interval Break Panjang
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={settings.longBreakInterval}
                      onChange={(e) => setSettings(prev => ({ ...prev, longBreakInterval: parseInt(e.target.value) || 4 }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Notifikasi Suara</span>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      soundEnabled 
                        ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20' 
                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                onClick={resetSession}
                className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                Reset Sesi Lengkap
              </button>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fokus Tinggi</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Bekerja dalam interval pendek meningkatkan konsentrasi
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Produktivitas</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Teknik terbukti meningkatkan efisiensi kerja
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🧘</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Keseimbangan</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Istirahat teratur mencegah kelelahan mental
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;