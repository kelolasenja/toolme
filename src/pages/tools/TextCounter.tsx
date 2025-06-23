import React, { useState, useEffect } from 'react';
import { ArrowLeft, Type, Copy, RotateCcw, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const TextCounter: React.FC = () => {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    lines: 0,
    averageWordsPerSentence: 0,
    averageCharactersPerWord: 0,
    readingTime: {
      slow: { minutes: 0, seconds: 0 },
      normal: { minutes: 0, seconds: 0 },
      fast: { minutes: 0, seconds: 0 }
    }
  });

  // Fungsi untuk menghitung statistik teks
  const calculateStats = (inputText: string) => {
    if (!inputText.trim()) {
      setStats({
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        lines: 0,
        averageWordsPerSentence: 0,
        averageCharactersPerWord: 0,
        readingTime: {
          slow: { minutes: 0, seconds: 0 },
          normal: { minutes: 0, seconds: 0 },
          fast: { minutes: 0, seconds: 0 }
        }
      });
      return;
    }

    // Hitung karakter
    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;

    // Hitung kata
    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;

    // Hitung kalimat (berdasarkan tanda titik, tanda tanya, tanda seru)
    const sentences = inputText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;

    // Hitung paragraf (berdasarkan baris kosong atau line break ganda)
    const paragraphs = inputText.split(/\n\s*\n/).filter(para => para.trim().length > 0).length;

    // Hitung baris
    const lines = inputText.split('\n').length;

    // Hitung rata-rata
    const averageWordsPerSentence = sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0;
    const averageCharactersPerWord = words > 0 ? Math.round((charactersNoSpaces / words) * 10) / 10 : 0;

    // Hitung estimasi waktu baca (WPM = Words Per Minute)
    const calculateReadingTime = (wpm: number) => {
      const totalMinutes = words / wpm;
      const minutes = Math.floor(totalMinutes);
      const seconds = Math.round((totalMinutes - minutes) * 60);
      return { minutes, seconds };
    };

    setStats({
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
      averageWordsPerSentence,
      averageCharactersPerWord,
      readingTime: {
        slow: calculateReadingTime(150),    // 150 WPM - pembaca lambat
        normal: calculateReadingTime(200),  // 200 WPM - pembaca normal
        fast: calculateReadingTime(250)     // 250 WPM - pembaca cepat
      }
    });
  };

  // Update statistik setiap kali teks berubah
  useEffect(() => {
    calculateStats(text);
  }, [text]);

  const clearText = () => {
    setText('');
  };

  const copyStats = async () => {
    const statsText = `
Statistik Teks:
- Karakter: ${stats.characters.toLocaleString('id-ID')}
- Karakter (tanpa spasi): ${stats.charactersNoSpaces.toLocaleString('id-ID')}
- Kata: ${stats.words.toLocaleString('id-ID')}
- Kalimat: ${stats.sentences.toLocaleString('id-ID')}
- Paragraf: ${stats.paragraphs.toLocaleString('id-ID')}
- Baris: ${stats.lines.toLocaleString('id-ID')}
- Rata-rata kata per kalimat: ${stats.averageWordsPerSentence}
- Rata-rata karakter per kata: ${stats.averageCharactersPerWord}

Estimasi Waktu Baca:
- Lambat (150 WPM): ${stats.readingTime.slow.minutes}m ${stats.readingTime.slow.seconds}s
- Normal (200 WPM): ${stats.readingTime.normal.minutes}m ${stats.readingTime.normal.seconds}s
- Cepat (250 WPM): ${stats.readingTime.fast.minutes}m ${stats.readingTime.fast.seconds}s
    `.trim();

    try {
      await navigator.clipboard.writeText(statsText);
      alert('Statistik berhasil disalin ke clipboard!');
    } catch (error) {
      console.error('Gagal menyalin:', error);
      alert('Gagal menyalin statistik');
    }
  };

  const formatTime = (minutes: number, seconds: number) => {
    if (minutes === 0 && seconds === 0) return '0s';
    if (minutes === 0) return `${seconds}s`;
    if (seconds === 0) return `${minutes}m`;
    return `${minutes}m ${seconds}s`;
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-4">
            <Type className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Penghitung Teks
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Hitung jumlah kata, karakter, paragraf, dan analisis teks lainnya secara real-time.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">
            Fitur Analisis Teks:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-orange-800 dark:text-orange-200">
            <li>Penghitungan karakter dengan dan tanpa spasi</li>
            <li>Penghitungan kata, kalimat, paragraf, dan baris</li>
            <li>Estimasi waktu baca berdasarkan kecepatan membaca</li>
            <li>Analisis rata-rata kata per kalimat dan karakter per kata</li>
            <li>Update real-time saat mengetik</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Text Input */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Masukkan Teks
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={clearText}
                    className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ketik atau paste teks Anda di sini untuk analisis real-time..."
                rows={20}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Statistik akan diperbarui secara otomatis saat Anda mengetik
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="space-y-6">
            {/* Basic Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Statistik Dasar
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Karakter</span>
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.characters.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Tanpa spasi</span>
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.charactersNoSpaces.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Kata</span>
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.words.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Kalimat</span>
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.sentences.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Paragraf</span>
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.paragraphs.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Baris</span>
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.lines.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Advanced Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Analisis Lanjutan
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Rata-rata kata/kalimat</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.averageWordsPerSentence}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Rata-rata karakter/kata</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.averageCharactersPerWord}
                  </span>
                </div>
              </div>
            </div>

            {/* Reading Time */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Estimasi Waktu Baca
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Lambat (150 WPM)</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatTime(stats.readingTime.slow.minutes, stats.readingTime.slow.seconds)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Normal (200 WPM)</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatTime(stats.readingTime.normal.minutes, stats.readingTime.normal.seconds)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Cepat (250 WPM)</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatTime(stats.readingTime.fast.minutes, stats.readingTime.fast.seconds)}
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  WPM = Words Per Minute (Kata per Menit)
                </p>
              </div>
            </div>

            {/* Tools */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tools Tambahan
              </h3>
              <div className="space-y-3">
                <button
                  onClick={copyStats}
                  disabled={!text.trim()}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Salin Statistik</span>
                </button>
                <button
                  onClick={clearText}
                  disabled={!text.trim()}
                  className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 dark:text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Hapus Teks</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Real-time</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Hitung otomatis saat mengetik tanpa perlu refresh
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Akurat</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Algoritma penghitungan yang tepat dan konsisten
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Lengkap</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Berbagai metrik teks dan analisis mendalam
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📋</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Export</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Salin statistik lengkap ke clipboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextCounter;