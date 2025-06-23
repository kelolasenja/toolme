import React, { useState, useRef } from 'react';
import { ArrowLeft, FileImage, Upload, Download, X, GripVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { saveAs } from 'file-saver';

interface ImageFile {
  id: string;
  file: File;
  name: string;
  preview: string;
}

const JPGToPDF: React.FC = () => {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [pageSize, setPageSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      alert('Hanya file gambar yang diperbolehkan!');
    }

    const newImageFiles: ImageFile[] = imageFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      preview: URL.createObjectURL(file)
    }));

    setImageFiles(prev => [...prev, ...newImageFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setImageFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(file => file.id !== id);
    });
  };

  const moveFile = (id: string, direction: 'up' | 'down') => {
    setImageFiles(prev => {
      const index = prev.findIndex(file => file.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newFiles = [...prev];
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      return newFiles;
    });
  };

  const getPageDimensions = () => {
    let dimensions = PageSizes.A4;
    
    switch (pageSize) {
      case 'A3':
        dimensions = PageSizes.A3;
        break;
      case 'Letter':
        dimensions = PageSizes.Letter;
        break;
      case 'Legal':
        dimensions = PageSizes.Legal;
        break;
      default:
        dimensions = PageSizes.A4;
    }
    
    if (orientation === 'landscape') {
      return [dimensions[1], dimensions[0]];
    }
    
    return dimensions;
  };

  const convertToPDF = async () => {
    if (imageFiles.length === 0) {
      alert('Pilih minimal satu gambar!');
      return;
    }

    setIsProcessing(true);
    
    try {
      const pdfDoc = await PDFDocument.create();
      const [pageWidth, pageHeight] = getPageDimensions();
      
      for (const imageFile of imageFiles) {
        const imageBytes = await imageFile.file.arrayBuffer();
        let image;
        
        if (imageFile.file.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }
        
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        
        // Calculate image dimensions to fit page while maintaining aspect ratio
        const imageAspectRatio = image.width / image.height;
        const pageAspectRatio = pageWidth / pageHeight;
        
        let imageWidth, imageHeight;
        const margin = 50;
        const maxWidth = pageWidth - (margin * 2);
        const maxHeight = pageHeight - (margin * 2);
        
        if (imageAspectRatio > pageAspectRatio) {
          // Image is wider than page
          imageWidth = maxWidth;
          imageHeight = maxWidth / imageAspectRatio;
        } else {
          // Image is taller than page
          imageHeight = maxHeight;
          imageWidth = maxHeight * imageAspectRatio;
        }
        
        // Center the image on the page
        const x = (pageWidth - imageWidth) / 2;
        const y = (pageHeight - imageHeight) / 2;
        
        page.drawImage(image, {
          x,
          y,
          width: imageWidth,
          height: imageHeight,
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, 'images-to-pdf.pdf');
      
    } catch (error) {
      console.error('Error converting to PDF:', error);
      alert('Terjadi kesalahan saat mengkonversi gambar ke PDF.');
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
            <FileImage className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Konverter JPG ke PDF
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Ubah satu atau beberapa gambar menjadi satu file PDF.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
            Cara Menggunakan:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-green-800 dark:text-green-200">
            <li>Unggah satu atau beberapa gambar (JPG, PNG, GIF, BMP)</li>
            <li>Atur ukuran halaman dan orientasi jika diperlukan</li>
            <li>Klik tombol "Konversi ke PDF"</li>
            <li>Unduh file PDF yang telah dibuat</li>
          </ol>
        </div>

        {/* File Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div 
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-green-400 dark:hover:border-green-500 transition-colors duration-200"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Unggah Gambar
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Mendukung format JPG, PNG, GIF, BMP, dan WebP
            </p>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
              Pilih Gambar
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Settings */}
        {imageFiles.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Pengaturan PDF
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ukuran Halaman
                </label>
                <select 
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Orientasi
                </label>
                <select 
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Image List */}
        {imageFiles.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Gambar yang Akan Dikonversi ({imageFiles.length}):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {imageFiles.map((file, index) => (
                <div key={file.id} className="relative bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-600">
                    <img 
                      src={file.preview} 
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate mb-2">
                    {file.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => moveFile(file.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveFile(file.id, 'down')}
                        disabled={index === imageFiles.length - 1}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Convert Button */}
        <div className="text-center">
          <button
            onClick={convertToPDF}
            disabled={imageFiles.length === 0 || isProcessing}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Mengkonversi...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Konversi ke PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Supported Formats */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Format yang Didukung
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {['JPG', 'PNG', 'GIF', 'BMP', 'WebP', 'TIFF'].map((format) => (
              <span 
                key={format}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
              >
                {format}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JPGToPDF;