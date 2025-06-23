import React from 'react';
import { ArrowLeft, Palette, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';

const ColorPicker: React.FC = () => {
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 dark:bg-pink-900/20 rounded-full mb-4">
            <Palette className="w-8 h-8 text-pink-600 dark:text-pink-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Color Picker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Tool untuk memilih warna, konversi format warna, dan membuat palet warna.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Color Picker Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pilih Warna
              </h3>
              
              <div className="space-y-4">
                <div className="aspect-square bg-gradient-to-br from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                  <div className="absolute top-1/2 left-1/2 w-4 h-4 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg"></div>
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Hue
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max="360" 
                      defaultValue="180"
                      className="w-full h-3 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Warna Terpilih
              </h3>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-blue-500 rounded-lg shadow-lg"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Warna saat ini</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">#3B82F6</p>
                </div>
              </div>
            </div>
          </div>

          {/* Color Formats Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Format Warna
              </h3>
              
              <div className="space-y-4">
                {[
                  { label: 'HEX', value: '#3B82F6' },
                  { label: 'RGB', value: 'rgb(59, 130, 246)' },
                  { label: 'HSL', value: 'hsl(217, 91%, 60%)' },
                  { label: 'HSV', value: 'hsv(217, 76%, 96%)' },
                  { label: 'CMYK', value: 'cmyk(76%, 47%, 0%, 4%)' }
                ].map((format) => (
                  <div key={format.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {format.label}
                      </span>
                      <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                        {format.value}
                      </p>
                    </div>
                    <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Palet Warna
              </h3>
              
              <div className="grid grid-cols-5 gap-2 mb-4">
                {Array.from({ length: 10 }, (_, i) => (
                  <div 
                    key={i}
                    className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200"
                    style={{
                      backgroundColor: `hsl(${i * 36}, 70%, 60%)`
                    }}
                  ></div>
                ))}
              </div>
              
              <div className="space-y-2">
                <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200">
                  Generate Palet Harmonis
                </button>
                <button className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200">
                  Simpan Palet
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Color Harmonies */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Harmoni Warna
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Complementary', colors: ['#3B82F6', '#F59E0B'] },
              { name: 'Triadic', colors: ['#3B82F6', '#EF4444', '#10B981'] },
              { name: 'Analogous', colors: ['#3B82F6', '#6366F1', '#8B5CF6'] },
              { name: 'Monochromatic', colors: ['#1E40AF', '#3B82F6', '#93C5FD'] }
            ].map((harmony) => (
              <div key={harmony.name} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 text-center">
                  {harmony.name}
                </h4>
                <div className="flex space-x-2 mb-3">
                  {harmony.colors.map((color, index) => (
                    <div 
                      key={index}
                      className="flex-1 aspect-square rounded-lg"
                      style={{ backgroundColor: color }}
                    ></div>
                  ))}
                </div>
                <button className="w-full text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 px-3 rounded-lg transition-colors duration-200">
                  Gunakan Palet
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;