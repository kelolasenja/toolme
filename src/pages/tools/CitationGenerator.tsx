import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SourceData {
  type: string;
  title: string;
  authors: string;
  year: string;
  publisher: string;
  location: string;
  journal: string;
  volume: string;
  issue: string;
  pages: string;
  url: string;
  accessDate: string;
  doi: string;
  website: string;
  newspaper: string;
  edition: string;
  translator: string;
  editor: string;
  chapter: string;
  institution: string;
  department: string;
  university: string;
  conferenceTitle: string;
  conferenceLocation: string;
  conferenceDate: string;
}

interface CitationResult {
  apa: string;
  mla: string;
  chicago: string;
  harvard: string;
  ieee: string;
}

const CitationGenerator: React.FC = () => {
  const [sourceType, setSourceType] = useState('book');
  const [citationStyle, setCitationStyle] = useState('apa');
  const [sourceData, setSourceData] = useState<SourceData>({
    type: 'book',
    title: '',
    authors: '',
    year: '',
    publisher: '',
    location: '',
    journal: '',
    volume: '',
    issue: '',
    pages: '',
    url: '',
    accessDate: '',
    doi: '',
    website: '',
    newspaper: '',
    edition: '',
    translator: '',
    editor: '',
    chapter: '',
    institution: '',
    department: '',
    university: '',
    conferenceTitle: '',
    conferenceLocation: '',
    conferenceDate: ''
  });
  const [citation, setCitation] = useState<CitationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sourceTypes = [
    { value: 'book', label: 'Book' },
    { value: 'journal', label: 'Journal Article' },
    { value: 'website', label: 'Website' },
    { value: 'newspaper', label: 'Newspaper Article' },
    { value: 'magazine', label: 'Magazine Article' },
    { value: 'thesis', label: 'Thesis/Dissertation' },
    { value: 'conference', label: 'Conference Paper' },
    { value: 'report', label: 'Report' }
  ];

  const citationStyles = [
    { value: 'apa', label: 'APA (7th Edition)' },
    { value: 'mla', label: 'MLA (9th Edition)' },
    { value: 'chicago', label: 'Chicago (17th Edition)' },
    { value: 'harvard', label: 'Harvard' },
    { value: 'ieee', label: 'IEEE' }
  ];

  const handleInputChange = (field: keyof SourceData, value: string) => {
    setSourceData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const formatAuthors = (authors: string, style: string): string => {
    if (!authors) return '';
    
    const authorList = authors.split(',').map(author => author.trim());
    
    switch (style) {
      case 'apa':
        if (authorList.length === 1) {
          // Last, F. I.
          const parts = authorList[0].split(' ');
          const lastName = parts[0];
          const initials = parts.slice(1).map(name => `${name.charAt(0)}.`).join(' ');
          return `${lastName}, ${initials}`;
        } else if (authorList.length === 2) {
          // Last1, F. I., & Last2, F. I.
          const formattedAuthors = authorList.map(author => {
            const parts = author.split(' ');
            const lastName = parts[0];
            const initials = parts.slice(1).map(name => `${name.charAt(0)}.`).join(' ');
            return `${lastName}, ${initials}`;
          });
          return `${formattedAuthors[0]} & ${formattedAuthors[1]}`;
        } else if (authorList.length <= 7) {
          // Last1, F. I., Last2, F. I., Last3, F. I., ... & LastN, F. I.
          const formattedAuthors = authorList.map(author => {
            const parts = author.split(' ');
            const lastName = parts[0];
            const initials = parts.slice(1).map(name => `${name.charAt(0)}.`).join(' ');
            return `${lastName}, ${initials}`;
          });
          const lastAuthor = formattedAuthors.pop();
          return `${formattedAuthors.join(', ')}, & ${lastAuthor}`;
        } else {
          // Last1, F. I., Last2, F. I., Last3, F. I., ... Last6, F. I., et al.
          const formattedAuthors = authorList.slice(0, 6).map(author => {
            const parts = author.split(' ');
            const lastName = parts[0];
            const initials = parts.slice(1).map(name => `${name.charAt(0)}.`).join(' ');
            return `${lastName}, ${initials}`;
          });
          return `${formattedAuthors.join(', ')}, et al.`;
        }
      
      case 'mla':
        if (authorList.length === 1) {
          // Last, First
          return authorList[0];
        } else if (authorList.length === 2) {
          // Last1, First1, and First2 Last2
          const author1Parts = authorList[0].split(' ');
          const author2Parts = authorList[1].split(' ');
          const author1Last = author1Parts[0];
          const author1First = author1Parts.slice(1).join(' ');
          const author2Last = author2Parts[0];
          const author2First = author2Parts.slice(1).join(' ');
          return `${author1Last}, ${author1First}, and ${author2First} ${author2Last}`;
        } else {
          // Last1, First1, et al.
          const author1Parts = authorList[0].split(' ');
          const author1Last = author1Parts[0];
          const author1First = author1Parts.slice(1).join(' ');
          return `${author1Last}, ${author1First}, et al.`;
        }
      
      case 'chicago':
        if (authorList.length === 1) {
          // Last, First
          const parts = authorList[0].split(' ');
          const lastName = parts[0];
          const firstName = parts.slice(1).join(' ');
          return `${lastName}, ${firstName}`;
        } else if (authorList.length === 2) {
          // Last1, First1, and First2 Last2
          const author1Parts = authorList[0].split(' ');
          const author2Parts = authorList[1].split(' ');
          const author1Last = author1Parts[0];
          const author1First = author1Parts.slice(1).join(' ');
          const author2Last = author2Parts[0];
          const author2First = author2Parts.slice(1).join(' ');
          return `${author1Last}, ${author1First}, and ${author2First} ${author2Last}`;
        } else {
          // Last1, First1, First2 Last2, and First3 Last3
          const formattedAuthors = authorList.map((author, index) => {
            const parts = author.split(' ');
            const lastName = parts[0];
            const firstName = parts.slice(1).join(' ');
            if (index === 0) {
              return `${lastName}, ${firstName}`;
            } else {
              return `${firstName} ${lastName}`;
            }
          });
          const lastAuthor = formattedAuthors.pop();
          return `${formattedAuthors.join(', ')}, and ${lastAuthor}`;
        }
      
      case 'harvard':
        if (authorList.length === 1) {
          // Last, F.
          const parts = authorList[0].split(' ');
          const lastName = parts[0];
          const initials = parts.slice(1).map(name => `${name.charAt(0)}.`).join('');
          return `${lastName}, ${initials}`;
        } else if (authorList.length === 2) {
          // Last1, F. and Last2, F.
          const formattedAuthors = authorList.map(author => {
            const parts = author.split(' ');
            const lastName = parts[0];
            const initials = parts.slice(1).map(name => `${name.charAt(0)}.`).join('');
            return `${lastName}, ${initials}`;
          });
          return `${formattedAuthors[0]} and ${formattedAuthors[1]}`;
        } else if (authorList.length === 3) {
          // Last1, F., Last2, F. and Last3, F.
          const formattedAuthors = authorList.map(author => {
            const parts = author.split(' ');
            const lastName = parts[0];
            const initials = parts.slice(1).map(name => `${name.charAt(0)}.`).join('');
            return `${lastName}, ${initials}`;
          });
          const lastAuthor = formattedAuthors.pop();
          return `${formattedAuthors.join(', ')} and ${lastAuthor}`;
        } else {
          // Last1, F. et al.
          const parts = authorList[0].split(' ');
          const lastName = parts[0];
          const initials = parts.slice(1).map(name => `${name.charAt(0)}.`).join('');
          return `${lastName}, ${initials} et al.`;
        }
      
      case 'ieee':
        if (authorList.length === 1) {
          // F. Last
          const parts = authorList[0].split(' ');
          const lastName = parts[0];
          const initials = parts.slice(1).map(name => `${name.charAt(0)}.`).join(' ');
          return `${initials} ${lastName}`;
        } else if (authorList.length <= 6) {
          // F. Last1, F. Last2, and F. Last3
          const formattedAuthors = authorList.map(author => {
            const parts = author.split(' ');
            const lastName = parts[0];
            const initials = parts.slice(1).map(name => `${name.charAt(0)}.`).join(' ');
            return `${initials} ${lastName}`;
          });
          return formattedAuthors.join(', ');
        } else {
          // F. Last1 et al.
          const parts = authorList[0].split(' ');
          const lastName = parts[0];
          const initials = parts.slice(1).map(name => `${name.charAt(0)}.`).join(' ');
          return `${initials} ${lastName} et al.`;
        }
      
      default:
        return authors;
    }
  };

  const generateCitation = () => {
    if (!sourceData.title) {
      setError('Title is required');
      return;
    }

    if (!sourceData.authors && sourceType !== 'website') {
      setError('Authors are required for this source type');
      return;
    }

    const citations: CitationResult = {
      apa: generateAPACitation(),
      mla: generateMLACitation(),
      chicago: generateChicagoCitation(),
      harvard: generateHarvardCitation(),
      ieee: generateIEEECitation()
    };

    setCitation(citations);
    setError(null);
  };

  const generateAPACitation = (): string => {
    const { title, authors, year, publisher, location, journal, volume, issue, pages, url, doi, website, accessDate, newspaper, edition } = sourceData;
    const formattedAuthors = formatAuthors(authors, 'apa');
    
    switch (sourceType) {
      case 'book':
        return `${formattedAuthors}${year ? ` (${year})` : ''}. ${title}${edition ? ` (${edition} ed.)` : ''}. ${publisher}${location ? `, ${location}` : ''}.${doi ? ` https://doi.org/${doi}` : ''}`;
      
      case 'journal':
        return `${formattedAuthors}${year ? ` (${year})` : ''}. ${title}. ${journal}${volume ? `, ${volume}` : ''}${issue ? `(${issue})` : ''}${pages ? `, ${pages}` : ''}.${doi ? ` https://doi.org/${doi}` : ''}`;
      
      case 'website':
        const websiteAuthor = authors ? `${formatAuthors(authors, 'apa')}` : website;
        const retrievedDate = accessDate ? ` Retrieved ${new Date(accessDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : '';
        return `${websiteAuthor}${year ? ` (${year})` : ''}. ${title}.${retrievedDate}${url ? ` from ${url}` : ''}`;
      
      case 'newspaper':
        return `${formattedAuthors}${year ? ` (${year}, ${new Date(year).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })})` : ''}. ${title}. ${newspaper}${pages ? `, ${pages}` : ''}.${url ? ` ${url}` : ''}`;
      
      case 'magazine':
        return `${formattedAuthors}${year ? ` (${year}, ${new Date(year).toLocaleDateString('en-US', { month: 'long' })})` : ''}. ${title}. ${journal}${volume ? `, ${volume}` : ''}${issue ? `(${issue})` : ''}${pages ? `, ${pages}` : ''}.`;
      
      case 'thesis':
        return `${formattedAuthors}${year ? ` (${year})` : ''}. ${title} [${sourceData.type === 'thesis' ? "Master's thesis" : "Doctoral dissertation"}, ${sourceData.university}]. ${sourceData.url ? sourceData.url : ''}`;
      
      case 'conference':
        return `${formattedAuthors}${year ? ` (${year})` : ''}. ${title}. In ${sourceData.conferenceTitle}${sourceData.conferenceLocation ? `, ${sourceData.conferenceLocation}` : ''}${pages ? ` (pp. ${pages})` : ''}.`;
      
      case 'report':
        return `${formattedAuthors}${year ? ` (${year})` : ''}. ${title} (Report No. ${sourceData.issue || 'N/A'}). ${sourceData.institution}.${url ? ` ${url}` : ''}`;
      
      default:
        return `${formattedAuthors}${year ? ` (${year})` : ''}. ${title}.`;
    }
  };

  const generateMLACitation = (): string => {
    const { title, authors, year, publisher, location, journal, volume, issue, pages, url, accessDate, website, newspaper, edition } = sourceData;
    const formattedAuthors = formatAuthors(authors, 'mla');
    
    const accessDateFormatted = accessDate ? 
      `Accessed ${new Date(accessDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}` : '';
    
    switch (sourceType) {
      case 'book':
        return `${formattedAuthors}. ${title}${edition ? `, ${edition} ed.` : ''}. ${publisher}${location ? `, ${location}` : ''}, ${year}.`;
      
      case 'journal':
        return `${formattedAuthors}. "${title}." ${journal}, vol. ${volume}${issue ? `, no. ${issue}` : ''}, ${year}, pp. ${pages}.`;
      
      case 'website':
        const websiteAuthor = authors ? `${formatAuthors(authors, 'mla')}` : `"${title}."`;
        return `${websiteAuthor} ${website}${year ? `, ${year}` : ''}, ${url}. ${accessDateFormatted}.`;
      
      case 'newspaper':
        return `${formattedAuthors}. "${title}." ${newspaper}, ${new Date(year).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}, ${pages ? `p. ${pages}` : ''}.`;
      
      case 'magazine':
        return `${formattedAuthors}. "${title}." ${journal}, ${new Date(year).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}, pp. ${pages}.`;
      
      case 'thesis':
        return `${formattedAuthors}. "${title}." ${sourceData.type === 'thesis' ? "Master's thesis" : "PhD dissertation"}, ${sourceData.university}, ${year}.`;
      
      case 'conference':
        return `${formattedAuthors}. "${title}." ${sourceData.conferenceTitle}, ${sourceData.conferenceLocation}, ${sourceData.conferenceDate}.`;
      
      case 'report':
        return `${formattedAuthors}. ${title}. ${sourceData.institution}, ${year}.`;
      
      default:
        return `${formattedAuthors}. "${title}." ${year}.`;
    }
  };

  const generateChicagoCitation = (): string => {
    const { title, authors, year, publisher, location, journal, volume, issue, pages, url, accessDate, website, newspaper, edition } = sourceData;
    const formattedAuthors = formatAuthors(authors, 'chicago');
    
    switch (sourceType) {
      case 'book':
        return `${formattedAuthors}. ${title}${edition ? `, ${edition} ed.` : ''}. ${location}: ${publisher}, ${year}.`;
      
      case 'journal':
        return `${formattedAuthors}. "${title}." ${journal} ${volume}, no. ${issue} (${year}): ${pages}.`;
      
      case 'website':
        const accessDateFormatted = accessDate ? 
          `Accessed ${new Date(accessDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.` : '';
        return `${authors ? `${formattedAuthors}. ` : ''}${title}." ${website}. ${accessDateFormatted} ${url}.`;
      
      case 'newspaper':
        return `${formattedAuthors}. "${title}." ${newspaper}, ${new Date(year).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`;
      
      case 'magazine':
        return `${formattedAuthors}. "${title}." ${journal}, ${new Date(year).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.`;
      
      case 'thesis':
        return `${formattedAuthors}. "${title}." ${sourceData.type === 'thesis' ? "Master's thesis" : "PhD diss."}, ${sourceData.university}, ${year}.`;
      
      case 'conference':
        return `${formattedAuthors}. "${title}." Paper presented at ${sourceData.conferenceTitle}, ${sourceData.conferenceLocation}, ${sourceData.conferenceDate}.`;
      
      case 'report':
        return `${formattedAuthors}. ${title}. ${sourceData.institution}, ${year}.`;
      
      default:
        return `${formattedAuthors}. "${title}." ${year}.`;
    }
  };

  const generateHarvardCitation = (): string => {
    const { title, authors, year, publisher, location, journal, volume, pages, url, accessDate, website, newspaper, edition } = sourceData;
    const formattedAuthors = formatAuthors(authors, 'harvard');
    
    switch (sourceType) {
      case 'book':
        return `${formattedAuthors}, ${year}. ${title}${edition ? `, ${edition} ed.` : ''}. ${location}: ${publisher}.`;
      
      case 'journal':
        return `${formattedAuthors}, ${year}. ${title}. ${journal}, ${volume}${pages ? `, pp.${pages}` : ''}.`;
      
      case 'website':
        const accessDateFormatted = accessDate ? 
          `[Accessed ${new Date(accessDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}]` : '';
        return `${authors ? `${formattedAuthors}, ${year}. ` : ''}${title}. [online] ${website}. Available at: ${url} ${accessDateFormatted}.`;
      
      case 'newspaper':
        return `${formattedAuthors}, ${year}. ${title}. ${newspaper}, ${new Date(year).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}, p.${pages}.`;
      
      case 'magazine':
        return `${formattedAuthors}, ${year}. ${title}. ${journal}, ${pages ? `pp.${pages}` : ''}.`;
      
      case 'thesis':
        return `${formattedAuthors}, ${year}. ${title}. ${sourceData.type === 'thesis' ? "Master's thesis" : "PhD thesis"}. ${sourceData.university}.`;
      
      case 'conference':
        return `${formattedAuthors}, ${year}. ${title}. In: ${sourceData.conferenceTitle}, ${sourceData.conferenceLocation}, ${sourceData.conferenceDate}.`;
      
      case 'report':
        return `${formattedAuthors}, ${year}. ${title}. ${sourceData.institution}.`;
      
      default:
        return `${formattedAuthors}, ${year}. ${title}.`;
    }
  };

  const generateIEEECitation = (): string => {
    const { title, authors, year, publisher, journal, volume, issue, pages, url, doi } = sourceData;
    const formattedAuthors = formatAuthors(authors, 'ieee');
    
    switch (sourceType) {
      case 'book':
        return `${formattedAuthors}, "${title}," ${publisher}, ${year}.`;
      
      case 'journal':
        return `${formattedAuthors}, "${title}," ${journal}, vol. ${volume}, no. ${issue}, pp. ${pages}, ${year}.${doi ? ` doi: ${doi}` : ''}`;
      
      case 'website':
        const accessDateFormatted = sourceData.accessDate ? 
          ` (accessed ${new Date(sourceData.accessDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})` : '';
        return `${authors ? `${formattedAuthors}, ` : ''}"${title}," ${accessDateFormatted}. [Online]. Available: ${url}`;
      
      case 'newspaper':
        return `${formattedAuthors}, "${title}," ${sourceData.newspaper}, p. ${pages}, ${new Date(year).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`;
      
      case 'magazine':
        return `${formattedAuthors}, "${title}," ${journal}, vol. ${volume}, no. ${issue}, pp. ${pages}, ${new Date(year).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}.`;
      
      case 'thesis':
        return `${formattedAuthors}, "${title}," ${sourceData.type === 'thesis' ? "M.S. thesis" : "Ph.D. dissertation"}, ${sourceData.department}, ${sourceData.university}, ${sourceData.location}, ${year}.`;
      
      case 'conference':
        return `${formattedAuthors}, "${title}," in ${sourceData.conferenceTitle}, ${sourceData.conferenceLocation}, ${year}, pp. ${pages}.`;
      
      case 'report':
        return `${formattedAuthors}, "${title}," ${sourceData.institution}, ${sourceData.location}, Tech. Rep. ${sourceData.issue}, ${year}.`;
      
      default:
        return `${formattedAuthors}, "${title}," ${year}.`;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const resetForm = () => {
    setSourceData({
      type: sourceType,
      title: '',
      authors: '',
      year: '',
      publisher: '',
      location: '',
      journal: '',
      volume: '',
      issue: '',
      pages: '',
      url: '',
      accessDate: '',
      doi: '',
      website: '',
      newspaper: '',
      edition: '',
      translator: '',
      editor: '',
      chapter: '',
      institution: '',
      department: '',
      university: '',
      conferenceTitle: '',
      conferenceLocation: '',
      conferenceDate: ''
    });
    setCitation(null);
    setError(null);
  };

  const renderFormFields = () => {
    const commonFields = (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={sourceData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter the title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Authors {sourceType !== 'website' ? '*' : ''}
            </label>
            <input
              type="text"
              value={sourceData.authors}
              onChange={(e) => handleInputChange('authors', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Last, First (separate multiple authors with commas)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Format: Last, First (e.g., Smith, John)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Year
            </label>
            <input
              type="text"
              value={sourceData.year}
              onChange={(e) => handleInputChange('year', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Publication year"
            />
          </div>
        </div>
      </>
    );

    const bookFields = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Publisher
          </label>
          <input
            type="text"
            value={sourceData.publisher}
            onChange={(e) => handleInputChange('publisher', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Publisher name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <input
            type="text"
            value={sourceData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Publication location (e.g., New York, NY)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Edition
          </label>
          <input
            type="text"
            value={sourceData.edition}
            onChange={(e) => handleInputChange('edition', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Edition (e.g., 2nd, Revised)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            DOI (if available)
          </label>
          <input
            type="text"
            value={sourceData.doi}
            onChange={(e) => handleInputChange('doi', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Digital Object Identifier"
          />
        </div>
      </div>
    );

    const journalFields = (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Journal Name
          </label>
          <input
            type="text"
            value={sourceData.journal}
            onChange={(e) => handleInputChange('journal', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Journal name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Volume
          </label>
          <input
            type="text"
            value={sourceData.volume}
            onChange={(e) => handleInputChange('volume', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Volume number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Issue
          </label>
          <input
            type="text"
            value={sourceData.issue}
            onChange={(e) => handleInputChange('issue', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Issue number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pages
          </label>
          <input
            type="text"
            value={sourceData.pages}
            onChange={(e) => handleInputChange('pages', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Page range (e.g., 123-145)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            DOI
          </label>
          <input
            type="text"
            value={sourceData.doi}
            onChange={(e) => handleInputChange('doi', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Digital Object Identifier"
          />
        </div>
      </div>
    );

    const websiteFields = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Website Name
          </label>
          <input
            type="text"
            value={sourceData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Website name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL
          </label>
          <input
            type="url"
            value={sourceData.url}
            onChange={(e) => handleInputChange('url', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Website URL"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Access Date
          </label>
          <input
            type="date"
            value={sourceData.accessDate}
            onChange={(e) => handleInputChange('accessDate', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
    );

    const newspaperFields = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Newspaper Name
          </label>
          <input
            type="text"
            value={sourceData.newspaper}
            onChange={(e) => handleInputChange('newspaper', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Newspaper name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pages
          </label>
          <input
            type="text"
            value={sourceData.pages}
            onChange={(e) => handleInputChange('pages', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Page number(s)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL (if online)
          </label>
          <input
            type="url"
            value={sourceData.url}
            onChange={(e) => handleInputChange('url', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="URL if accessed online"
          />
        </div>
      </div>
    );

    const thesisFields = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            University
          </label>
          <input
            type="text"
            value={sourceData.university}
            onChange={(e) => handleInputChange('university', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="University name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Department
          </label>
          <input
            type="text"
            value={sourceData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Department name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <input
            type="text"
            value={sourceData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="University location"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL (if online)
          </label>
          <input
            type="url"
            value={sourceData.url}
            onChange={(e) => handleInputChange('url', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="URL if accessed online"
          />
        </div>
      </div>
    );

    const conferenceFields = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Conference Title
          </label>
          <input
            type="text"
            value={sourceData.conferenceTitle}
            onChange={(e) => handleInputChange('conferenceTitle', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Conference name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Conference Location
          </label>
          <input
            type="text"
            value={sourceData.conferenceLocation}
            onChange={(e) => handleInputChange('conferenceLocation', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Conference location"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Conference Date
          </label>
          <input
            type="text"
            value={sourceData.conferenceDate}
            onChange={(e) => handleInputChange('conferenceDate', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Conference date"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pages
          </label>
          <input
            type="text"
            value={sourceData.pages}
            onChange={(e) => handleInputChange('pages', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Page range (e.g., 123-145)"
          />
        </div>
      </div>
    );

    const reportFields = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Institution
          </label>
          <input
            type="text"
            value={sourceData.institution}
            onChange={(e) => handleInputChange('institution', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Institution name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Report Number
          </label>
          <input
            type="text"
            value={sourceData.issue}
            onChange={(e) => handleInputChange('issue', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Report number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <input
            type="text"
            value={sourceData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Location"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL (if online)
          </label>
          <input
            type="url"
            value={sourceData.url}
            onChange={(e) => handleInputChange('url', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="URL if accessed online"
          />
        </div>
      </div>
    );

    return (
      <div>
        {commonFields}
        {sourceType === 'book' && bookFields}
        {sourceType === 'journal' && journalFields}
        {sourceType === 'website' && websiteFields}
        {sourceType === 'newspaper' && newspaperFields}
        {sourceType === 'magazine' && journalFields}
        {sourceType === 'thesis' && thesisFields}
        {sourceType === 'conference' && conferenceFields}
        {sourceType === 'report' && reportFields}
      </div>
    );
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
              <BookOpen className="w-8 h-8 text-white mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-white">Citation Generator</h1>
                <p className="text-blue-100 mt-1">Generate properly formatted citations in multiple styles</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Source Type
                </label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {sourceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Citation Style
                </label>
                <select
                  value={citationStyle}
                  onChange={(e) => setCitationStyle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {citationStyles.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {renderFormFields()}

            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-8">
              <button
                onClick={generateCitation}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Generate Citation
              </button>
              <button
                onClick={resetForm}
                className="flex items-center px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Reset Form
              </button>
            </div>

            {citation && (
              <div className="mt-8 space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Generated Citations</h3>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white">{citationStyles.find(style => style.value === citationStyle)?.label}</h4>
                    <button
                      onClick={() => copyToClipboard(citation[citationStyle as keyof CitationResult])}
                      className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                    >
                      {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {citation[citationStyle as keyof CitationResult]}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {citationStyles
                    .filter(style => style.value !== citationStyle)
                    .map((style) => (
                      <div key={style.value} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-800 dark:text-white">{style.label}</h4>
                          <button
                            onClick={() => copyToClipboard(citation[style.value as keyof CitationResult])}
                            className="flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </button>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {citation[style.value as keyof CitationResult]}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitationGenerator;