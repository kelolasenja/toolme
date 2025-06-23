import React, { useState } from 'react';
import { ArrowLeft, User, Download, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

interface Experience {
  id: string;
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  achievements: string[];
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  graduationYear: string;
  gpa: string;
}

interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    linkedIn: string;
    summary: string;
  };
  experiences: Experience[];
  education: Education[];
  skills: {
    technical: string[];
    soft: string[];
  };
  languages: string[];
  certifications: string[];
}

const CVBuilder: React.FC = () => {
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      linkedIn: '',
      summary: ''
    },
    experiences: [
      { 
        id: '1', 
        position: '', 
        company: '', 
        location: '',
        startDate: '', 
        endDate: '',
        current: false,
        achievements: ['']
      }
    ],
    education: [
      { id: '1', degree: '', institution: '', location: '', graduationYear: '', gpa: '' }
    ],
    skills: {
      technical: [''],
      soft: ['']
    },
    languages: [''],
    certifications: ['']
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const updatePersonalInfo = (field: keyof CVData['personalInfo'], value: string) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      position: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      achievements: ['']
    };
    setCvData(prev => ({
      ...prev,
      experiences: [...prev.experiences, newExp]
    }));
  };

  const removeExperience = (id: string) => {
    if (cvData.experiences.length > 1) {
      setCvData(prev => ({
        ...prev,
        experiences: prev.experiences.filter(exp => exp.id !== id)
      }));
    }
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean | string[]) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addAchievement = (expId: string) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp =>
        exp.id === expId ? { ...exp, achievements: [...exp.achievements, ''] } : exp
      )
    }));
  };

  const updateAchievement = (expId: string, index: number, value: string) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp =>
        exp.id === expId ? {
          ...exp,
          achievements: exp.achievements.map((ach, i) => i === index ? value : ach)
        } : exp
      )
    }));
  };

  const removeAchievement = (expId: string, index: number) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp =>
        exp.id === expId ? {
          ...exp,
          achievements: exp.achievements.filter((_, i) => i !== index)
        } : exp
      )
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      location: '',
      graduationYear: '',
      gpa: ''
    };
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const removeEducation = (id: string) => {
    if (cvData.education.length > 1) {
      setCvData(prev => ({
        ...prev,
        education: prev.education.filter(edu => edu.id !== id)
      }));
    }
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addSkill = (type: 'technical' | 'soft') => {
    setCvData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [type]: [...prev.skills[type], '']
      }
    }));
  };

  const updateSkill = (type: 'technical' | 'soft', index: number, value: string) => {
    setCvData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [type]: prev.skills[type].map((skill, i) => i === index ? value : skill)
      }
    }));
  };

  const removeSkill = (type: 'technical' | 'soft', index: number) => {
    if (cvData.skills[type].length > 1) {
      setCvData(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          [type]: prev.skills[type].filter((_, i) => i !== index)
        }
      }));
    }
  };

  const addLanguage = () => {
    setCvData(prev => ({
      ...prev,
      languages: [...prev.languages, '']
    }));
  };

  const updateLanguage = (index: number, value: string) => {
    setCvData(prev => ({
      ...prev,
      languages: prev.languages.map((lang, i) => i === index ? value : lang)
    }));
  };

  const removeLanguage = (index: number) => {
    if (cvData.languages.length > 1) {
      setCvData(prev => ({
        ...prev,
        languages: prev.languages.filter((_, i) => i !== index)
      }));
    }
  };

  const addCertification = () => {
    setCvData(prev => ({
      ...prev,
      certifications: [...prev.certifications, '']
    }));
  };

  const updateCertification = (index: number, value: string) => {
    setCvData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => i === index ? value : cert)
    }));
  };

  const removeCertification = (index: number) => {
    if (cvData.certifications.length > 1) {
      setCvData(prev => ({
        ...prev,
        certifications: prev.certifications.filter((_, i) => i !== index)
      }));
    }
  };

  const generatePDF = async () => {
    if (!cvData.personalInfo.fullName || !cvData.personalInfo.email) {
      alert('Mohon lengkapi nama lengkap dan email!');
      return;
    }

    setIsProcessing(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 25;

      // Header with name
      doc.setFillColor(52, 73, 94);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(cvData.personalInfo.fullName, pageWidth / 2, 25, { align: 'center' });
      
      // Contact info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const contactInfo = [
        cvData.personalInfo.email,
        cvData.personalInfo.phone,
        cvData.personalInfo.city,
        cvData.personalInfo.linkedIn
      ].filter(Boolean).join(' • ');
      
      doc.text(contactInfo, pageWidth / 2, 35, { align: 'center' });
      
      yPosition = 55;
      doc.setTextColor(0, 0, 0);

      // Professional Summary
      if (cvData.personalInfo.summary) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(52, 73, 94);
        doc.text('PROFESSIONAL SUMMARY', 20, yPosition);
        
        // Underline
        doc.setDrawColor(52, 73, 94);
        doc.line(20, yPosition + 2, 80, yPosition + 2);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const summaryLines = doc.splitTextToSize(cvData.personalInfo.summary, pageWidth - 40);
        doc.text(summaryLines, 20, yPosition);
        yPosition += summaryLines.length * 5 + 15;
      }

      // Professional Experience
      if (cvData.experiences.some(exp => exp.position)) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(52, 73, 94);
        doc.text('PROFESSIONAL EXPERIENCE', 20, yPosition);
        doc.line(20, yPosition + 2, 95, yPosition + 2);
        yPosition += 12;

        cvData.experiences.forEach((exp) => {
          if (exp.position) {
            // Check if we need a new page
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = 25;
            }

            // Position and Company
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(exp.position, 20, yPosition);
            yPosition += 6;

            if (exp.company) {
              doc.setFontSize(11);
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(52, 73, 94);
              const companyText = `${exp.company}${exp.location ? `, ${exp.location}` : ''}`;
              doc.text(companyText, 20, yPosition);
              yPosition += 5;
            }

            // Duration
            if (exp.startDate) {
              doc.setFontSize(9);
              doc.setFont('helvetica', 'italic');
              doc.setTextColor(100, 100, 100);
              const duration = exp.current 
                ? `${exp.startDate} - Present`
                : `${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ''}`;
              doc.text(duration, 20, yPosition);
              yPosition += 8;
            }

            // Achievements
            const validAchievements = exp.achievements.filter(ach => ach.trim());
            if (validAchievements.length > 0) {
              doc.setFontSize(10);
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(0, 0, 0);
              
              validAchievements.forEach((achievement) => {
                const achievementLines = doc.splitTextToSize(`• ${achievement}`, pageWidth - 50);
                doc.text(achievementLines, 25, yPosition);
                yPosition += achievementLines.length * 5;
              });
            }
            yPosition += 8;
          }
        });
      }

      // Education
      if (cvData.education.some(edu => edu.degree)) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 25;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(52, 73, 94);
        doc.text('EDUCATION', 20, yPosition);
        doc.line(20, yPosition + 2, 50, yPosition + 2);
        yPosition += 12;

        cvData.education.forEach((edu) => {
          if (edu.degree) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(edu.degree, 20, yPosition);
            yPosition += 6;

            if (edu.institution) {
              doc.setFontSize(11);
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(52, 73, 94);
              const institutionText = `${edu.institution}${edu.location ? `, ${edu.location}` : ''}`;
              doc.text(institutionText, 20, yPosition);
              yPosition += 5;
            }

            if (edu.graduationYear || edu.gpa) {
              doc.setFontSize(9);
              doc.setFont('helvetica', 'italic');
              doc.setTextColor(100, 100, 100);
              const details = [edu.graduationYear, edu.gpa ? `GPA: ${edu.gpa}` : ''].filter(Boolean).join(' • ');
              doc.text(details, 20, yPosition);
              yPosition += 5;
            }
            yPosition += 8;
          }
        });
      }

      // Skills
      const validTechnicalSkills = cvData.skills.technical.filter(skill => skill.trim());
      const validSoftSkills = cvData.skills.soft.filter(skill => skill.trim());
      
      if (validTechnicalSkills.length > 0 || validSoftSkills.length > 0) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 25;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(52, 73, 94);
        doc.text('SKILLS', 20, yPosition);
        doc.line(20, yPosition + 2, 40, yPosition + 2);
        yPosition += 12;

        if (validTechnicalSkills.length > 0) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text('Technical Skills:', 20, yPosition);
          yPosition += 6;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const techSkillsText = validTechnicalSkills.join(' • ');
          const techLines = doc.splitTextToSize(techSkillsText, pageWidth - 40);
          doc.text(techLines, 20, yPosition);
          yPosition += techLines.length * 5 + 8;
        }

        if (validSoftSkills.length > 0) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text('Soft Skills:', 20, yPosition);
          yPosition += 6;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const softSkillsText = validSoftSkills.join(' • ');
          const softLines = doc.splitTextToSize(softSkillsText, pageWidth - 40);
          doc.text(softLines, 20, yPosition);
          yPosition += softLines.length * 5 + 8;
        }
      }

      // Languages
      const validLanguages = cvData.languages.filter(lang => lang.trim());
      if (validLanguages.length > 0) {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 25;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(52, 73, 94);
        doc.text('LANGUAGES', 20, yPosition);
        doc.line(20, yPosition + 2, 55, yPosition + 2);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const languagesText = validLanguages.join(' • ');
        doc.text(languagesText, 20, yPosition);
        yPosition += 15;
      }

      // Certifications
      const validCertifications = cvData.certifications.filter(cert => cert.trim());
      if (validCertifications.length > 0) {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 25;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(52, 73, 94);
        doc.text('CERTIFICATIONS', 20, yPosition);
        doc.line(20, yPosition + 2, 70, yPosition + 2);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        validCertifications.forEach((cert) => {
          doc.text(`• ${cert}`, 20, yPosition);
          yPosition += 6;
        });
      }

      // Save PDF
      const pdfBlob = doc.output('blob');
      const fileName = cvData.personalInfo.fullName 
        ? `CV-${cvData.personalInfo.fullName.replace(/\s+/g, '-')}.pdf`
        : 'CV-Professional.pdf';
      saveAs(pdfBlob, fileName);

    } catch (error) {
      console.error('Error generating CV PDF:', error);
      alert('Terjadi kesalahan saat membuat CV PDF.');
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-4">
            <User className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pembuat CV/Resume Profesional
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Buat CV/Resume profesional yang ATS-friendly dengan format standar industri.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-3">
            Fitur CV Profesional & ATS-Friendly:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-200">
            <li>Format standar industri yang mudah dibaca oleh sistem ATS</li>
            <li>Layout profesional dengan hierarki informasi yang jelas</li>
            <li>Section lengkap: Summary, Experience, Education, Skills, dll</li>
            <li>Bullet points untuk achievements yang terukur</li>
            <li>Font dan spacing yang optimal untuk readability</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informasi Pribadi *
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nama Lengkap *"
                  value={cvData.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="email"
                    placeholder="Email *"
                    value={cvData.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <input
                    type="tel"
                    placeholder="Nomor Telepon"
                    value={cvData.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Alamat"
                    value={cvData.personalInfo.address}
                    onChange={(e) => updatePersonalInfo('address', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Kota"
                    value={cvData.personalInfo.city}
                    onChange={(e) => updatePersonalInfo('city', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <input
                  type="text"
                  placeholder="LinkedIn Profile URL"
                  value={cvData.personalInfo.linkedIn}
                  onChange={(e) => updatePersonalInfo('linkedIn', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <textarea
                  placeholder="Professional Summary (2-3 kalimat yang menggambarkan keahlian dan pengalaman Anda)"
                  value={cvData.personalInfo.summary}
                  onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pengalaman Kerja
                </h3>
                <button
                  onClick={addExperience}
                  className="flex items-center space-x-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                </button>
              </div>

              <div className="space-y-6">
                {cvData.experiences.map((exp, index) => (
                  <div key={exp.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Pengalaman #{index + 1}
                      </span>
                      <button
                        onClick={() => removeExperience(exp.id)}
                        disabled={cvData.experiences.length === 1}
                        className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Posisi/Jabatan"
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Nama Perusahaan"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Lokasi (Kota, Negara)"
                          value={exp.location}
                          onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="month"
                          placeholder="Mulai"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="month"
                            placeholder="Selesai"
                            value={exp.endDate}
                            onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                            disabled={exp.current}
                            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                          />
                          <label className="flex items-center space-x-1">
                            <input
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Saat ini</span>
                          </label>
                        </div>
                      </div>
                      
                      {/* Achievements */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Pencapaian & Tanggung Jawab
                          </label>
                          <button
                            onClick={() => addAchievement(exp.id)}
                            className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded"
                          >
                            + Tambah
                          </button>
                        </div>
                        {exp.achievements.map((achievement, achIndex) => (
                          <div key={achIndex} className="flex items-center space-x-2 mb-2">
                            <input
                              type="text"
                              placeholder="Contoh: Meningkatkan penjualan sebesar 25% dalam 6 bulan"
                              value={achievement}
                              onChange={(e) => updateAchievement(exp.id, achIndex, e.target.value)}
                              className="flex-1 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            />
                            <button
                              onClick={() => removeAchievement(exp.id, achIndex)}
                              disabled={exp.achievements.length === 1}
                              className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pendidikan
                </h3>
                <button
                  onClick={addEducation}
                  className="flex items-center space-x-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                </button>
              </div>

              <div className="space-y-4">
                {cvData.education.map((edu, index) => (
                  <div key={edu.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Pendidikan #{index + 1}
                      </span>
                      <button
                        onClick={() => removeEducation(edu.id)}
                        disabled={cvData.education.length === 1}
                        className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Gelar/Program Studi"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Nama Institusi"
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Lokasi"
                          value={edu.location}
                          onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Tahun Lulus (contoh: 2022)"
                          value={edu.graduationYear}
                          onChange={(e) => updateEducation(edu.id, 'graduationYear', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="IPK (opsional)"
                          value={edu.gpa}
                          onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skills & Additional Info Section */}
          <div className="space-y-6">
            {/* Skills */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Keahlian
              </h3>

              {/* Technical Skills */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Technical Skills
                  </label>
                  <button
                    onClick={() => addSkill('technical')}
                    className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded"
                  >
                    + Tambah
                  </button>
                </div>
                <div className="space-y-2">
                  {cvData.skills.technical.map((skill, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Contoh: JavaScript, Python, React"
                        value={skill}
                        onChange={(e) => updateSkill('technical', index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      <button
                        onClick={() => removeSkill('technical', index)}
                        disabled={cvData.skills.technical.length === 1}
                        className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Soft Skills */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Soft Skills
                  </label>
                  <button
                    onClick={() => addSkill('soft')}
                    className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded"
                  >
                    + Tambah
                  </button>
                </div>
                <div className="space-y-2">
                  {cvData.skills.soft.map((skill, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Contoh: Leadership, Communication, Problem Solving"
                        value={skill}
                        onChange={(e) => updateSkill('soft', index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      <button
                        onClick={() => removeSkill('soft', index)}
                        disabled={cvData.skills.soft.length === 1}
                        className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Bahasa
                </h3>
                <button
                  onClick={addLanguage}
                  className="flex items-center space-x-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                </button>
              </div>

              <div className="space-y-3">
                {cvData.languages.map((language, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Contoh: Bahasa Indonesia (Native), English (Fluent)"
                      value={language}
                      onChange={(e) => updateLanguage(index, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <button
                      onClick={() => removeLanguage(index)}
                      disabled={cvData.languages.length === 1}
                      className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sertifikasi
                </h3>
                <button
                  onClick={addCertification}
                  className="flex items-center space-x-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                </button>
              </div>

              <div className="space-y-3">
                {cvData.certifications.map((certification, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Contoh: AWS Certified Solutions Architect (2023)"
                      value={certification}
                      onChange={(e) => updateCertification(index, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <button
                      onClick={() => removeCertification(index)}
                      disabled={cvData.certifications.length === 1}
                      className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generatePDF}
              disabled={isProcessing}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Membuat CV...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Unduh CV Profesional PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ATS Tips */}
        <div className="mt-12 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-4">
            Tips CV ATS-Friendly & Profesional:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Format & Layout:</h4>
              <ul className="space-y-1 text-amber-700 dark:text-amber-300 text-sm">
                <li>• Gunakan font standar (Arial, Helvetica, Times New Roman)</li>
                <li>• Hindari tabel, kolom, atau elemen grafis kompleks</li>
                <li>• Gunakan bullet points untuk daftar</li>
                <li>• Simpan dalam format PDF untuk menjaga formatting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Konten:</h4>
              <ul className="space-y-1 text-amber-700 dark:text-amber-300 text-sm">
                <li>• Gunakan keywords yang relevan dengan posisi</li>
                <li>• Tulis pencapaian dengan angka yang terukur</li>
                <li>• Gunakan action verbs (Managed, Developed, Increased)</li>
                <li>• Sesuaikan CV dengan job description</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVBuilder;