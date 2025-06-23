import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Crop, Upload, Download, RefreshCw, X, Settings, Eye, Maximize, Minimize, RotateCw, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { saveAs } from 'file-saver';
import { Cropper } from 'react-cropper';
import 'cropperjs/dist/cropper.css';

interface Platform {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: number;
  description: string;
  icon: string;
  category: string;
}

const platforms: Platform[] = [
  // Instagram
  { id: 'instagram-post', name: 'Instagram Post', width: 1080, height: 1080, aspectRatio: 1, description: 'Square post for Instagram feed', icon: '📷', category: 'Instagram' },
  { id: 'instagram-story', name: 'Instagram Story', width: 1080, height: 1920, aspectRatio: 9/16, description: 'Vertical format for Instagram stories', icon: '📱', category: 'Instagram' },
  { id: 'instagram-portrait', name: 'Instagram Portrait', width: 1080, height: 1350, aspectRatio: 4/5, description: 'Portrait format for Instagram feed', icon: '🖼️', category: 'Instagram' },
  { id: 'instagram-landscape', name: 'Instagram Landscape', width: 1080, height: 608, aspectRatio: 16/9, description: 'Landscape format for Instagram feed', icon: '🌄', category: 'Instagram' },
  { id: 'instagram-reels', name: 'Instagram Reels', width: 1080, height: 1920, aspectRatio: 9/16, description: 'Vertical format for Instagram Reels', icon: '🎬', category: 'Instagram' },
  
  // Facebook
  { id: 'facebook-post', name: 'Facebook Post', width: 1200, height: 630, aspectRatio: 1.91, description: 'Rectangular post for Facebook feed', icon: '👍', category: 'Facebook' },
  { id: 'facebook-cover', name: 'Facebook Cover', width: 851, height: 315, aspectRatio: 2.7, description: 'Cover image for Facebook profile', icon: '🖥️', category: 'Facebook' },
  { id: 'facebook-event', name: 'Facebook Event', width: 1920, height: 1080, aspectRatio: 16/9, description: 'Image for Facebook events', icon: '📅', category: 'Facebook' },
  { id: 'facebook-story', name: 'Facebook Story', width: 1080, height: 1920, aspectRatio: 9/16, description: 'Vertical format for Facebook stories', icon: '📖', category: 'Facebook' },
  { id: 'facebook-group', name: 'Facebook Group', width: 1640, height: 856, aspectRatio: 1.91, description: 'Cover image for Facebook groups', icon: '👥', category: 'Facebook' },
  
  // Twitter/X
  { id: 'twitter-post', name: 'Twitter Post', width: 1200, height: 675, aspectRatio: 16/9, description: 'Image for Twitter timeline', icon: '🐦', category: 'Twitter/X' },
  { id: 'twitter-header', name: 'Twitter Header', width: 1500, height: 500, aspectRatio: 3, description: 'Header image for Twitter profile', icon: '📝', category: 'Twitter/X' },
  
  // LinkedIn
  { id: 'linkedin-post', name: 'LinkedIn Post', width: 1200, height: 627, aspectRatio: 1.91, description: 'Image for LinkedIn feed', icon: '💼', category: 'LinkedIn' },
  { id: 'linkedin-cover', name: 'LinkedIn Cover', width: 1584, height: 396, aspectRatio: 4, description: 'Cover image for LinkedIn profile', icon: '🔗', category: 'LinkedIn' },
  { id: 'linkedin-company', name: 'LinkedIn Company', width: 1128, height: 191, aspectRatio: 5.9, description: 'Cover image for LinkedIn company page', icon: '🏢', category: 'LinkedIn' },
  
  // YouTube
  { id: 'youtube-thumbnail', name: 'YouTube Thumbnail', width: 1280, height: 720, aspectRatio: 16/9, description: 'Thumbnail for YouTube videos', icon: '▶️', category: 'YouTube' },
  { id: 'youtube-channel', name: 'YouTube Channel Art', width: 2560, height: 1440, aspectRatio: 16/9, description: 'Banner for YouTube channel', icon: '📺', category: 'YouTube' },
  
  // Pinterest
  { id: 'pinterest-pin', name: 'Pinterest Pin', width: 1000, height: 1500, aspectRatio: 2/3, description: 'Vertical pin for Pinterest', icon: '📌', category: 'Pinterest' },
  { id: 'pinterest-board', name: 'Pinterest Board Cover', width: 800, height: 800, aspectRatio: 1, description: 'Cover image for Pinterest boards', icon: '📋', category: 'Pinterest' },
  
  // TikTok
  { id: 'tiktok-video', name: 'TikTok Video', width: 1080, height: 1920, aspectRatio: 9/16, description: 'Video format for TikTok', icon: '🎵', category: 'TikTok' },
  { id: 'tiktok-profile', name: 'TikTok Profile', width: 200, height: 200, aspectRatio: 1, description: 'Profile picture for TikTok', icon: '👤', category: 'TikTok' }
];

const SocialMediaResizer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(platforms[0]);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [imageQuality, setImageQuality] = useState<number>(90);
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [cropHistory, setCropHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<any>(null);
  
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      if (croppedImage) {
        URL.revokeObjectURL(croppedImage);
      }
      cropHistory.forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [imageUrl, croppedImage, cropHistory]);

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(platforms.map(p => p.category)))];

  // Filter platforms based on search and category
  const filteredPlatforms = platforms.filter(platform => {
    const matchesSearch = platform.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         platform.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || platform.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed!');
      return;
    }

    // Check file size (max 20MB)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large! Maximum size is 20MB.');
      return;
    }

    setError(null);
    setSelectedImage(file);
    
    // Create URL for the image
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    
    // Reset cropped image and history
    setCroppedImage(null);
    setCropHistory([]);
    setHistoryIndex(-1);
    setRotation(0);
    setZoom(1);
  };

  const handlePlatformChange = (platform: Platform) => {
    setSelectedPlatform(platform);
    setCroppedImage(null);
    
    // Reset cropper if it exists
    if (cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.reset();
      cropperRef.current.cropper.setAspectRatio(platform.aspectRatio);
    }
  };

  const handleRotate = (direction: 'clockwise' | 'counterclockwise') => {
    if (cropperRef.current && cropperRef.current.cropper) {
      const amount = direction === 'clockwise' ? 90 : -90;
      cropperRef.current.cropper.rotate(amount);
      setRotation((prev) => (prev + amount) % 360);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (cropperRef.current && cropperRef.current.cropper) {
      const ratio = direction === 'in' ? 0.1 : -0.1;
      cropperRef.current.cropper.zoom(ratio);
      setZoom(prev => Math.max(0.1, prev + ratio));
    }
  };

  const handleReset = () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.reset();
      setRotation(0);
      setZoom(1);
    }
  };

  const cropImage = () => {
    if (!cropperRef.current || !cropperRef.current.cropper) {
      setError('Cropper not initialized');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Get cropped canvas
      const canvas = cropperRef.current.cropper.getCroppedCanvas({
        width: selectedPlatform.width,
        height: selectedPlatform.height,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
      
      if (!canvas) {
        throw new Error('Failed to create canvas');
      }
      
      // Convert canvas to data URL with selected quality and format
      const dataUrl = canvas.toDataURL(`image/${outputFormat}`, imageQuality / 100);
      
      // Add to history
      setCropHistory(prev => {
        const newHistory = [...prev.slice(0, historyIndex + 1), dataUrl];
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      });
      
      setCroppedImage(dataUrl);
      
    } catch (error) {
      console.error('Error cropping image:', error);
      setError('An error occurred while cropping the image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCroppedImage = () => {
    if (!croppedImage) return;
    
    const extension = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    const fileName = selectedImage 
      ? `${selectedImage.name.split('.')[0]}_${selectedPlatform.id}.${extension}`
      : `image_${selectedPlatform.id}.${extension}`;
    
    saveAs(croppedImage, fileName);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setCroppedImage(cropHistory[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < cropHistory.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setCroppedImage(cropHistory[historyIndex + 1]);
    }
  };

  const batchProcess = async () => {
    if (!cropperRef.current || !cropperRef.current.cropper || !selectedImage) {
      setError('Please select an image first');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Create a zip file with JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const extension = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
      
      // Process each platform
      for (const platform of platforms) {
        // Set aspect ratio for current platform
        cropperRef.current.cropper.setAspectRatio(platform.aspectRatio);
        
        // Wait for cropper to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get cropped canvas
        const canvas = cropperRef.current.cropper.getCroppedCanvas({
          width: platform.width,
          height: platform.height,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
        });
        
        if (!canvas) continue;
        
        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
          }, `image/${outputFormat}`, imageQuality / 100);
        });
        
        // Add to zip
        const fileName = `${selectedImage.name.split('.')[0]}_${platform.id}.${extension}`;
        zip.file(fileName, blob);
      }
      
      // Generate and download zip
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `social_media_images_${Date.now()}.zip`);
      
      // Reset cropper to original platform
      cropperRef.current.cropper.setAspectRatio(selectedPlatform.aspectRatio);
      
    } catch (error) {
      console.error('Error in batch processing:', error);
      setError('An error occurred during batch processing. Please try again.');
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
            <Crop className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Social Media Image Resizer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Potong gambar sesuai ukuran optimal untuk Instagram, Twitter, Facebook, dan platform lainnya.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-3">
            Fitur Utama:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-indigo-800 dark:text-indigo-200">
            <li>Potong gambar untuk 20+ ukuran platform media sosial</li>
            <li>Rotasi, zoom, dan penyesuaian gambar yang presisi</li>
            <li>Batch processing untuk menghasilkan semua ukuran sekaligus</li>
            <li>Pengaturan kualitas dan format output yang dapat disesuaikan</li>
            <li>Preview hasil sebelum mengunduh</li>
          </ul>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image Upload & Platform Selection */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                1. Unggah Gambar
              </h3>
              
              {!selectedImage ? (
                <div 
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors duration-200"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Klik untuk memilih gambar
                  </p>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                    Pilih Gambar
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedImage.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(selectedImage.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setImageUrl(null);
                        setCroppedImage(null);
                        setCropHistory([]);
                        setHistoryIndex(-1);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {imageUrl && (
                    <div className="aspect-video bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt="Selected" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Platform Selection */}
            {selectedImage && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  2. Pilih Platform
                </h3>
                
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Cari platform..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                        selectedCategory === category
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {filteredPlatforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => handlePlatformChange(platform)}
                      className={`p-3 rounded-lg text-left transition-colors duration-200 ${
                        selectedPlatform.id === platform.id
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{platform.icon}</span>
                        <div>
                          <div className="text-sm font-medium">{platform.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {platform.width} x {platform.height}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                  <div className="text-sm font-medium text-indigo-800 dark:text-indigo-200 mb-1">
                    {selectedPlatform.name}
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400">
                    {selectedPlatform.width} x {selectedPlatform.height} px • {selectedPlatform.description}
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Settings */}
            {selectedImage && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    3. Pengaturan
                  </h3>
                  <button
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleRotate('counterclockwise')}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      title="Rotate counterclockwise"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRotate('clockwise')}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      title="Rotate clockwise"
                    >
                      <RotateCw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleZoom('out')}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      title="Zoom out"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleZoom('in')}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      title="Zoom in"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleReset}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      title="Reset"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {showAdvancedSettings && (
                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Output Format
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
                          Image Quality: {imageQuality}%
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={imageQuality}
                          onChange={(e) => setImageQuality(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>Smaller file</span>
                          <span>Better quality</span>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <button
                          onClick={batchProcess}
                          disabled={isProcessing}
                          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              <span>Batch Process All Platforms</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={cropImage}
                    disabled={isProcessing || !imageUrl}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Crop className="w-5 h-5" />
                        <span>Crop Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Cropper & Result */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cropper */}
            {selectedImage && imageUrl && !croppedImage && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Crop Area
                </h3>
                
                <div className="bg-gray-900 rounded-lg overflow-hidden" style={{ height: '500px' }}>
                  <Cropper
                    ref={cropperRef}
                    src={imageUrl}
                    style={{ height: 500, width: '100%' }}
                    aspectRatio={selectedPlatform.aspectRatio}
                    guides={true}
                    viewMode={1}
                    minCropBoxHeight={10}
                    minCropBoxWidth={10}
                    background={false}
                    responsive={true}
                    checkOrientation={false}
                    zoomTo={zoom}
                  />
                </div>
                
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                  Drag to adjust crop area. Use controls to rotate and zoom.
                </div>
              </div>
            )}

            {/* Cropped Result */}
            {croppedImage && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Result for {selectedPlatform.name}
                  </h3>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCroppedImage(null)}
                      className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                      title="Edit again"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleUndo}
                      disabled={historyIndex <= 0}
                      className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                      title="Undo"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleRedo}
                      disabled={historyIndex >= cropHistory.length - 1}
                      className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                      title="Redo"
                    >
                      <ArrowLeft className="w-5 h-5 transform rotate-180" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
                  <img 
                    src={croppedImage} 
                    alt="Cropped" 
                    className="max-w-full mx-auto"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedPlatform.width} x {selectedPlatform.height} px • {outputFormat.toUpperCase()} • {imageQuality}% quality
                  </div>
                  
                  <button
                    onClick={downloadCroppedImage}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Image</span>
                  </button>
                </div>
              </div>
            )}

            {/* Platform Preview */}
            {croppedImage && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Preview on {selectedPlatform.name}
                </h3>
                
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  {selectedPlatform.id === 'instagram-post' && (
                    <div className="max-w-sm mx-auto">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">username</div>
                      </div>
                      <div className="aspect-square bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                        <img src={croppedImage} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="w-6 h-6 text-gray-500">♥</div>
                        <div className="w-6 h-6 text-gray-500">💬</div>
                        <div className="w-6 h-6 text-gray-500">↪</div>
                      </div>
                    </div>
                  )}
                  
                  {selectedPlatform.id === 'instagram-story' && (
                    <div className="max-w-xs mx-auto">
                      <div className="aspect-[9/16] bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                        <img src={croppedImage} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  
                  {selectedPlatform.id === 'facebook-post' && (
                    <div className="max-w-md mx-auto">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">Page Name</div>
                            <div className="text-xs text-gray-500">Just now</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">Your post caption here...</div>
                        <div className="aspect-[1.91/1] bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                          <img src={croppedImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedPlatform.id === 'twitter-post' && (
                    <div className="max-w-md mx-auto">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">@username</div>
                            <div className="text-xs text-gray-500">1m</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">Your tweet text here...</div>
                        <div className="rounded-lg overflow-hidden">
                          <img src={croppedImage} alt="Preview" className="w-full h-auto" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedPlatform.id === 'linkedin-post' && (
                    <div className="max-w-md mx-auto">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">Your Name</div>
                            <div className="text-xs text-gray-500">Your Title • Just now</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">Your post content here...</div>
                        <div className="rounded-lg overflow-hidden">
                          <img src={croppedImage} alt="Preview" className="w-full h-auto" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Generic preview for other platforms */}
                  {!['instagram-post', 'instagram-story', 'facebook-post', 'twitter-post', 'linkedin-post'].includes(selectedPlatform.id) && (
                    <div className="max-w-md mx-auto">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                        <div className="aspect-auto bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden" style={{ aspectRatio: selectedPlatform.aspectRatio }}>
                          <img src={croppedImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-sm text-center mt-2 text-gray-700 dark:text-gray-300">
                          Preview for {selectedPlatform.name}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!selectedImage && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center justify-center min-h-[400px]">
                <Crop className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Image Selected
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                  Upload an image to start cropping and resizing it for various social media platforms.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Select Image
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📱</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Multi Platform</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Optimal sizes for all popular social media platforms
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">✂️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Smart Cropping</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Precise control over image cropping with advanced tools
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🔄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Batch Processing</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Resize one image for all platforms at once
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaResizer;