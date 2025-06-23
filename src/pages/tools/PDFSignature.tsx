import React, { useState, useRef } from 'react';
import { ArrowLeft, PenTool, Upload, Download, X, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PDFDocument, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';

const PDFSignature: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string>('');
  const [pdfPreview, setPdfPreview] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [signaturePosition, setSignaturePosition] = useState({ x: 50, y: 50 });
  const [signatureSize, setSignatureSize] = useState({ width: 150, height: 75 });
  const [selectedPage, setSelectedPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const handlePDFSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setSelectedPage(1);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error membaca file PDF. Pastikan file tidak rusak.');
    }
  };

  const handleSignatureSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan!');
      return;
    }

    setSignatureFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setSignaturePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeSignature = () => {
    setSignatureFile(null);
    setSignaturePreview('');
    if (signatureInputRef.current) {
      signatureInputRef.current.value = '';
    }
  };

  const removePDF = () => {
    setPdfFile(null);
    setPdfPreview('');
    setTotalPages(0);
    setSelectedPage(1);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }
  };

  const addSignatureToPDF = async () => {
    if (!pdfFile || !signatureFile) {
      alert('Pilih file PDF dan gambar tanda tangan!');
      return;
    }

    setIsProcessing(true);
    
    try {
      const pdfArrayBuffer = await pdfFile.arrayBuffer();
      const signatureArrayBuffer = await signatureFile.arrayBuffer();
      
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      
      // Embed signature image
      let signatureImage;
      if (signatureFile.type === 'image/png') {
        signatureImage = await pdfDoc.embedPng(signatureArrayBuffer);
      } else {
        signatureImage = await pdfDoc.embedJpg(signatureArrayBuffer);
      }
      
      // Get the selected page
      const page = pdfDoc.getPage(selectedPage - 1);
      const { width: pageWidth, height: pageHeight } = page.getSize();
      
      // Calculate position (convert from percentage to actual coordinates)
      const x = (signaturePosition.x / 100) * pageWidth;
      const y = pageHeight - ((signaturePosition.y / 100) * pageHeight) - signatureSize.height;
      
      // Add signature to page
      page.drawImage(signatureImage, {
        x,
        y,
        width: signatureSize.width,
        height: signatureSize.height,
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, `signed-${pdfFile.name}`);
      
    } catch (error) {
      console.error('Error adding signature to PDF:', error);
      alert('Terjadi kesalahan saat menambahkan tanda tangan ke PDF.');
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/20 rounded-full mb-4">
            <PenTool className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Tambah Tanda Tangan ke PDF
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Tempelkan gambar tanda tangan Anda ke dokumen PDF dengan preview langsung.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-3">
            Cara Menggunakan:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-indigo-800 dark:text-indigo-200">
            <li>Unggah file PDF yang ingin ditandatangani</li>
            <li>Unggah gambar tanda tangan (format PNG transparan direkomendasikan)</li>
            <li>Preview dokumen akan muncul untuk membantu penempatan tanda tangan</li>
            <li>Atur posisi dan ukuran tanda tangan sesuai kebutuhan</li>
            <li>Pilih halaman yang ingin ditandatangani</li>
            <li>Klik "Tambah Tanda Tangan & Unduh"</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            {/* PDF Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                1. Unggah File PDF
              </h3>
              <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors duration-200"
                onClick={() => pdfInputRef.current?.click()}
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
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                  {pdfFile ? 'Ganti PDF' : 'Pilih PDF'}
                </button>
              </div>
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf"
                onChange={handlePDFSelect}
                className="hidden"
              />
            </div>

            {/* Signature Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                2. Unggah Tanda Tangan
              </h3>
              <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors duration-200"
                onClick={() => signatureInputRef.current?.click()}
              >
                {signaturePreview ? (
                  <div className="relative">
                    <img 
                      src={signaturePreview} 
                      alt="Signature preview"
                      className="max-h-24 mx-auto mb-3 border rounded"
                    />
                    <p className="text-gray-900 dark:text-white font-medium mb-2">{signatureFile?.name}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSignature();
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      Klik untuk memilih gambar tanda tangan
                    </p>
                  </>
                )}
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                  {signatureFile ? 'Ganti Tanda Tangan' : 'Pilih Gambar'}
                </button>
              </div>
              <input
                ref={signatureInputRef}
                type="file"
                accept="image/*"
                onChange={handleSignatureSelect}
                className="hidden"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Format yang didukung: PNG, JPG, GIF. PNG transparan direkomendasikan.
              </p>
            </div>

            {/* Page Selection */}
            {totalPages > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  3. Pilih Halaman
                </h3>
                <select
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {Array.from({ length: totalPages }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Halaman {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* PDF Preview Section */}
          <div className="lg:col-span-1">
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
                      src={`${pdfPreview}#page=${selectedPage}&toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full h-full"
                      title="PDF Preview"
                    />
                    
                    {/* Signature overlay preview */}
                    {signaturePreview && (
                      <div 
                        className="absolute border-2 border-indigo-500 bg-indigo-100 dark:bg-indigo-900/20 rounded flex items-center justify-center opacity-75"
                        style={{
                          left: `${signaturePosition.x}%`,
                          top: `${signaturePosition.y}%`,
                          width: `${Math.min(signatureSize.width / 4, 60)}px`,
                          height: `${Math.min(signatureSize.height / 4, 30)}px`
                        }}
                      >
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          Signature
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Halaman {selectedPage} dari {totalPages}
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

          {/* Settings Section */}
          <div className="space-y-6">
            {/* Position Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                4. Atur Posisi & Ukuran
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Posisi X (%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={signaturePosition.x}
                      onChange={(e) => setSignaturePosition(prev => ({ ...prev, x: Number(e.target.value) }))}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-500">{signaturePosition.x}%</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Posisi Y (%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={signaturePosition.y}
                      onChange={(e) => setSignaturePosition(prev => ({ ...prev, y: Number(e.target.value) }))}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-500">{signaturePosition.y}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Lebar (px)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="300"
                      value={signatureSize.width}
                      onChange={(e) => setSignatureSize(prev => ({ ...prev, width: Number(e.target.value) }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tinggi (px)
                    </label>
                    <input
                      type="number"
                      min="25"
                      max="150"
                      value={signatureSize.height}
                      onChange={(e) => setSignatureSize(prev => ({ ...prev, height: Number(e.target.value) }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Quick position buttons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Posisi Cepat
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Kiri Atas', x: 10, y: 10 },
                      { label: 'Tengah Atas', x: 40, y: 10 },
                      { label: 'Kanan Atas', x: 70, y: 10 },
                      { label: 'Kiri Tengah', x: 10, y: 40 },
                      { label: 'Tengah', x: 40, y: 40 },
                      { label: 'Kanan Tengah', x: 70, y: 40 },
                      { label: 'Kiri Bawah', x: 10, y: 70 },
                      { label: 'Tengah Bawah', x: 40, y: 70 },
                      { label: 'Kanan Bawah', x: 70, y: 70 }
                    ].map((pos) => (
                      <button
                        key={pos.label}
                        onClick={() => setSignaturePosition({ x: pos.x, y: pos.y })}
                        className="p-2 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Add Signature Button */}
            <button
              onClick={addSignatureToPDF}
              disabled={!pdfFile || !signatureFile || isProcessing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Menambahkan Tanda Tangan...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Tambah Tanda Tangan & Unduh</span>
                </>
              )}
            </button>

            {/* Tips */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tips untuk Tanda Tangan Terbaik:
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  <span>Gunakan gambar PNG dengan background transparan</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  <span>Pastikan tanda tangan terlihat jelas dan kontras</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  <span>Gunakan preview untuk memastikan posisi yang tepat</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  <span>Atur ukuran sesuai dengan area yang tersedia</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFSignature;