import React, { useState } from 'react';
import { ArrowLeft, Edit3, Download, Bold, Italic, Type } from 'lucide-react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

const TextToPDF: React.FC = () => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(12);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [title, setTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const generatePDF = async () => {
    if (!text.trim()) {
      alert('Masukkan teks yang ingin dikonversi ke PDF!');
      return;
    }

    setIsProcessing(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      
      let yPosition = margin;
      
      // Add title if provided
      if (title.trim()) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        const titleLines = doc.splitTextToSize(title.trim(), maxWidth);
        doc.text(titleLines, margin, yPosition);
        yPosition += titleLines.length * 8 + 10;
      }
      
      // Set font style for content
      doc.setFontSize(fontSize);
      let fontStyle = 'normal';
      if (isBold && isItalic) {
        fontStyle = 'bolditalic';
      } else if (isBold) {
        fontStyle = 'bold';
      } else if (isItalic) {
        fontStyle = 'italic';
      }
      doc.setFont('helvetica', fontStyle);
      
      // Split text into lines that fit the page width
      const lines = doc.splitTextToSize(text, maxWidth);
      const lineHeight = fontSize * 0.4;
      
      for (let i = 0; i < lines.length; i++) {
        // Check if we need a new page
        if (yPosition + lineHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.text(lines[i], margin, yPosition);
        yPosition += lineHeight;
      }
      
      // Save the PDF
      const pdfBlob = doc.output('blob');
      const fileName = title.trim() ? `${title.trim()}.pdf` : 'document.pdf';
      saveAs(pdfBlob, fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Terjadi kesalahan saat membuat PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;

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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full mb-4">
            <Edit3 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Editor Teks ke PDF
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Tulis dokumen di editor kami dan unduh sebagai PDF.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-3">
            Cara Menggunakan:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-emerald-800 dark:text-emerald-200">
            <li>Masukkan judul dokumen (opsional)</li>
            <li>Tulis atau paste teks Anda di area editor</li>
            <li>Atur format teks sesuai keinginan</li>
            <li>Klik tombol "Unduh sebagai PDF"</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Input */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Judul Dokumen (Opsional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan judul dokumen..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Formatting Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Format Teks
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Type className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ukuran Font:
                  </label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={10}>10pt</option>
                    <option value={12}>12pt</option>
                    <option value={14}>14pt</option>
                    <option value={16}>16pt</option>
                    <option value={18}>18pt</option>
                    <option value={20}>20pt</option>
                  </select>
                </div>
                
                <button
                  onClick={() => setIsBold(!isBold)}
                  className={`p-2 rounded border ${
                    isBold 
                      ? 'bg-emerald-100 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' 
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  } hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200`}
                >
                  <Bold className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setIsItalic(!isItalic)}
                  className={`p-2 rounded border ${
                    isItalic 
                      ? 'bg-emerald-100 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' 
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  } hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200`}
                >
                  <Italic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Text Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Konten Dokumen
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Mulai menulis dokumen Anda di sini..."
                rows={20}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                style={{
                  fontSize: `${fontSize}px`,
                  fontWeight: isBold ? 'bold' : 'normal',
                  fontStyle: isItalic ? 'italic' : 'normal'
                }}
              />
            </div>
          </div>

          {/* Statistics & Controls */}
          <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Statistik Teks
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Kata</span>
                  <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    {wordCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Karakter</span>
                  <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    {charCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Tanpa spasi</span>
                  <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    {charCountNoSpaces}
                  </span>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Preview Format
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border">
                {title && (
                  <div className="mb-3">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      {title}
                    </h4>
                  </div>
                )}
                <div 
                  className="text-gray-900 dark:text-white"
                  style={{
                    fontSize: `${Math.max(fontSize * 0.8, 10)}px`,
                    fontWeight: isBold ? 'bold' : 'normal',
                    fontStyle: isItalic ? 'italic' : 'normal',
                    lineHeight: '1.5'
                  }}
                >
                  {text.slice(0, 200) || 'Preview teks akan muncul di sini...'}
                  {text.length > 200 && '...'}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generatePDF}
              disabled={!text.trim() || isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Membuat PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Unduh sebagai PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📝</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Editor Sederhana</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Interface yang mudah digunakan dengan format dasar
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Statistik Real-time</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Lihat jumlah kata dan karakter secara langsung
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🎨</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Format Kustom</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Atur ukuran font, bold, dan italic sesuai kebutuhan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToPDF;