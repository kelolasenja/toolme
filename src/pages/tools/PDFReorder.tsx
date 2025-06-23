import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowUpDown, Upload, Download, GripVertical, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

interface PDFPage {
  id: string;
  pageNumber: number;
  thumbnail: string;
}

const PDFReorder: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateThumbnail = async (pdfDoc: any, pageIndex: number): Promise<string> => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    
    const context = canvas.getContext('2d');
    if (!context) return '';

    const page = pdfDoc.getPage(pageIndex + 1);
    const viewport = page.getViewport({ scale: 0.5 });
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    return canvas.toDataURL();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Hanya file PDF yang diperbolehkan!');
      return;
    }

    setPdfFile(file);
    setIsGeneratingThumbnails(true);
    
    try {
      // Load PDF for page count
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();

      // Generate page objects
      const pdfPages: PDFPage[] = [];
      for (let i = 0; i < pageCount; i++) {
        pdfPages.push({
          id: `page-${i}`,
          pageNumber: i + 1,
          thumbnail: '' // Will be generated if needed
        });
      }
      
      setPages(pdfPages);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error membaca file PDF. Pastikan file tidak rusak.');
    } finally {
      setIsGeneratingThumbnails(false);
    }
  };

  const movePage = (pageId: string, direction: 'up' | 'down') => {
    setPages(prev => {
      const index = prev.findIndex(page => page.id === pageId);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newPages = [...prev];
      [newPages[index], newPages[newIndex]] = [newPages[newIndex], newPages[index]];
      return newPages;
    });
  };

  const resetOrder = () => {
    setPages(prev => 
      [...prev].sort((a, b) => a.pageNumber - b.pageNumber)
    );
  };

  const reorderPDF = async () => {
    if (!pdfFile || pages.length === 0) {
      alert('Pilih file PDF terlebih dahulu!');
      return;
    }

    setIsProcessing(true);
    
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      
      // Copy pages in new order
      for (const page of pages) {
        const [copiedPage] = await newPdf.copyPages(originalPdf, [page.pageNumber - 1]);
        newPdf.addPage(copiedPage);
      }
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, 'reordered-document.pdf');
      
    } catch (error) {
      console.error('Error reordering PDF:', error);
      alert('Terjadi kesalahan saat mengatur ulang PDF.');
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
            <ArrowUpDown className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Urutkan Ulang Halaman PDF
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Ubah urutan halaman dalam sebuah dokumen PDF dengan mudah.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">
            Cara Menggunakan:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-purple-800 dark:text-purple-200">
            <li>Unggah file PDF yang ingin diatur ulang</li>
            <li>Gunakan tombol panah untuk mengubah urutan halaman</li>
            <li>Klik tombol "Unduh PDF Baru" untuk menyimpan hasil</li>
          </ol>
        </div>

        {/* File Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div 
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 transition-colors duration-200"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Unggah File PDF
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Pilih file PDF yang ingin diatur ulang halamannya
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
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

        {/* File Info */}
        {pdfFile && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  File Terpilih:
                </h4>
                <p className="font-medium text-gray-900 dark:text-white">{pdfFile.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total halaman: {pages.length}
                </p>
              </div>
              <button
                onClick={resetOrder}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Urutan</span>
              </button>
            </div>
          </div>
        )}

        {/* Pages List */}
        {pages.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Urutan Halaman:
            </h4>
            
            {isGeneratingThumbnails ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Memuat halaman...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pages.map((page, index) => (
                  <div key={page.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border">
                    <div className="aspect-[3/4] bg-white dark:bg-gray-600 rounded mb-3 flex items-center justify-center border">
                      <span className="text-2xl font-bold text-gray-400">
                        {page.pageNumber}
                      </span>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Halaman {page.pageNumber}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Posisi: {index + 1}
                      </p>
                      
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => movePage(page.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ↑
                        </button>
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <button
                          onClick={() => movePage(page.id, 'down')}
                          disabled={index === pages.length - 1}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reorder Button */}
        <div className="text-center">
          <button
            onClick={reorderPDF}
            disabled={pages.length === 0 || isProcessing}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Unduh PDF Baru</span>
              </>
            )}
          </button>
        </div>

        {/* Hidden canvas for thumbnail generation */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🔄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Mudah Diatur</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Gunakan tombol panah untuk mengubah urutan halaman
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">👁️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Visual Preview</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Lihat nomor halaman dan posisi saat ini
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cepat & Aman</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Proses dilakukan lokal tanpa upload ke server
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFReorder;