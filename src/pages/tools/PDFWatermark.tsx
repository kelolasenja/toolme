import React, { useState, useRef } from 'react';
import { ArrowLeft, Droplets, Upload, Download, Type, Eye, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';

const PDFWatermark: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string>('');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(45);
  const [color, setColor] = useState('#808080');
  const [position, setPosition] = useState('center');
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Hanya file PDF yang diperbolehkan!');
      return;
    }

    setPdfFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPdfPreview(previewUrl);
    
    // Get total pages
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setTotalPages(pdf.getPageCount());
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error membaca file PDF. Pastikan file tidak rusak.');
    }
  };

  const removePDF = () => {
    setPdfFile(null);
    setPdfPreview('');
    setTotalPages(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0.5, g: 0.5, b: 0.5 };
  };

  const getWatermarkPosition = (pageWidth: number, pageHeight: number, textWidth: number, textHeight: number) => {
    switch (position) {
      case 'top-left':
        return { x: 50, y: pageHeight - 50 };
      case 'top-center':
        return { x: (pageWidth - textWidth) / 2, y: pageHeight - 50 };
      case 'top-right':
        return { x: pageWidth - textWidth - 50, y: pageHeight - 50 };
      case 'center-left':
        return { x: 50, y: (pageHeight + textHeight) / 2 };
      case 'center':
        return { x: (pageWidth - textWidth) / 2, y: (pageHeight + textHeight) / 2 };
      case 'center-right':
        return { x: pageWidth - textWidth - 50, y: (pageHeight + textHeight) / 2 };
      case 'bottom-left':
        return { x: 50, y: 50 + textHeight };
      case 'bottom-center':
        return { x: (pageWidth - textWidth) / 2, y: 50 + textHeight };
      case 'bottom-right':
        return { x: pageWidth - textWidth - 50, y: 50 + textHeight };
      default:
        return { x: (pageWidth - textWidth) / 2, y: (pageHeight + textHeight) / 2 };
    }
  };

  const addWatermarkToPDF = async () => {
    if (!pdfFile || !watermarkText.trim()) {
      alert('Pilih file PDF dan masukkan teks watermark!');
      return;
    }

    setIsProcessing(true);
    
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      const { r, g, b } = hexToRgb(color);
      const pages = pdfDoc.getPages();
      
      pages.forEach((page) => {
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        // Calculate text dimensions
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = font.heightAtSize(fontSize);
        
        // Get position
        const { x, y } = getWatermarkPosition(pageWidth, pageHeight, textWidth, textHeight);
        
        // Add watermark text
        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity,
          rotate: {
            type: 'degrees',
            angle: rotation,
          },
        });
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, `watermarked-${pdfFile.name}`);
      
    } catch (error) {
      console.error('Error adding watermark to PDF:', error);
      alert('Terjadi kesalahan saat menambahkan watermark ke PDF.');
    } finally {
      setIsProcessing(false);
    }
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 dark:bg-cyan-900/20 rounded-full mb-4">
            <Droplets className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Tambah Watermark ke PDF
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Beri tanda air berupa teks pada setiap halaman PDF dengan preview langsung.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-cyan-900 dark:text-cyan-100 mb-3">
            Cara Menggunakan:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-cyan-800 dark:text-cyan-200">
            <li>Unggah file PDF yang ingin diberi watermark</li>
            <li>Preview dokumen akan muncul untuk membantu penempatan watermark</li>
            <li>Masukkan teks watermark yang diinginkan</li>
            <li>Atur ukuran, posisi, warna, dan transparansi</li>
            <li>Klik tombol "Tambah Watermark & Unduh"</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload & Text Input */}
          <div className="space-y-6">
            {/* PDF Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                1. Unggah File PDF
              </h3>
              <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-cyan-400 dark:hover:border-cyan-500 transition-colors duration-200"
                onClick={() => fileInputRef.current?.click()}
              >
                {pdfFile ? (
                  <div className="relative">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                        <span className="text-red-600 dark:text-red-400 font-bold text-sm">PDF</span>
                      </div>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium mb-2">{pdfFile.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {totalPages} halaman
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePDF();
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      Klik untuk memilih file PDF
                    </p>
                  </>
                )}
                <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                  {pdfFile ? 'Ganti PDF' : 'Pilih PDF'}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Watermark Text */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                2. Teks Watermark
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teks Watermark
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Masukkan teks watermark..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ukuran Font
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-500">{fontSize}px</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Transparansi
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-500">{Math.round(opacity * 100)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rotasi
                    </label>
                    <input
                      type="range"
                      min="-90"
                      max="90"
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-500">{rotation}°</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Warna
                    </label>
                    <input
                      type="color"
                      value={color}
                      
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Preset Watermarks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preset Watermark
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'CONFIDENTIAL',
                      'DRAFT',
                      'COPY',
                      'SAMPLE',
                      'INTERNAL USE',
                      'NOT FOR DISTRIBUTION'
                    ].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setWatermarkText(preset)}
                        className="p-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors duration-200"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PDF Preview Section */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <div className="flex items-center space-x-2 mb-4">
                <Eye className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Preview Dokumen
                </h3>
              </div>
              
              {pdfPreview ? (
                <div className="relative">
                  <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border">
                    <iframe
                      src={`${pdfPreview}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full h-full"
                      title="PDF Preview"
                    />
                    
                    {/* Watermark overlay preview */}
                    <div 
                      className="absolute text-center select-none pointer-events-none"
                      style={{
                        fontSize: `${Math.max(fontSize / 6, 8)}px`,
                        color: color,
                        opacity: opacity,
                        transform: `rotate(${rotation}deg)`,
                        ...(position === 'top-left' && { top: '10px', left: '10px' }),
                        ...(position === 'top-center' && { top: '10px', left: '50%', transform: `translateX(-50%) rotate(${rotation}deg)` }),
                        ...(position === 'top-right' && { top: '10px', right: '10px' }),
                        ...(position === 'center-left' && { top: '50%', left: '10px', transform: `translateY(-50%) rotate(${rotation}deg)` }),
                        ...(position === 'center' && { top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${rotation}deg)` }),
                        ...(position === 'center-right' && { top: '50%', right: '10px', transform: `translateY(-50%) rotate(${rotation}deg)` }),
                        ...(position === 'bottom-left' && { bottom: '10px', left: '10px' }),
                        ...(position === 'bottom-center' && { bottom: '10px', left: '50%', transform: `translateX(-50%) rotate(${rotation}deg)` }),
                        ...(position === 'bottom-right' && { bottom: '10px', right: '10px' }),
                      }}
                    >
                      {watermarkText || 'WATERMARK'}
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {totalPages} halaman
                  </p>
                </div>
              ) : (
                <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Preview PDF akan muncul di sini
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Settings & Controls */}
          <div className="space-y-6">
            {/* Position Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                3. Posisi Watermark
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'top-left', label: '↖️' },
                  { value: 'top-center', label: '⬆️' },
                  { value: 'top-right', label: '↗️' },
                  { value: 'center-left', label: '⬅️' },
                  { value: 'center', label: '⭕' },
                  { value: 'center-right', label: '➡️' },
                  { value: 'bottom-left', label: '↙️' },
                  { value: 'bottom-center', label: '⬇️' },
                  { value: 'bottom-right', label: '↘️' }
                ].map((pos) => (
                  <button
                    key={pos.value}
                    onClick={() => setPosition(pos.value)}
                    className={`p-3 text-2xl border rounded-lg transition-colors duration-200 ${
                      position === pos.value
                        ? 'bg-cyan-100 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-700'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Watermark Button */}
            <button
              onClick={addWatermarkToPDF}
              disabled={!pdfFile || !watermarkText.trim() || isProcessing}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Menambahkan Watermark...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Tambah Watermark & Unduh</span>
                </>
              )}
            </button>

            {/* Features */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Fitur Watermark:
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-center space-x-2">
                  <Type className="w-4 h-4 text-cyan-500" />
                  <span>Kustomisasi lengkap teks, ukuran, dan warna</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-cyan-500" />
                  <span>Preview real-time sebelum menerapkan</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-4 h-4 text-cyan-500 text-center">⚡</span>
                  <span>Diterapkan ke semua halaman PDF</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-4 h-4 text-cyan-500 text-center">🔒</span>
                  <span>Proses lokal, file tidak diunggah ke server</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFWatermark;