import React, { useState, useEffect } from 'react';
import { ArrowLeft, Tag, Copy, Code, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MetaTagData {
  title: string;
  description: string;
  keywords: string;
  author: string;
  canonicalUrl: string;
  robots: string;
  viewport: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterSite: string;
  twitterCreator: string;
  themeColor: string;
}

const MetaTagGenerator: React.FC = () => {
  const [metaData, setMetaData] = useState<MetaTagData>({
    title: '',
    description: '',
    keywords: '',
    author: '',
    canonicalUrl: '',
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1.0',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogUrl: '',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    twitterSite: '',
    twitterCreator: '',
    themeColor: '#ffffff'
  });
  
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'opengraph' | 'twitter' | 'advanced'>('basic');
  
  // Update meta data
  const updateMetaData = (key: keyof MetaTagData, value: string) => {
    setMetaData(prev => ({ ...prev, [key]: value }));
  };
  
  // Sync OG and Twitter data with basic meta data
  useEffect(() => {
    if (!metaData.ogTitle) {
      updateMetaData('ogTitle', metaData.title);
    }
    if (!metaData.ogDescription) {
      updateMetaData('ogDescription', metaData.description);
    }
    if (!metaData.ogUrl) {
      updateMetaData('ogUrl', metaData.canonicalUrl);
    }
    if (!metaData.twitterTitle) {
      updateMetaData('twitterTitle', metaData.title);
    }
    if (!metaData.twitterDescription) {
      updateMetaData('twitterDescription', metaData.description);
    }
  }, [metaData.title, metaData.description, metaData.canonicalUrl]);
  
  // Generate meta tags
  const generateMetaTags = () => {
    let code = '';
    
    // Basic meta tags
    if (metaData.title) {
      code += `<title>${metaData.title}</title>\n`;
      code += `<meta name="title" content="${metaData.title}">\n`;
    }
    
    if (metaData.description) {
      code += `<meta name="description" content="${metaData.description}">\n`;
    }
    
    if (metaData.keywords) {
      code += `<meta name="keywords" content="${metaData.keywords}">\n`;
    }
    
    if (metaData.author) {
      code += `<meta name="author" content="${metaData.author}">\n`;
    }
    
    if (metaData.canonicalUrl) {
      code += `<link rel="canonical" href="${metaData.canonicalUrl}">\n`;
    }
    
    if (metaData.robots) {
      code += `<meta name="robots" content="${metaData.robots}">\n`;
    }
    
    if (metaData.viewport) {
      code += `<meta name="viewport" content="${metaData.viewport}">\n`;
    }
    
    // Open Graph meta tags
    if (metaData.ogTitle || metaData.ogDescription || metaData.ogImage || metaData.ogUrl) {
      code += '\n<!-- Open Graph / Facebook -->\n';
      
      if (metaData.ogType) {
        code += `<meta property="og:type" content="${metaData.ogType}">\n`;
      }
      
      if (metaData.ogUrl) {
        code += `<meta property="og:url" content="${metaData.ogUrl}">\n`;
      }
      
      if (metaData.ogTitle) {
        code += `<meta property="og:title" content="${metaData.ogTitle}">\n`;
      }
      
      if (metaData.ogDescription) {
        code += `<meta property="og:description" content="${metaData.ogDescription}">\n`;
      }
      
      if (metaData.ogImage) {
        code += `<meta property="og:image" content="${metaData.ogImage}">\n`;
      }
    }
    
    // Twitter meta tags
    if (metaData.twitterTitle || metaData.twitterDescription || metaData.twitterImage) {
      code += '\n<!-- Twitter -->\n';
      
      if (metaData.twitterCard) {
        code += `<meta property="twitter:card" content="${metaData.twitterCard}">\n`;
      }
      
      if (metaData.ogUrl) {
        code += `<meta property="twitter:url" content="${metaData.ogUrl}">\n`;
      }
      
      if (metaData.twitterTitle) {
        code += `<meta property="twitter:title" content="${metaData.twitterTitle}">\n`;
      }
      
      if (metaData.twitterDescription) {
        code += `<meta property="twitter:description" content="${metaData.twitterDescription}">\n`;
      }
      
      if (metaData.twitterImage) {
        code += `<meta property="twitter:image" content="${metaData.twitterImage}">\n`;
      }
      
      if (metaData.twitterSite) {
        code += `<meta property="twitter:site" content="${metaData.twitterSite}">\n`;
      }
      
      if (metaData.twitterCreator) {
        code += `<meta property="twitter:creator" content="${metaData.twitterCreator}">\n`;
      }
    }
    
    // Theme color
    if (metaData.themeColor) {
      code += `\n<meta name="theme-color" content="${metaData.themeColor}">\n`;
    }
    
    setGeneratedCode(code);
  };
  
  // Generate meta tags when meta data changes
  useEffect(() => {
    generateMetaTags();
  }, [metaData]);
  
  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Tools
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center">
              <Tag className="w-8 h-8 text-white mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-white">Meta Tag Generator</h1>
                <p className="text-blue-100 mt-1">Generate properly formatted meta tags for SEO and social sharing</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                onClick={() => setActiveTab('basic')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'basic'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Basic SEO
              </button>
              <button
                onClick={() => setActiveTab('opengraph')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'opengraph'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Open Graph
              </button>
              <button
                onClick={() => setActiveTab('twitter')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'twitter'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Twitter Cards
              </button>
              <button
                onClick={() => setActiveTab('advanced')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'advanced'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Advanced
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <div>
                {/* Basic SEO Fields */}
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Page Title *
                      </label>
                      <input
                        type="text"
                        value={metaData.title}
                        onChange={(e) => updateMetaData('title', e.target.value)}
                        placeholder="Enter your page title (50-60 characters)"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {metaData.title.length}/60 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Meta Description *
                      </label>
                      <textarea
                        value={metaData.description}
                        onChange={(e) => updateMetaData('description', e.target.value)}
                        placeholder="Enter a description (150-160 characters)"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {metaData.description.length}/160 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Keywords
                      </label>
                      <input
                        type="text"
                        value={metaData.keywords}
                        onChange={(e) => updateMetaData('keywords', e.target.value)}
                        placeholder="keyword1, keyword2, keyword3"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Separate keywords with commas
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Canonical URL
                      </label>
                      <input
                        type="url"
                        value={metaData.canonicalUrl}
                        onChange={(e) => updateMetaData('canonicalUrl', e.target.value)}
                        placeholder="https://www.example.com/page"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Author
                      </label>
                      <input
                        type="text"
                        value={metaData.author}
                        onChange={(e) => updateMetaData('author', e.target.value)}
                        placeholder="Author name"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Open Graph Fields */}
                {activeTab === 'opengraph' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        OG Title
                      </label>
                      <input
                        type="text"
                        value={metaData.ogTitle}
                        onChange={(e) => updateMetaData('ogTitle', e.target.value)}
                        placeholder="Open Graph title (same as page title if empty)"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        OG Description
                      </label>
                      <textarea
                        value={metaData.ogDescription}
                        onChange={(e) => updateMetaData('ogDescription', e.target.value)}
                        placeholder="Open Graph description (same as meta description if empty)"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        OG Image URL
                      </label>
                      <input
                        type="url"
                        value={metaData.ogImage}
                        onChange={(e) => updateMetaData('ogImage', e.target.value)}
                        placeholder="https://www.example.com/image.jpg"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Recommended size: 1200 x 630 pixels
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        OG URL
                      </label>
                      <input
                        type="url"
                        value={metaData.ogUrl}
                        onChange={(e) => updateMetaData('ogUrl', e.target.value)}
                        placeholder="https://www.example.com/page"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        OG Type
                      </label>
                      <select
                        value={metaData.ogType}
                        onChange={(e) => updateMetaData('ogType', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="website">Website</option>
                        <option value="article">Article</option>
                        <option value="product">Product</option>
                        <option value="profile">Profile</option>
                        <option value="book">Book</option>
                        <option value="video">Video</option>
                        <option value="music">Music</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Twitter Card Fields */}
                {activeTab === 'twitter' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Twitter Card Type
                      </label>
                      <select
                        value={metaData.twitterCard}
                        onChange={(e) => updateMetaData('twitterCard', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="summary">Summary</option>
                        <option value="summary_large_image">Summary with Large Image</option>
                        <option value="app">App</option>
                        <option value="player">Player</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Twitter Title
                      </label>
                      <input
                        type="text"
                        value={metaData.twitterTitle}
                        onChange={(e) => updateMetaData('twitterTitle', e.target.value)}
                        placeholder="Twitter title (same as page title if empty)"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Twitter Description
                      </label>
                      <textarea
                        value={metaData.twitterDescription}
                        onChange={(e) => updateMetaData('twitterDescription', e.target.value)}
                        placeholder="Twitter description (same as meta description if empty)"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Twitter Image URL
                      </label>
                      <input
                        type="url"
                        value={metaData.twitterImage}
                        onChange={(e) => updateMetaData('twitterImage', e.target.value)}
                        placeholder="https://www.example.com/image.jpg"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Twitter @username
                      </label>
                      <input
                        type="text"
                        value={metaData.twitterSite}
                        onChange={(e) => updateMetaData('twitterSite', e.target.value)}
                        placeholder="@yourusername"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Content Creator @username
                      </label>
                      <input
                        type="text"
                        value={metaData.twitterCreator}
                        onChange={(e) => updateMetaData('twitterCreator', e.target.value)}
                        placeholder="@contentcreator"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Advanced Fields */}
                {activeTab === 'advanced' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Robots
                      </label>
                      <select
                        value={metaData.robots}
                        onChange={(e) => updateMetaData('robots', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="index, follow">index, follow</option>
                        <option value="index, nofollow">index, nofollow</option>
                        <option value="noindex, follow">noindex, follow</option>
                        <option value="noindex, nofollow">noindex, nofollow</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Viewport
                      </label>
                      <input
                        type="text"
                        value={metaData.viewport}
                        onChange={(e) => updateMetaData('viewport', e.target.value)}
                        placeholder="width=device-width, initial-scale=1.0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Theme Color
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={metaData.themeColor}
                          onChange={(e) => updateMetaData('themeColor', e.target.value)}
                          className="h-10 w-10 border border-gray-300 dark:border-gray-600 rounded"
                        />
                        <input
                          type="text"
                          value={metaData.themeColor}
                          onChange={(e) => updateMetaData('themeColor', e.target.value)}
                          placeholder="#ffffff"
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Generated Code */}
              <div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Generated Meta Tags
                    </h3>
                    <button
                      onClick={copyToClipboard}
                      className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-auto max-h-96">
                    <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {generatedCode || 'Enter your meta tag information to generate code'}
                    </pre>
                  </div>
                </div>
                
                {/* Preview */}
                {metaData.title && metaData.description && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Search Preview
                    </h3>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="text-blue-600 dark:text-blue-400 text-lg font-medium mb-1 truncate">
                        {metaData.title}
                      </div>
                      <div className="text-green-600 dark:text-green-400 text-sm mb-1 truncate">
                        {metaData.canonicalUrl || 'https://www.example.com/page'}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {metaData.description}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copied ? 'Copied!' : 'Copy All'}</span>
                  </button>
                  
                  <a 
                    href="https://developers.facebook.com/tools/debug/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Test on Facebook</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Why Meta Tags Matter
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="text-blue-600 dark:text-blue-400 text-xl mb-4">🔍</div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Better SEO
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Properly formatted meta tags help search engines understand your content, improving your visibility in search results.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="text-blue-600 dark:text-blue-400 text-xl mb-4">📱</div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Social Sharing
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Open Graph and Twitter Card tags create rich, engaging previews when your content is shared on social media.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="text-blue-600 dark:text-blue-400 text-xl mb-4">📈</div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Higher CTR
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Compelling titles and descriptions in your meta tags can significantly improve click-through rates from search results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaTagGenerator;