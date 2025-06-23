import React, { useState, useRef } from 'react';
import { ArrowLeft, Scissors, Upload, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const PDFSplitter: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageRanges, setPageRanges] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Hanya file PDF yang diperbolehkan!');
      return;
    }

    setPdfFile(file);
    
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

  const parsePageRanges = (ranges: string, totalPages: number): number[][] => {
    const result: number[][] = [];
    const parts = ranges.split(',').map(s => s.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(s => parseInt(s.trim()));
        if (start >= 1 && end <= totalPages && start <= end) {
          const pages = [];
          for (let i = start; i <= end; i++) {
            pages.push(i - 1); // Convert to 0-based index
          }
          result.push(pages);
        }
      } else {
        const page = parseInt(part);
        if (page >= 1 && page <= totalPages) {
          result.push([page - 1]); // Convert to 0-based index
        }
      }
    }
    
    return result;
  };

  const splitPDF = async () => {
    if (!pdfFile || !pageRanges.trim()) {
      alert('Pilih file PDF dan masukkan rentang halaman!');
      return;
    }

    setIsProcessing(true);
    
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const ranges = parsePageRanges(pageRanges, totalPages);
      
      if (ranges.length === 0) {
        alert('Format rentang halaman tidak valid!');
        setIsProcessing(false);
        return;
      }

      if (ranges.length === 1) {
        // Single PDF output
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(originalPdf, ranges[0]);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        saveAs(blob, `split-pages-${ranges[0].map(p => p + 1).join('-')}.pdf`);
      } else {
        // Multiple PDFs - create ZIP
        const zip = new JSZip();
        
        for (let i = 0; i < ranges.length; i++) {
          const newPdf = await PDFDocument.create();
          const copiedPages = await newPdf.copyPages(originalPdf, ranges[i]);
          copiedPages.forEach(page => newPdf.addPage(page));
          
          const pdfBytes = await newPdf.save();
          const fileName = `split-part-${i + 1}-pages-${ranges[i].map(p => p + 1).join('-')}.pdf`;
          zip.file(fileName, pdfBytes);
        }
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, 'split-pdfs.zip');
      }
      
    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('Terjadi kesalahan saat memisahkan PDF. Periksa format rentang halaman.');
    } finally {
      setIsProcessing(false);
    }
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
            <Scissors className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pemisah PDF (PDF Splitter)
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Pisahkan halaman dari file PDF sesuai kebutuhan Anda.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-3">
            Cara Menggunakan:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-red-800 dark:text-red-200 mb-4">
            <li>Unggah file PDF yang ingin dipisahkan</li>
            <li>Masukkan rentang halaman (contoh: "1-3, 5, 8-10")</li>
            <li>Klik tombol "Pisahkan PDF"</li>
            <li>Unduh file hasil pemisahan</li>
          </ol>
          <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Format rentang halaman:</strong><br/>
              • Halaman tunggal: "1, 3, 5"<br/>
              • Rentang halaman: "1-5, 8-10"<br/>
              • Kombinasi: "1-3, 5, 7-9"
            </p>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div 
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-red-400 dark:hover:border-red-500 transition-colors duration-200"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Unggah File PDF
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Pilih file PDF yang ingin dipisahkan
            </p>
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
              Pilih File PDF
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

        {/* File Info & Page Range Input */}
        {pdfFile && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                File Terpilih:
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white">{pdfFile.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total halaman: {totalPages}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rentang Halaman yang Ingin Dipisahkan:
              </label>
              <input
                type="text"
                value={pageRanges}
                onChange={(e) => setPageRanges(e.target.value)}
                placeholder="Contoh: 1-3, 5, 8-10"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Pisahkan dengan koma untuk beberapa rentang. Gunakan tanda "-" untuk rentang halaman.
              </p>
            </div>
          </div>
        )}

        {/* Split Button */}
        <div className="text-center">
          <button
            onClick={splitPDF}
            disabled={!pdfFile || !pageRanges.trim() || isProcessing}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Memisahkan...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Pisahkan PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">✂️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fleksibel</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Pisahkan halaman sesuai kebutuhan dengan format yang mudah
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📦</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">ZIP Output</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Hasil multiple file otomatis dikemas dalam ZIP
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🔒</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aman</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Proses dilakukan lokal, file tidak diunggah ke server
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFSplitter;