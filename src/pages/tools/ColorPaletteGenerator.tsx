import React, { useState, useRef } from 'react';
import { ArrowLeft, Palette, Upload, Copy, Download, RefreshCw, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import ColorThief from 'colorthief';

interface ColorPalette {
  hex: string;
  rgb: string;
  hsl: string;
}

const ColorPaletteGenerator: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [palette, setPalette] = useState<ColorPalette[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dominantColor, setDominantColor] = useState<ColorPalette | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const rgbToHsl = (r: number, g: number, b: number): string => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const createColorObject = (rgb: number[]): ColorPalette => {
    const [r, g, b] = rgb;
    return {
      hex: rgbToHex(r, g, b),
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: rgbToHsl(r, g, b)
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan!');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Reset palette
    setPalette([]);
    setDominantColor(null);
  };

  const extractColors = async () => {
    if (!selectedFile || !previewUrl) {
      alert('Pilih gambar terlebih dahulu!');
      return;
    }

    setIsProcessing(true);

    try {
      const img = imageRef.current;
      if (!img) return;

      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = previewUrl;
      });

      const colorThief = new ColorThief();
      
      // Get dominant color
      const dominantRgb = colorThief.getColor(img);
      setDominantColor(createColorObject(dominantRgb));

      // Get color palette (6 colors)
      const paletteRgb = colorThief.getPalette(img, 6);
      const colorPalette = paletteRgb.map(createColorObject);
      setPalette(colorPalette);

    } catch (error) {
      console.error('Error extracting colors:', error);
      alert('Terjadi kesalahan saat mengekstrak warna. Coba dengan gambar lain.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      alert(`${type} berhasil disalin: ${text}`);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Gagal menyalin ke clipboard');
    }
  };

  const generateRandomPalette = () => {
    const randomColors: ColorPalette[] = [];
    for (let i = 0; i < 6; i++) {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      randomColors.push(createColorObject([r, g, b]));
    }
    setPalette(randomColors);
    setDominantColor(randomColors[0]);
  };

  const generateHarmoniousPalette = () => {
    // Generate a harmonious palette based on color theory
    const baseHue = Math.floor(Math.random() * 360);
    const harmonious: ColorPalette[] = [];
    
    // Analogous colors (adjacent hues)
    for (let i = 0; i < 6; i++) {
      const hue = (baseHue + (i * 30)) % 360;
      const saturation = 70 + Math.random() * 30; // 70-100%
      const lightness = 40 + Math.random() * 40; // 40-80%
      
      // Convert HSL to RGB
      const h = hue / 360;
      const s = saturation / 100;
      const l = lightness / 100;
      
      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      
      harmonious.push(createColorObject([
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
      ]));
    }
    
    setPalette(harmonious);
    setDominantColor(harmonious[0]);
  };

  const exportPalette = () => {
    if (palette.length === 0) {
      alert('Tidak ada palet warna untuk diekspor!');
      return;
    }

    const paletteData = {
      dominantColor,
      palette,
      exportDate: new Date().toISOString(),
      totalColors: palette.length
    };

    const dataStr = JSON.stringify(paletteData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'color-palette.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 dark:bg-violet-900/20 rounded-full mb-4">
            <Palette className="w-8 h-8 text-violet-600 dark:text-violet-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Generator Palet Warna
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Ekstrak palet warna dari gambar atau generate palet warna harmonis untuk desain Anda.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-100 mb-3">
            Cara Menggunakan:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-violet-800 dark:text-violet-200">
            <li>Unggah gambar untuk mengekstrak warna dominan</li>
            <li>Atau gunakan generator untuk membuat palet warna acak/harmonis</li>
            <li>Klik warna untuk menyalin kode HEX, RGB, atau HSL</li>
            <li>Ekspor palet warna sebagai file JSON</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload & Controls */}
          <div className="space-y-6">
            {/* File Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                1. Unggah Gambar
              </h3>
              <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-violet-400 dark:hover:border-violet-500 transition-colors duration-200"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Pilih Gambar
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Mendukung JPG, PNG, GIF, BMP, WebP
                </p>
                <button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                  Pilih File
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {selectedFile && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Siap untuk ekstraksi warna
                  </p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                2. Generate Palet
              </h3>
              <div className="space-y-3">
                <button
                  onClick={extractColors}
                  disabled={!selectedFile || isProcessing}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Mengekstrak...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5" />
                      <span>Ekstrak dari Gambar</span>
                    </>
                  )}
                </button>

                <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                  atau
                </div>

                <button
                  onClick={generateRandomPalette}
                  className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Palet Acak</span>
                </button>

                <button
                  onClick={generateHarmoniousPalette}
                  className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Palette className="w-5 h-5" />
                  <span>Palet Harmonis</span>
                </button>
              </div>
            </div>

            {/* Export */}
            {palette.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  3. Ekspor Palet
                </h3>
                <button
                  onClick={exportPalette}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Unduh JSON</span>
                </button>
              </div>
            )}
          </div>

          {/* Preview & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Preview */}
            {previewUrl && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Preview Gambar
                </h3>
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <img 
                    ref={imageRef}
                    src={previewUrl} 
                    alt="Preview"
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
              </div>
            )}

            {/* Dominant Color */}
            {dominantColor && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Warna Dominan
                </h3>
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-20 h-20 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer hover:scale-105 transition-transform duration-200"
                    style={{ backgroundColor: dominantColor.hex }}
                    onClick={() => copyToClipboard(dominantColor.hex, 'HEX')}
                  ></div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">HEX:</span>
                      <button
                        onClick={() => copyToClipboard(dominantColor.hex, 'HEX')}
                        className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400"
                      >
                        <span className="font-mono">{dominantColor.hex}</span>
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">RGB:</span>
                      <button
                        onClick={() => copyToClipboard(dominantColor.rgb, 'RGB')}
                        className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400"
                      >
                        <span className="font-mono">{dominantColor.rgb}</span>
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">HSL:</span>
                      <button
                        onClick={() => copyToClipboard(dominantColor.hsl, 'HSL')}
                        className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400"
                      >
                        <span className="font-mono">{dominantColor.hsl}</span>
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Color Palette */}
            {palette.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Palet Warna ({palette.length} warna)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {palette.map((color, index) => (
                    <div key={index} className="group">
                      <div 
                        className="aspect-square rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer hover:scale-105 transition-transform duration-200 mb-2"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => copyToClipboard(color.hex, 'HEX')}
                      ></div>
                      <div className="space-y-1">
                        <button
                          onClick={() => copyToClipboard(color.hex, 'HEX')}
                          className="w-full text-left text-xs font-mono text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 flex items-center justify-between group"
                        >
                          <span>{color.hex}</span>
                          <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(color.rgb, 'RGB')}
                          className="w-full text-left text-xs font-mono text-gray-500 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 truncate"
                        >
                          {color.rgb}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🎨</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ekstraksi Akurat</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Menggunakan ColorThief untuk ekstraksi warna yang presisi
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🌈</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Multi Format</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Mendukung HEX, RGB, dan HSL untuk semua kebutuhan
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📋</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Copy & Export</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Salin kode warna atau ekspor palet sebagai JSON
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteGenerator;