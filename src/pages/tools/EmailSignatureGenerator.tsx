import React, { useState } from 'react';
import { ArrowLeft, Mail, Copy, Eye, Download, User, Phone, Globe, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SignatureData {
  fullName: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  linkedIn: string;
  twitter: string;
  instagram: string;
  facebook: string;
}

interface DesignSettings {
  template: 'modern' | 'classic' | 'minimal' | 'corporate';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  includePhoto: boolean;
  photoUrl: string;
  includeCompanyLogo: boolean;
  logoUrl: string;
}

const EmailSignatureGenerator: React.FC = () => {
  const [signatureData, setSignatureData] = useState<SignatureData>({
    fullName: '',
    jobTitle: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    linkedIn: '',
    twitter: '',
    instagram: '',
    facebook: ''
  });

  const [designSettings, setDesignSettings] = useState<DesignSettings>({
    template: 'modern',
    primaryColor: '#2563eb',
    fontSize: 'medium',
    includePhoto: false,
    photoUrl: '',
    includeCompanyLogo: false,
    logoUrl: ''
  });

  const [previewMode, setPreviewMode] = useState<'html' | 'visual'>('visual');

  const updateSignatureData = (field: keyof SignatureData, value: string) => {
    setSignatureData(prev => ({ ...prev, [field]: value }));
  };

  const updateDesignSettings = (field: keyof DesignSettings, value: any) => {
    setDesignSettings(prev => ({ ...prev, [field]: value }));
  };

  const generateHTMLSignature = (): string => {
    const { template, primaryColor, fontSize, includePhoto, photoUrl, includeCompanyLogo, logoUrl } = designSettings;
    const { fullName, jobTitle, company, email, phone, website, address, linkedIn, twitter, instagram, facebook } = signatureData;

    const fontSizes = {
      small: { name: '14px', title: '12px', contact: '11px' },
      medium: { name: '16px', title: '13px', contact: '12px' },
      large: { name: '18px', title: '14px', contact: '13px' }
    };

    const currentFontSize = fontSizes[fontSize];

    // Social media icons (using Unicode symbols for simplicity)
    const socialIcons = {
      linkedIn: '🔗',
      twitter: '🐦',
      instagram: '📷',
      facebook: '📘'
    };

    let signatureHTML = '';

    if (template === 'modern') {
      signatureHTML = `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; line-height: 1.4; color: #333;">
  <tr>
    ${includePhoto && photoUrl ? `
    <td style="padding-right: 20px; vertical-align: top;">
      <img src="${photoUrl}" alt="${fullName}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">
    </td>
    ` : ''}
    <td style="vertical-align: top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-bottom: 5px;">
            <span style="font-size: ${currentFontSize.name}; font-weight: bold; color: ${primaryColor};">${fullName}</span>
          </td>
        </tr>
        ${jobTitle ? `
        <tr>
          <td style="padding-bottom: 2px;">
            <span style="font-size: ${currentFontSize.title}; color: #666;">${jobTitle}</span>
          </td>
        </tr>
        ` : ''}
        ${company ? `
        <tr>
          <td style="padding-bottom: 10px;">
            <span style="font-size: ${currentFontSize.title}; font-weight: bold; color: #333;">${company}</span>
          </td>
        </tr>
        ` : ''}
        <tr>
          <td style="border-top: 2px solid ${primaryColor}; padding-top: 10px;">
            <table cellpadding="0" cellspacing="0" border="0">
              ${email ? `
              <tr>
                <td style="padding-bottom: 3px;">
                  <span style="font-size: ${currentFontSize.contact}; color: #666;">📧 </span>
                  <a href="mailto:${email}" style="font-size: ${currentFontSize.contact}; color: ${primaryColor}; text-decoration: none;">${email}</a>
                </td>
              </tr>
              ` : ''}
              ${phone ? `
              <tr>
                <td style="padding-bottom: 3px;">
                  <span style="font-size: ${currentFontSize.contact}; color: #666;">📞 </span>
                  <a href="tel:${phone}" style="font-size: ${currentFontSize.contact}; color: ${primaryColor}; text-decoration: none;">${phone}</a>
                </td>
              </tr>
              ` : ''}
              ${website ? `
              <tr>
                <td style="padding-bottom: 3px;">
                  <span style="font-size: ${currentFontSize.contact}; color: #666;">🌐 </span>
                  <a href="${website}" style="font-size: ${currentFontSize.contact}; color: ${primaryColor}; text-decoration: none;">${website}</a>
                </td>
              </tr>
              ` : ''}
              ${address ? `
              <tr>
                <td style="padding-bottom: 8px;">
                  <span style="font-size: ${currentFontSize.contact}; color: #666;">📍 ${address}</span>
                </td>
              </tr>
              ` : ''}
            </table>
          </td>
        </tr>
        ${(linkedIn || twitter || instagram || facebook) ? `
        <tr>
          <td style="padding-top: 5px;">
            ${linkedIn ? `<a href="${linkedIn}" style="text-decoration: none; margin-right: 8px;">${socialIcons.linkedIn}</a>` : ''}
            ${twitter ? `<a href="${twitter}" style="text-decoration: none; margin-right: 8px;">${socialIcons.twitter}</a>` : ''}
            ${instagram ? `<a href="${instagram}" style="text-decoration: none; margin-right: 8px;">${socialIcons.instagram}</a>` : ''}
            ${facebook ? `<a href="${facebook}" style="text-decoration: none; margin-right: 8px;">${socialIcons.facebook}</a>` : ''}
          </td>
        </tr>
        ` : ''}
      </table>
    </td>
    ${includeCompanyLogo && logoUrl ? `
    <td style="padding-left: 20px; vertical-align: top;">
      <img src="${logoUrl}" alt="${company} Logo" style="max-width: 120px; max-height: 60px;">
    </td>
    ` : ''}
  </tr>
</table>`;
    } else if (template === 'classic') {
      signatureHTML = `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Times New Roman', serif; line-height: 1.5; color: #333;">
  <tr>
    <td>
      <div style="border: 1px solid #ccc; padding: 15px; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 10px;">
          <span style="font-size: ${currentFontSize.name}; font-weight: bold; color: ${primaryColor};">${fullName}</span>
          ${jobTitle ? `<br><span style="font-size: ${currentFontSize.title}; font-style: italic;">${jobTitle}</span>` : ''}
          ${company ? `<br><span style="font-size: ${currentFontSize.title}; font-weight: bold;">${company}</span>` : ''}
        </div>
        <hr style="border: none; border-top: 1px solid ${primaryColor}; margin: 10px 0;">
        <div style="text-align: center;">
          ${email ? `<div style="margin: 3px 0;"><a href="mailto:${email}" style="color: ${primaryColor}; text-decoration: none;">${email}</a></div>` : ''}
          ${phone ? `<div style="margin: 3px 0;">${phone}</div>` : ''}
          ${website ? `<div style="margin: 3px 0;"><a href="${website}" style="color: ${primaryColor}; text-decoration: none;">${website}</a></div>` : ''}
          ${address ? `<div style="margin: 3px 0; font-size: ${currentFontSize.contact};">${address}</div>` : ''}
        </div>
      </div>
    </td>
  </tr>
</table>`;
    } else if (template === 'minimal') {
      signatureHTML = `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="font-size: ${currentFontSize.name}; font-weight: 300; margin-bottom: 5px;">${fullName}</div>
  ${jobTitle ? `<div style="font-size: ${currentFontSize.title}; color: #666; margin-bottom: 2px;">${jobTitle}</div>` : ''}
  ${company ? `<div style="font-size: ${currentFontSize.title}; color: ${primaryColor}; margin-bottom: 8px;">${company}</div>` : ''}
  <div style="font-size: ${currentFontSize.contact}; color: #666;">
    ${email ? `<a href="mailto:${email}" style="color: ${primaryColor}; text-decoration: none;">${email}</a>` : ''}
    ${phone && email ? ' • ' : ''}${phone ? `<a href="tel:${phone}" style="color: ${primaryColor}; text-decoration: none;">${phone}</a>` : ''}
    ${website && (email || phone) ? ' • ' : ''}${website ? `<a href="${website}" style="color: ${primaryColor}; text-decoration: none;">${website.replace(/^https?:\/\//, '')}</a>` : ''}
  </div>
</div>`;
    } else if (template === 'corporate') {
      signatureHTML = `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; line-height: 1.4;">
  <tr>
    <td style="background-color: ${primaryColor}; padding: 15px; color: white;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td>
            <div style="font-size: ${currentFontSize.name}; font-weight: bold; margin-bottom: 5px;">${fullName}</div>
            ${jobTitle ? `<div style="font-size: ${currentFontSize.title}; opacity: 0.9;">${jobTitle}</div>` : ''}
            ${company ? `<div style="font-size: ${currentFontSize.title}; font-weight: bold; margin-top: 5px;">${company}</div>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 15px; border-left: 3px solid ${primaryColor};">
      <table cellpadding="0" cellspacing="0" border="0">
        ${email ? `
        <tr>
          <td style="padding-bottom: 3px;">
            <a href="mailto:${email}" style="font-size: ${currentFontSize.contact}; color: ${primaryColor}; text-decoration: none;">${email}</a>
          </td>
        </tr>
        ` : ''}
        ${phone ? `
        <tr>
          <td style="padding-bottom: 3px;">
            <span style="font-size: ${currentFontSize.contact}; color: #666;">${phone}</span>
          </td>
        </tr>
        ` : ''}
        ${website ? `
        <tr>
          <td style="padding-bottom: 3px;">
            <a href="${website}" style="font-size: ${currentFontSize.contact}; color: ${primaryColor}; text-decoration: none;">${website}</a>
          </td>
        </tr>
        ` : ''}
        ${address ? `
        <tr>
          <td>
            <span style="font-size: ${currentFontSize.contact}; color: #666;">${address}</span>
          </td>
        </tr>
        ` : ''}
      </table>
    </td>
  </tr>
</table>`;
    }

    return signatureHTML.trim();
  };

  const copyHTMLToClipboard = async () => {
    const htmlSignature = generateHTMLSignature();
    
    try {
      await navigator.clipboard.writeText(htmlSignature);
      alert('Kode HTML tanda tangan berhasil disalin ke clipboard!');
    } catch (error) {
      console.error('Gagal menyalin:', error);
      
      // Fallback: create textarea and copy
      const textarea = document.createElement('textarea');
      textarea.value = htmlSignature;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
      alert('Kode HTML tanda tangan berhasil disalin ke clipboard!');
    }
  };

  const downloadHTML = () => {
    const htmlSignature = generateHTMLSignature();
    const fullHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Email Signature</title>
</head>
<body>
${htmlSignature}
</body>
</html>`;
    
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'email-signature.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isFormValid = signatureData.fullName.trim() && signatureData.email.trim();

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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-4">
            <Mail className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Generator Tanda Tangan Email
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Buat tanda tangan email HTML yang profesional dengan berbagai template dan kustomisasi lengkap.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">
            Cara Menggunakan:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-orange-800 dark:text-orange-200">
            <li>Isi informasi pribadi dan kontak Anda</li>
            <li>Pilih template dan sesuaikan desain</li>
            <li>Preview hasil tanda tangan</li>
            <li>Salin kode HTML dan paste ke email client Anda</li>
            <li>Atau unduh file HTML untuk digunakan nanti</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Informasi Pribadi</span>
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nama Lengkap *"
                    value={signatureData.fullName}
                    onChange={(e) => updateSignatureData('fullName', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Jabatan"
                    value={signatureData.jobTitle}
                    onChange={(e) => updateSignatureData('jobTitle', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <input
                  type="text"
                  placeholder="Nama Perusahaan"
                  value={signatureData.company}
                  onChange={(e) => updateSignatureData('company', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Informasi Kontak</span>
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="email"
                    placeholder="Email *"
                    value={signatureData.email}
                    onChange={(e) => updateSignatureData('email', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <input
                    type="tel"
                    placeholder="Nomor Telepon"
                    value={signatureData.phone}
                    onChange={(e) => updateSignatureData('phone', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="url"
                    placeholder="Website"
                    value={signatureData.website}
                    onChange={(e) => updateSignatureData('website', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Alamat"
                    value={signatureData.address}
                    onChange={(e) => updateSignatureData('address', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Media Sosial</span>
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="url"
                    placeholder="LinkedIn URL"
                    value={signatureData.linkedIn}
                    onChange={(e) => updateSignatureData('linkedIn', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <input
                    type="url"
                    placeholder="Twitter URL"
                    value={signatureData.twitter}
                    onChange={(e) => updateSignatureData('twitter', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="url"
                    placeholder="Instagram URL"
                    value={signatureData.instagram}
                    onChange={(e) => updateSignatureData('instagram', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <input
                    type="url"
                    placeholder="Facebook URL"
                    value={signatureData.facebook}
                    onChange={(e) => updateSignatureData('facebook', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Design Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pengaturan Desain
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Template
                  </label>
                  <select
                    value={designSettings.template}
                    onChange={(e) => updateDesignSettings('template', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="minimal">Minimal</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Warna Utama
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={designSettings.primaryColor}
                        onChange={(e) => updateDesignSettings('primaryColor', e.target.value)}
                        className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={designSettings.primaryColor}
                        onChange={(e) => updateDesignSettings('primaryColor', e.target.value)}
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ukuran Font
                    </label>
                    <select
                      value={designSettings.fontSize}
                      onChange={(e) => updateDesignSettings('fontSize', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="small">Kecil</option>
                      <option value="medium">Sedang</option>
                      <option value="large">Besar</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            {/* Preview Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Preview Tanda Tangan</span>
                </h3>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPreviewMode('visual')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      previewMode === 'visual'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Visual
                  </button>
                  <button
                    onClick={() => setPreviewMode('html')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      previewMode === 'html'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    HTML
                  </button>
                </div>
              </div>

              {/* Preview Content */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700 min-h-[300px]">
                {previewMode === 'visual' ? (
                  isFormValid ? (
                    <div dangerouslySetInnerHTML={{ __html: generateHTMLSignature() }} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Isi nama dan email untuk melihat preview</p>
                      </div>
                    </div>
                  )
                ) : (
                  <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-auto max-h-[400px]">
                    {isFormValid ? generateHTMLSignature() : 'Isi nama dan email untuk melihat kode HTML'}
                  </pre>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Unduh & Salin
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={copyHTMLToClipboard}
                  disabled={!isFormValid}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Copy className="w-5 h-5" />
                  <span>Salin Kode HTML</span>
                </button>
                
                <button
                  onClick={downloadHTML}
                  disabled={!isFormValid}
                  className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 dark:text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Unduh File HTML</span>
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-700 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Cara Menggunakan di Email Client:
              </h3>
              
              <div className="space-y-3 text-sm text-orange-800 dark:text-orange-200">
                <div>
                  <strong>Gmail:</strong> Settings → General → Signature → Paste HTML
                </div>
                <div>
                  <strong>Outlook:</strong> File → Options → Mail → Signatures → New → Paste HTML
                </div>
                <div>
                  <strong>Apple Mail:</strong> Preferences → Signatures → Create signature → Paste HTML
                </div>
                <div>
                  <strong>Thunderbird:</strong> Account Settings → Signature → Use HTML → Paste HTML
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🎨</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">4 Template</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Modern, Classic, Minimal, dan Corporate untuk berbagai kebutuhan
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📱</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Responsive</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Tampil sempurna di desktop, mobile, dan semua email client
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🔗</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Social Media</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Integrasi dengan LinkedIn, Twitter, Instagram, dan Facebook
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Instant</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Preview real-time dan copy-paste langsung ke email client
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSignatureGenerator;