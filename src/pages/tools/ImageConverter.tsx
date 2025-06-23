import React, { useState, useRef } from 'react';
import { ArrowLeft, RefreshCw, Upload, Download, Settings, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { saveAs } from 'file-saver';

const ImageConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan!');
      return;
    }

    setSelectedFile(file);
    setOriginalSize(file.size);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Reset processed image
    setProcessedImageUrl('');
    setCompressedSize(0);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processImage = async () => {
    if (!selectedFile) {
      alert('Pilih gambar terlebih dahulu!');
      return;
    }

    setIsProcessing(true);

    try {
      const options = {
        maxSizeMB: 10,
        maxWidthOrHeight: Math.max(maxWidth || 1920, maxHeight || 1080),
        useWebWorker: true,
        fileType: `image/${outputFormat}` as const,
        initialQuality: quality / 100,
      };

      // Add width/height constraints if specified
      if (maxWidth) options.maxWidthOrHeight = Math.min(options.maxWidthOrHeight, maxWidth);
      if (maxHeight) options.maxWidthOrHeight = Math.min(options.maxWidthOrHeight, maxHeight);

      const compressedFile = await imageCompression(selectedFile, options);
      setCompressedSize(compressedFile.size);

      // Create download URL
      const url = URL.createObjectURL(compressedFile);
      setProcessedImageUrl(url);

    } catch (error) {
      console.error('Error processing image:', error);
      alert('Terjadi kesalahan saat memproses gambar.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!processedImageUrl || !selectedFile) return;

    const extension = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    const fileName = `converted-${selectedFile.name.split('.')[0]}.${extension}`;
    
    // Create a temporary link to download
    const link = document.createElement('a');
    link.href = processedImageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setProcessedImageUrl('');
    setOriginalSize(0);
    setCompressedSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const compressionRatio = originalSize > 0 && compressedSize > 0 
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
    : 0;

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
            <RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Konverter & Kompresor Gambar
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Ubah format gambar (JPG, PNG, WEBP) dan kompres ukuran file dengan mudah.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Cara Menggunakan:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
            <li>Unggah gambar yang ingin dikonversi atau dikompres</li>
            <li>Pilih format output dan atur kualitas sesuai kebutuhan</li>
            <li>Atur ukuran maksimal jika diperlukan</li>
            <li>Klik "Proses Gambar" dan unduh hasilnya</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload & Settings */}
          <div className="space-y-6">
            {/* File Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                1. Unggah Gambar
              </h3>
              <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Pilih Gambar
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Mendukung JPG, PNG, GIF, BMP, WebP
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
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
                    Ukuran: {formatFileSize(originalSize)}
                  </p>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  2. Pengaturan
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Format Output
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="jpeg">JPEG (.jpg)</option>
                    <option value="png">PNG (.png)</option>
                    <option value="webp">WebP (.webp)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kualitas: {quality}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Kecil</span>
                    <span>Besar</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Lebar Maks (px)
                    </label>
                    <input
                      type="number"
                      placeholder="Auto"
                      value={maxWidth || ''}
                      onChange={(e) => setMaxWidth(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tinggi Maks (px)
                    </label>
                    <input
                      type="number"
                      placeholder="Auto"
                      value={maxHeight || ''}
                      onChange={(e) => setMaxHeight(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Process Button */}
            <button
              onClick={processImage}
              disabled={!selectedFile || isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Proses Gambar</span>
                </>
              )}
            </button>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Original Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Preview Gambar
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Gambar Asli
                  </h4>
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Original"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Preview akan muncul di sini
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {originalSize > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                      Ukuran: {formatFileSize(originalSize)}
                    </p>
                  )}
                </div>

                {/* Processed */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Hasil Proses
                  </h4>
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border">
                    {processedImageUrl ? (
                      <img 
                        src={processedImageUrl} 
                        alt="Processed"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Hasil akan muncul di sini
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {compressedSize > 0 && (
                    <div className="mt-2 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ukuran: {formatFileSize(compressedSize)}
                      </p>
                      {compressionRatio > 0 && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Hemat {compressionRatio}%
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Download & Reset */}
            {processedImageUrl && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Unduh Hasil
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={downloadImage}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Unduh Gambar</span>
                  </button>
                  <button
                    onClick={resetAll}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    Proses Gambar Baru
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🔄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Multi Format</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Konversi ke JPEG, PNG, atau WebP sesuai kebutuhan
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📏</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Resize Otomatis</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Atur ukuran maksimal untuk mengoptimalkan file
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cepat & Aman</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Proses di browser, tidak ada upload ke server
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageConverter;