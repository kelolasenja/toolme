import React, { useState, useRef } from 'react';
import { ArrowLeft, FileText, Plus, Check, Clock, User, Download, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Attendee {
  id: string;
  name: string;
}

interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  dueDate: string;
}

interface MeetingNote {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  facilitator: string;
  notetaker: string;
  attendees: Attendee[];
  agenda: string[];
  discussion: string;
  decisions: string;
  actionItems: ActionItem[];
}

const MeetingNotesGenerator: React.FC = () => {
  // State for meeting note
  const [meetingNote, setMeetingNote] = useState<MeetingNote>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    location: '',
    facilitator: '',
    notetaker: '',
    attendees: [],
    agenda: [],
    discussion: '',
    decisions: '',
    actionItems: []
  });
  
  // State for new items
  const [newAttendee, setNewAttendee] = useState<string>('');
  const [newAgendaItem, setNewAgendaItem] = useState<string>('');
  const [newActionItem, setNewActionItem] = useState<{
    description: string;
    assignee: string;
    dueDate: string;
  }>({
    description: '',
    assignee: '',
    dueDate: ''
  });
  
  // State for output format
  const [outputFormat, setOutputFormat] = useState<'pdf' | 'word' | 'html' | 'text'>('text');
  const [template, setTemplate] = useState<'standard' | 'minimal' | 'formal' | 'modern'>('standard');
  
  // State for copy status
  const [copied, setCopied] = useState<boolean>(false);
  
  // Refs
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Update meeting note
  const updateMeetingNote = <K extends keyof MeetingNote>(key: K, value: MeetingNote[K]) => {
    setMeetingNote(prev => ({ ...prev, [key]: value }));
  };
  
  // Add attendee
  const addAttendee = () => {
    if (!newAttendee.trim()) return;
    
    const newAttendeeObj: Attendee = {
      id: Date.now().toString(),
      name: newAttendee.trim()
    };
    
    updateMeetingNote('attendees', [...meetingNote.attendees, newAttendeeObj]);
    setNewAttendee('');
  };
  
  // Remove attendee
  const removeAttendee = (id: string) => {
    updateMeetingNote('attendees', meetingNote.attendees.filter(attendee => attendee.id !== id));
  };
  
  // Add agenda item
  const addAgendaItem = () => {
    if (!newAgendaItem.trim()) return;
    
    updateMeetingNote('agenda', [...meetingNote.agenda, newAgendaItem.trim()]);
    setNewAgendaItem('');
  };
  
  // Remove agenda item
  const removeAgendaItem = (index: number) => {
    updateMeetingNote('agenda', meetingNote.agenda.filter((_, i) => i !== index));
  };
  
  // Add action item
  const addActionItem = () => {
    if (!newActionItem.description.trim() || !newActionItem.assignee.trim()) return;
    
    const newActionItemObj: ActionItem = {
      id: Date.now().toString(),
      description: newActionItem.description.trim(),
      assignee: newActionItem.assignee.trim(),
      dueDate: newActionItem.dueDate
    };
    
    updateMeetingNote('actionItems', [...meetingNote.actionItems, newActionItemObj]);
    setNewActionItem({
      description: '',
      assignee: '',
      dueDate: ''
    });
  };
  
  // Remove action item
  const removeActionItem = (id: string) => {
    updateMeetingNote('actionItems', meetingNote.actionItems.filter(item => item.id !== id));
  };
  
  // Generate meeting notes
  const generateNotes = (): string => {
    let notes = '';
    
    // Title and basic info
    notes += `# ${meetingNote.title || 'Meeting Notes'}\n\n`;
    notes += `**Date:** ${meetingNote.date ? new Date(meetingNote.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}\n`;
    
    if (meetingNote.startTime || meetingNote.endTime) {
      notes += `**Time:** ${meetingNote.startTime || ''}${meetingNote.startTime && meetingNote.endTime ? ' - ' : ''}${meetingNote.endTime || ''}\n`;
    }
    
    if (meetingNote.location) {
      notes += `**Location:** ${meetingNote.location}\n`;
    }
    
    if (meetingNote.facilitator) {
      notes += `**Facilitator:** ${meetingNote.facilitator}\n`;
    }
    
    if (meetingNote.notetaker) {
      notes += `**Note Taker:** ${meetingNote.notetaker}\n`;
    }
    
    // Attendees
    if (meetingNote.attendees.length > 0) {
      notes += `\n## Attendees\n\n`;
      meetingNote.attendees.forEach(attendee => {
        notes += `- ${attendee.name}\n`;
      });
    }
    
    // Agenda
    if (meetingNote.agenda.length > 0) {
      notes += `\n## Agenda\n\n`;
      meetingNote.agenda.forEach((item, index) => {
        notes += `${index + 1}. ${item}\n`;
      });
    }
    
    // Discussion
    if (meetingNote.discussion) {
      notes += `\n## Discussion Points\n\n${meetingNote.discussion}\n`;
    }
    
    // Decisions
    if (meetingNote.decisions) {
      notes += `\n## Decisions Made\n\n${meetingNote.decisions}\n`;
    }
    
    // Action Items
    if (meetingNote.actionItems.length > 0) {
      notes += `\n## Action Items\n\n`;
      meetingNote.actionItems.forEach((item, index) => {
        notes += `${index + 1}. **${item.description}**\n`;
        notes += `   - Assigned to: ${item.assignee}\n`;
        if (item.dueDate) {
          notes += `   - Due date: ${new Date(item.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;
        }
        notes += '\n';
      });
    }
    
    // Footer
    notes += `\n---\n`;
    notes += `Meeting notes generated on ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;
    
    return notes;
  };
  
  // Copy notes to clipboard
  const copyToClipboard = async () => {
    const notes = generateNotes();
    
    try {
      await navigator.clipboard.writeText(notes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };
  
  // Download notes
  const downloadNotes = () => {
    const notes = generateNotes();
    const blob = new Blob([notes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meetingNote.title || 'meeting-notes'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
            <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Generator Notulen Rapat
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Buat notulen rapat terstruktur dengan action items dan format profesional.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">
            Fitur Notulen Rapat:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-purple-800 dark:text-purple-200">
            <li>Template profesional untuk berbagai jenis rapat</li>
            <li>Pelacakan action items dengan penanggung jawab dan tenggat waktu</li>
            <li>Format yang terstruktur dan mudah dibaca</li>
            <li>Ekspor ke PDF, Word, atau format lainnya</li>
            <li>Fitur berbagi via email atau link</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Meeting Details */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Detail Rapat
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Judul Rapat
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Rapat Perencanaan Proyek Q1"
                    value={meetingNote.title}
                    onChange={(e) => updateMeetingNote('title', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={meetingNote.date}
                      onChange={(e) => updateMeetingNote('date', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Waktu Mulai
                    </label>
                    <input
                      type="time"
                      value={meetingNote.startTime}
                      onChange={(e) => updateMeetingNote('startTime', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Waktu Selesai
                    </label>
                    <input
                      type="time"
                      value={meetingNote.endTime}
                      onChange={(e) => updateMeetingNote('endTime', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lokasi / Link Meeting
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Ruang Rapat A atau Link Zoom"
                    value={meetingNote.location}
                    onChange={(e) => updateMeetingNote('location', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fasilitator
                    </label>
                    <input
                      type="text"
                      placeholder="Nama fasilitator"
                      value={meetingNote.facilitator}
                      onChange={(e) => updateMeetingNote('facilitator', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notulis
                    </label>
                    <input
                      type="text"
                      placeholder="Nama notulis"
                      value={meetingNote.notetaker}
                      onChange={(e) => updateMeetingNote('notetaker', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Attendees */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Peserta Rapat
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Nama peserta"
                    value={newAttendee}
                    onChange={(e) => setNewAttendee(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addAttendee()}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <button 
                    onClick={addAttendee}
                    className="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-800/30 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2 mt-4 max-h-40 overflow-y-auto">
                  {meetingNote.attendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-gray-900 dark:text-white">{attendee.name}</span>
                      <button 
                        onClick={() => removeAttendee(attendee.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center Column - Agenda & Notes */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Agenda Rapat
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Item agenda"
                    value={newAgendaItem}
                    onChange={(e) => setNewAgendaItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addAgendaItem()}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <button 
                    onClick={addAgendaItem}
                    className="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-800/30 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2 mt-4 max-h-40 overflow-y-auto">
                  {meetingNote.agenda.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-gray-900 dark:text-white">{index + 1}. {item}</span>
                      <button 
                        onClick={() => removeAgendaItem(index)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Meeting Notes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Catatan Rapat
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Poin Diskusi
                  </label>
                  <textarea
                    placeholder="Catatan detail tentang diskusi dalam rapat..."
                    value={meetingNote.discussion}
                    onChange={(e) => updateMeetingNote('discussion', e.target.value)}
                    rows={6}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Keputusan yang Diambil
                  </label>
                  <textarea
                    placeholder="Daftar keputusan yang diambil dalam rapat..."
                    value={meetingNote.decisions}
                    onChange={(e) => updateMeetingNote('decisions', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Action Items & Generate */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Action Items
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Deskripsi tugas"
                    value={newActionItem.description}
                    onChange={(e) => setNewActionItem(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Penanggung jawab"
                      value={newActionItem.assignee}
                      onChange={(e) => setNewActionItem(prev => ({ ...prev, assignee: e.target.value }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <input
                      type="date"
                      placeholder="Tenggat waktu"
                      value={newActionItem.dueDate}
                      onChange={(e) => setNewActionItem(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <button 
                    onClick={addActionItem}
                    className="w-full p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-800/30 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Action Item</span>
                  </button>
                </div>
                
                <div className="space-y-3 mt-4 max-h-60 overflow-y-auto">
                  {meetingNote.actionItems.map((item) => (
                    <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{item.description}</div>
                          <div className="flex items-center space-x-3 mt-1 text-sm">
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <User className="w-3 h-3 mr-1" />
                              <span>{item.assignee}</span>
                            </div>
                            {item.dueDate && (
                              <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>{new Date(item.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => removeActionItem(item.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Notes */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
                Generate Notulen
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">
                    Format Output
                  </label>
                  <select 
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value as 'pdf' | 'word' | 'html' | 'text')}
                    className="w-full p-3 border border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="text">Plain Text</option>
                    <option value="html">HTML</option>
                    <option value="pdf">PDF</option>
                    <option value="word">Word Document</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">
                    Template
                  </label>
                  <select 
                    value={template}
                    onChange={(e) => setTemplate(e.target.value as 'standard' | 'minimal' | 'formal' | 'modern')}
                    className="w-full p-3 border border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="standard">Standar Profesional</option>
                    <option value="minimal">Minimalis</option>
                    <option value="formal">Formal</option>
                    <option value="modern">Modern</option>
                  </select>
                </div>
                
                <button 
                  onClick={downloadNotes}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Generate & Unduh Notulen</span>
                </button>
                
                <button 
                  onClick={copyToClipboard}
                  className="w-full bg-white dark:bg-gray-700 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin ke Clipboard'}</span>
                </button>
              </div>
            </div>
            
            {/* Preview */}
            <textarea
              ref={notesTextareaRef}
              value={generateNotes()}
              readOnly
              className="hidden"
            />
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📝</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Template Profesional</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Format standar untuk berbagai jenis rapat
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">✅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Action Items</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Pelacakan tugas dengan penanggung jawab dan deadline
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🔄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Multi Format</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Ekspor ke PDF, Word, atau format lainnya
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🔗</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Berbagi Mudah</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Bagikan notulen via email atau link
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingNotesGenerator;