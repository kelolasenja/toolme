import React from 'react';
import { ArrowLeft, Upload, Compass as Compress } from 'lucide-react';
import { Link } from 'react-router-dom';

const ImageCompressor: React.FC = () => {
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
            <Compress className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Kompresor Gambar
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Kurangi ukuran file gambar tanpa mengorbankan kualitas visual yang signifikan.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">
            Cara Menggunakan:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-purple-800 dark:text-purple-200">
            <li>Unggah gambar yang ingin dikompres</li>
            <li>Atur tingkat kompresi sesuai kebutuhan</li>
            <li>Preview hasil kompresi</li>
            <li>Unduh gambar yang sudah dikompres</li>
          </ol>
        </div>

        {/* Main Work Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Unggah Gambar
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Mendukung JPG, PNG, WebP hingga 10MB
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
              Pilih Gambar
            </button>
          </div>

          {/* Compression Settings */}
          <div className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tingkat Kompresi
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">Kualitas Tinggi</span>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  defaultValue="80"
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">File Kecil</span>
              </div>
              <div className="text-center mt-2">
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Kualitas: 80%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Format Output
                </label>
                <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Sama dengan asli</option>
                  <option>JPG</option>
                  <option>PNG</option>
                  <option>WebP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resize (Opsional)
                </label>
                <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Ukuran asli</option>
                  <option>50% dari asli</option>
                  <option>25% dari asli</option>
                  <option>Custom</option>
                </select>
              </div>
            </div>
          </div>

          {/* Compress Button */}
          <div className="mt-8 text-center">
            <button 
              disabled 
              className="bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-8 py-3 rounded-lg font-medium cursor-not-allowed"
            >
              Kompres Gambar
            </button>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Keuntungan Kompresi
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Hemat ruang penyimpanan</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Website loading lebih cepat</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Mudah dibagikan</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Tips Kompresi
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Gunakan 80-90% untuk foto</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>WebP lebih efisien</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Preview sebelum download</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCompressor;