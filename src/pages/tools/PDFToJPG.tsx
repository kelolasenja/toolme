import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Image, Upload, Download, X, Settings, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

// Initialize pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface ConversionOptions {
  quality: number;
  format: 'jpeg' | 'png';
  dpi: number;
  pageRange: 'all' | 'custom';
  customRange: string;
}

interface PageImage {
  pageNumber: number;
  dataUrl: string;
}

const PDFToJPG: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [previewPage, setPreviewPage] = useState<number | null>(null);
  const [convertedImages, setConvertedImages] = useState<PageImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadedPdfDocument, setLoadedPdfDocument] = useState<any>(null);
  
  const [options, setOptions] = useState<ConversionOptions>({
    quality: 90,
    format: 'jpeg',
    dpi: 150,
    pageRange: 'all',
    customRange: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      convertedImages.forEach(img => {
        URL.revokeObjectURL(img.dataUrl);
      });
    };
  }, [pdfUrl, convertedImages]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Hanya file PDF yang diperbolehkan!');
      return;
    }

    setError(null);
    setPdfFile(file);
    
    // Create URL for the PDF file
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    
    // Reset state
    setConvertedImages([]);
    setNumPages(null);
    setPreviewPage(null);
    setConversionProgress(0);
    setLoadedPdfDocument(null);
  };

  const onDocumentLoadSuccess = (pdfDocument: any) => {
    const numPages = pdfDocument.numPages;
    setNumPages(numPages);
    setLoadedPdfDocument(pdfDocument);
  };

  const updateOption = <K extends keyof ConversionOptions>(key: K, value: ConversionOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const previewPageHandler = (pageNumber: number) => {
    setPreviewPage(pageNumber);
  };

  const closePreview = () => {
    setPreviewPage(null);
  };

  const parsePageRange = (range: string, totalPages: number): number[] => {
    const pages: number[] = [];
    
    if (!range.trim()) {
      return [];
    }
    
    const parts = range.split(',').map(part => part.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        // Range of pages (e.g., "3-7")
        const [start, end] = part.split('-').map(p => parseInt(p.trim()));
        if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= totalPages && start <= end) {
          for (let i = start; i <= end; i++) {
            pages.push(i);
          }
        }
      } else {
        // Single page
        const pageNum = parseInt(part);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
          pages.push(pageNum);
        }
      }
    }
    
    // Remove duplicates and sort
    return [...new Set(pages)].sort((a, b) => a - b);
  };

  const convertPDFToImages = async () => {
    if (!pdfFile || !pdfUrl || !numPages) {
      setError('Pilih file PDF terlebih dahulu!');
      return;
    }

    setIsProcessing(true);
    setConvertedImages([]);
    setConversionProgress(0);
    
    try {
      // Determine which pages to convert
      let pagesToConvert: number[] = [];
      
      if (options.pageRange === 'all') {
        // Convert all pages
        pagesToConvert = Array.from({ length: numPages }, (_, i) => i + 1);
      } else {
        // Convert custom range
        pagesToConvert = parsePageRange(options.customRange, numPages);
        
        if (pagesToConvert.length === 0) {
          setError('Rentang halaman tidak valid. Gunakan format: 1,3,5-7');
          setIsProcessing(false);
          return;
        }
      }
      
      // Calculate scale factor based on DPI
      // Standard PDF is 72 DPI, so scale = targetDPI / 72
      const scaleFactor = options.dpi / 72;
      
      // Use the loaded PDF document or load it if not available
      const pdf = loadedPdfDocument || await pdfjs.getDocument(pdfFile).promise;
      
      const convertedPages: PageImage[] = [];
      
      // Process each page
      for (let i = 0; i < pagesToConvert.length; i++) {
        const pageNumber = pagesToConvert[i];
        
        // Update progress
        setConversionProgress(Math.round((i / pagesToConvert.length) * 100));
        
        // Get the page
        const page = await pdf.getPage(pageNumber);
        
        // Calculate viewport with scale factor
        const viewport = page.getViewport({ scale: scaleFactor });
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Could not get canvas context');
        }
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Render the page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        // Convert canvas to image data URL
        const imageDataUrl = canvas.toDataURL(`image/${options.format}`, options.quality / 100);
        
        // Add to converted images
        convertedPages.push({
          pageNumber,
          dataUrl: imageDataUrl
        });
      }
      
      setConvertedImages(convertedPages);
      setConversionProgress(100);
      
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      setError('Terjadi kesalahan saat mengkonversi PDF ke gambar. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (dataUrl: string, pageNumber: number) => {
    const format = options.format === 'jpeg' ? 'jpg' : options.format;
    const fileName = pdfFile 
      ? `${pdfFile.name.replace(/\.pdf$/i, '')}_page_${pageNumber}.${format}`
      : `page_${pageNumber}.${format}`;
    
    saveAs(dataUrl, fileName);
  };

  const downloadAllImages = async () => {
    if (convertedImages.length === 0) {
      return;
    }
    
    if (convertedImages.length === 1) {
      // If only one image, download directly
      downloadImage(convertedImages[0].dataUrl, convertedImages[0].pageNumber);
      return;
    }
    
    // For multiple images, create a ZIP file
    const zip = new JSZip();
    const format = options.format === 'jpeg' ? 'jpg' : options.format;
    
    // Add each image to the ZIP
    convertedImages.forEach(img => {
      // Convert data URL to blob
      const imageData = img.dataUrl.split(',')[1];
      zip.file(`page_${img.pageNumber}.${format}`, imageData, { base64: true });
    });
    
    // Generate the ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Download the ZIP file
    const zipFileName = pdfFile 
      ? `${pdfFile.name.replace(/\.pdf$/i, '')}_images.zip`
      : 'pdf_images.zip';
    
    saveAs(zipBlob, zipFileName);
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 dark:bg-pink-900/20 rounded-full mb-4">
            <Image className="w-8 h-8 text-pink-600 dark:text-pink-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            PDF ke JPG
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Simpan setiap halaman PDF sebagai file gambar JPG berkualitas tinggi.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-pink-900 dark:text-pink-100 mb-3">
            Cara Menggunakan:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-pink-800 dark:text-pink-200">
            <li>Unggah file PDF yang ingin dikonversi</li>
            <li>Pilih halaman yang ingin dikonversi (semua atau sebagian)</li>
            <li>Atur kualitas gambar output</li>
            <li>Klik tombol "Konversi ke JPG"</li>
            <li>Unduh gambar JPG hasil konversi</li>
          </ol>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - File Upload & Options */}
          <div className="space-y-6">
            {/* File Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                1. Unggah File PDF
              </h3>
              
              {!pdfFile ? (
                <div 
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-pink-400 dark:hover:border-pink-500 transition-colors duration-200"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Klik untuk memilih file PDF
                  </p>
                  <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                    Pilih File PDF
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{pdfFile.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {numPages ? `${numPages} halaman • ${(pdfFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Memuat...'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setPdfFile(null);
                        setPdfUrl(null);
                        setNumPages(null);
                        setConvertedImages([]);
                        setLoadedPdfDocument(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Conversion Options */}
            {pdfFile && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    2. Pengaturan Konversi
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Format Output
                    </label>
                    <select
                      value={options.format}
                      onChange={(e) => updateOption('format', e.target.value as 'jpeg' | 'png')}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="jpeg">JPG</option>
                      <option value="png">PNG</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Kualitas Gambar: {options.quality}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={options.quality}
                      onChange={(e) => updateOption('quality', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Kecil</span>
                      <span>Besar</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Resolusi (DPI)
                    </label>
                    <select
                      value={options.dpi}
                      onChange={(e) => updateOption('dpi', parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value={72}>72 DPI (Web)</option>
                      <option value={150}>150 DPI (Standar)</option>
                      <option value={300}>300 DPI (Cetak)</option>
                      <option value={600}>600 DPI (Kualitas Tinggi)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Halaman yang Dikonversi
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="allPages"
                          name="pageRange"
                          checked={options.pageRange === 'all'}
                          onChange={() => updateOption('pageRange', 'all')}
                          className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 dark:border-gray-600"
                        />
                        <label htmlFor="allPages" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Semua halaman
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="customPages"
                          name="pageRange"
                          checked={options.pageRange === 'custom'}
                          onChange={() => updateOption('pageRange', 'custom')}
                          className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 dark:border-gray-600"
                        />
                        <label htmlFor="customPages" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Halaman tertentu
                        </label>
                      </div>
                      
                      {options.pageRange === 'custom' && (
                        <input
                          type="text"
                          value={options.customRange}
                          onChange={(e) => updateOption('customRange', e.target.value)}
                          placeholder="Contoh: 1,3,5-7"
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 mt-2"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Convert Button */}
            {pdfFile && (
              <button
                onClick={convertPDFToImages}
                disabled={isProcessing || !pdfFile}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Mengkonversi... {conversionProgress}%</span>
                  </>
                ) : (
                  <>
                    <Image className="w-5 h-5" />
                    <span>Konversi ke {options.format === 'jpeg' ? 'JPG' : 'PNG'}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Right Column - Preview & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* PDF Preview */}
            {pdfUrl && !convertedImages.length && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Preview PDF
                </h3>
                
                <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 mb-3">
                  <Document
                    file={pdfFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={(error) => {
                      console.error('Error loading PDF:', error);
                      setError('Terjadi kesalahan saat memuat PDF. Pastikan file tidak rusak.');
                    }}
                  >
                    <Page 
                      pageNumber={1} 
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={400}
                    />
                  </Document>
                </div>
                
                {numPages && numPages > 1 && (
                  <div className="text-center">
                    <button
                      onClick={() => previewPageHandler(1)}
                      className="inline-flex items-center space-x-2 px-3 py-1 bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 rounded hover:bg-pink-200 dark:hover:bg-pink-800/30 transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Lihat Semua Halaman</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Converted Images */}
            {convertedImages.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Hasil Konversi ({convertedImages.length} gambar)
                  </h3>
                  
                  {convertedImages.length > 1 && (
                    <button
                      onClick={downloadAllImages}
                      className="inline-flex items-center space-x-2 px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh Semua (ZIP)</span>
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {convertedImages.map((img) => (
                    <div key={img.pageNumber} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                      <div className="aspect-[3/4] relative">
                        <img 
                          src={img.dataUrl} 
                          alt={`Page ${img.pageNumber}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Halaman {img.pageNumber}
                        </span>
                        <button
                          onClick={() => downloadImage(img.dataUrl, img.pageNumber)}
                          className="p-1 text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!pdfUrl && !convertedImages.length && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center justify-center min-h-[300px]">
                <Image className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Belum Ada File PDF
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                  Unggah file PDF untuk mengkonversi halaman-halamannya menjadi gambar JPG atau PNG berkualitas tinggi.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Page Preview Modal */}
        {previewPage !== null && pdfFile && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Preview Dokumen
                </h3>
                <button
                  onClick={closePreview}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <Document
                  file={pdfFile}
                  onLoadError={(error) => {
                    console.error('Error loading PDF for preview:', error);
                    setError('Terjadi kesalahan saat memuat preview PDF.');
                  }}
                >
                  {Array.from(new Array(numPages), (_, index) => (
                    <div key={`page_${index + 1}`} className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Halaman {index + 1}</p>
                      <Page 
                        pageNumber={index + 1} 
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        width={600}
                      />
                    </div>
                  ))}
                </Document>
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  onClick={closePreview}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🖼️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Kualitas Tinggi</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Konversi dengan resolusi tinggi untuk hasil terbaik
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Multi-halaman</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Konversi satu halaman atau seluruh dokumen
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cepat & Efisien</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Proses konversi yang cepat dan hasil yang optimal
            </p>
          </div>
        </div>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default PDFToJPG;