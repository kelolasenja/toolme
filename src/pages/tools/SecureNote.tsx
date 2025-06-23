import React from 'react';
import { ArrowLeft, Lock, Copy, Clock, RefreshCw, Key } from 'lucide-react';
import { Link } from 'react-router-dom';

const SecureNote: React.FC = () => {
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
            <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Catatan Rahasia Terenkripsi
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Kirim pesan rahasia yang aman dan bisa hancur sendiri setelah dibaca.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">
            Cara Kerja:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-purple-800 dark:text-purple-200">
            <li>Tulis pesan rahasia Anda di bawah ini</li>
            <li>Atur opsi keamanan (password, waktu kadaluarsa)</li>
            <li>Klik "Buat Catatan Rahasia" untuk mengenkripsi pesan</li>
            <li>Salin dan bagikan link yang dihasilkan kepada penerima</li>
            <li>Pesan akan terhapus secara permanen setelah dibaca atau kadaluarsa</li>
          </ol>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-6">
            <button className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400">
              Buat Catatan Rahasia
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              Baca Catatan Rahasia
            </button>
          </div>

          {/* Create Secret Note */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pesan Rahasia
              </label>
              <textarea
                placeholder="Ketik pesan rahasia Anda di sini..."
                rows={6}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password (Opsional)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Buat password untuk pesan ini"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    <Key className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Biarkan kosong untuk pesan tanpa password
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Waktu Kadaluarsa
                </label>
                <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Setelah dibaca</option>
                  <option>1 jam</option>
                  <option>12 jam</option>
                  <option>1 hari</option>
                  <option>3 hari</option>
                  <option>7 hari</option>
                  <option>30 hari</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Kirim notifikasi email saat pesan dibaca
                </span>
              </label>
            </div>
            
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>Buat Catatan Rahasia</span>
            </button>
          </div>
        </div>

        {/* Result (Hidden by default) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8 hidden">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Catatan Rahasia Berhasil Dibuat!
          </h3>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800 mb-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-purple-700 dark:text-purple-300">
                Link Rahasia:
              </div>
              <button className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="text-purple-800 dark:text-purple-200 font-mono text-sm mt-1 break-all">
              https://example.com/s/a1b2c3d4e5f6g7h8i9j0
            </div>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Kadaluarsa setelah dibaca atau dalam 24 jam</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Dilindungi dengan enkripsi end-to-end</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Buat Catatan Baru</span>
              </button>
              
              <button className="px-4 py-2 bg-purple-100 dark:bg-purple-900/20 hover:bg-purple-200 dark:hover:bg-purple-800/30 text-purple-700 dark:text-purple-300 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                <Copy className="w-4 h-4" />
                <span>Salin Link</span>
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🔒</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Enkripsi End-to-End</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Pesan dienkripsi di browser Anda, kami tidak bisa membacanya
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">⏱️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Self-Destruct</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Pesan terhapus otomatis setelah dibaca atau kadaluarsa
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🔑</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Password Optional</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Tambahkan lapisan keamanan ekstra dengan password
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📱</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Notifikasi</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Dapatkan notifikasi saat pesan Anda dibaca
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureNote;