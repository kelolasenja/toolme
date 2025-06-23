import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Plus, X, Edit3, Eye, RotateCcw, Download, Upload, Shuffle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed: Date | null;
  reviewCount: number;
  correctCount: number;
}

interface FlashcardDeck {
  id: string;
  name: string;
  description: string;
  cards: Flashcard[];
  createdAt: Date;
  lastStudied: Date | null;
}

const FlashcardMaker: React.FC = () => {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [currentDeck, setCurrentDeck] = useState<FlashcardDeck | null>(null);
  const [mode, setMode] = useState<'manage' | 'study' | 'create'>('manage');
  const [studyIndex, setStudyIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [studyStats, setStudyStats] = useState({ correct: 0, total: 0 });

  // Form states
  const [deckForm, setDeckForm] = useState({ name: '', description: '' });
  const [cardForm, setCardForm] = useState({ front: '', back: '', difficulty: 'medium' as const });
  const [editingCard, setEditingCard] = useState<string | null>(null);

  // Load data dari localStorage saat komponen mount
  useEffect(() => {
    const savedDecks = localStorage.getItem('flashcard-decks');
    if (savedDecks) {
      try {
        const parsedDecks = JSON.parse(savedDecks).map((deck: any) => ({
          ...deck,
          createdAt: new Date(deck.createdAt),
          lastStudied: deck.lastStudied ? new Date(deck.lastStudied) : null,
          cards: deck.cards.map((card: any) => ({
            ...card,
            lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : null
          }))
        }));
        setDecks(parsedDecks);
      } catch (error) {
        console.error('Error loading flashcard decks:', error);
      }
    }
  }, []);

  // Save data ke localStorage setiap kali decks berubah
  useEffect(() => {
    localStorage.setItem('flashcard-decks', JSON.stringify(decks));
  }, [decks]);

  const createDeck = () => {
    if (!deckForm.name.trim()) {
      alert('Nama deck harus diisi!');
      return;
    }

    const newDeck: FlashcardDeck = {
      id: Date.now().toString(),
      name: deckForm.name.trim(),
      description: deckForm.description.trim(),
      cards: [],
      createdAt: new Date(),
      lastStudied: null
    };

    setDecks(prev => [...prev, newDeck]);
    setDeckForm({ name: '', description: '' });
    setCurrentDeck(newDeck);
    setMode('create');
  };

  const deleteDeck = (deckId: string) => {
    if (confirm('Yakin ingin menghapus deck ini? Semua kartu akan hilang.')) {
      setDecks(prev => prev.filter(deck => deck.id !== deckId));
      if (currentDeck?.id === deckId) {
        setCurrentDeck(null);
        setMode('manage');
      }
    }
  };

  const addCard = () => {
    if (!cardForm.front.trim() || !cardForm.back.trim()) {
      alert('Pertanyaan dan jawaban harus diisi!');
      return;
    }

    if (!currentDeck) return;

    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: cardForm.front.trim(),
      back: cardForm.back.trim(),
      difficulty: cardForm.difficulty,
      lastReviewed: null,
      reviewCount: 0,
      correctCount: 0
    };

    setDecks(prev => prev.map(deck => 
      deck.id === currentDeck.id 
        ? { ...deck, cards: [...deck.cards, newCard] }
        : deck
    ));

    setCurrentDeck(prev => prev ? { ...prev, cards: [...prev.cards, newCard] } : null);
    setCardForm({ front: '', back: '', difficulty: 'medium' });
  };

  const updateCard = () => {
    if (!editingCard || !currentDeck) return;
    
    if (!cardForm.front.trim() || !cardForm.back.trim()) {
      alert('Pertanyaan dan jawaban harus diisi!');
      return;
    }

    setDecks(prev => prev.map(deck => 
      deck.id === currentDeck.id 
        ? {
            ...deck, 
            cards: deck.cards.map(card => 
              card.id === editingCard 
                ? { ...card, front: cardForm.front.trim(), back: cardForm.back.trim(), difficulty: cardForm.difficulty }
                : card
            )
          }
        : deck
    ));

    setCurrentDeck(prev => prev ? {
      ...prev,
      cards: prev.cards.map(card => 
        card.id === editingCard 
          ? { ...card, front: cardForm.front.trim(), back: cardForm.back.trim(), difficulty: cardForm.difficulty }
          : card
      )
    } : null);

    setEditingCard(null);
    setCardForm({ front: '', back: '', difficulty: 'medium' });
  };

  const deleteCard = (cardId: string) => {
    if (!currentDeck) return;

    setDecks(prev => prev.map(deck => 
      deck.id === currentDeck.id 
        ? { ...deck, cards: deck.cards.filter(card => card.id !== cardId) }
        : deck
    ));

    setCurrentDeck(prev => prev ? { ...prev, cards: prev.cards.filter(card => card.id !== cardId) } : null);
  };

  const startStudy = (deck: FlashcardDeck) => {
    if (deck.cards.length === 0) {
      alert('Deck ini belum memiliki kartu!');
      return;
    }

    setCurrentDeck(deck);
    setStudyCards([...deck.cards].sort(() => Math.random() - 0.5)); // Shuffle cards
    setStudyIndex(0);
    setShowAnswer(false);
    setStudyStats({ correct: 0, total: 0 });
    setMode('study');
  };

  const markAnswer = (isCorrect: boolean) => {
    if (!currentDeck || studyIndex >= studyCards.length) return;

    const currentCard = studyCards[studyIndex];
    const now = new Date();

    // Update card statistics
    const updatedCard = {
      ...currentCard,
      lastReviewed: now,
      reviewCount: currentCard.reviewCount + 1,
      correctCount: currentCard.correctCount + (isCorrect ? 1 : 0)
    };

    // Update deck
    setDecks(prev => prev.map(deck => 
      deck.id === currentDeck.id 
        ? {
            ...deck,
            lastStudied: now,
            cards: deck.cards.map(card => 
              card.id === currentCard.id ? updatedCard : card
            )
          }
        : deck
    ));

    // Update study stats
    setStudyStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    // Move to next card
    if (studyIndex < studyCards.length - 1) {
      setStudyIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Study session complete
      alert(`Sesi belajar selesai!\nBenar: ${studyStats.correct + (isCorrect ? 1 : 0)}/${studyStats.total + 1}\nAkurasi: ${Math.round(((studyStats.correct + (isCorrect ? 1 : 0)) / (studyStats.total + 1)) * 100)}%`);
      setMode('manage');
    }
  };

  const exportDeck = (deck: FlashcardDeck) => {
    const dataStr = JSON.stringify(deck, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `flashcard-deck-${deck.name.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importDeck = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedDeck = JSON.parse(e.target?.result as string);
        
        // Validate deck structure
        if (!importedDeck.name || !Array.isArray(importedDeck.cards)) {
          throw new Error('Invalid deck format');
        }

        // Create new deck with unique ID
        const newDeck: FlashcardDeck = {
          ...importedDeck,
          id: Date.now().toString(),
          createdAt: new Date(),
          lastStudied: null,
          cards: importedDeck.cards.map((card: any) => ({
            ...card,
            id: Date.now().toString() + Math.random(),
            lastReviewed: null,
            reviewCount: 0,
            correctCount: 0
          }))
        };

        setDecks(prev => [...prev, newDeck]);
        alert(`Deck "${newDeck.name}" berhasil diimpor dengan ${newDeck.cards.length} kartu!`);
      } catch (error) {
        alert('File tidak valid atau rusak!');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Mudah';
      case 'medium': return 'Sedang';
      case 'hard': return 'Sulit';
      default: return 'Sedang';
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
            <CreditCard className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pembuat Flashcard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Buat kartu digital untuk membantu hafalan dan pembelajaran Anda. Sistem spaced repetition untuk hasil optimal.
          </p>
        </div>

        {/* Mode Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setMode('manage')}
              className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                mode === 'manage'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Kelola Deck
            </button>
            {currentDeck && (
              <>
                <button
                  onClick={() => setMode('create')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                    mode === 'create'
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Edit Kartu
                </button>
                <button
                  onClick={() => startStudy(currentDeck)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                    mode === 'study'
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Belajar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Manage Mode */}
        {mode === 'manage' && (
          <div className="space-y-8">
            {/* Create New Deck */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Buat Deck Baru
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Nama deck (contoh: Bahasa Inggris)"
                  value={deckForm.name}
                  onChange={(e) => setDeckForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="Deskripsi (opsional)"
                  value={deckForm.description}
                  onChange={(e) => setDeckForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  onClick={createDeck}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Deck</span>
                </button>
              </div>
            </div>

            {/* Import Deck */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Import Deck
              </h3>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".json"
                  onChange={importDeck}
                  className="hidden"
                  id="import-deck"
                />
                <label
                  htmlFor="import-deck"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Deck JSON</span>
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Import deck yang sudah diekspor sebelumnya
                </p>
              </div>
            </div>

            {/* Deck List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Deck Anda ({decks.length})
              </h3>
              
              {decks.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Belum ada deck. Buat deck pertama Anda!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {decks.map((deck) => (
                    <div key={deck.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {deck.name}
                          </h4>
                          {deck.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {deck.description}
                            </p>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {deck.cards.length} kartu
                            {deck.lastStudied && (
                              <span className="ml-2">
                                • Terakhir dipelajari: {deck.lastStudied.toLocaleDateString('id-ID')}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteDeck(deck.id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setCurrentDeck(deck);
                            setMode('create');
                          }}
                          className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 px-3 rounded text-sm font-medium transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => startStudy(deck)}
                          disabled={deck.cards.length === 0}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-3 rounded text-sm font-medium transition-colors duration-200"
                        >
                          Belajar
                        </button>
                        <button
                          onClick={() => exportDeck(deck)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create/Edit Mode */}
        {mode === 'create' && currentDeck && (
          <div className="space-y-8">
            {/* Deck Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {currentDeck.name}
              </h3>
              {currentDeck.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {currentDeck.description}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentDeck.cards.length} kartu
              </p>
            </div>

            {/* Add/Edit Card Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingCard ? 'Edit Kartu' : 'Tambah Kartu Baru'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pertanyaan/Depan Kartu
                  </label>
                  <textarea
                    value={cardForm.front}
                    onChange={(e) => setCardForm(prev => ({ ...prev, front: e.target.value }))}
                    placeholder="Masukkan pertanyaan atau teks depan kartu..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jawaban/Belakang Kartu
                  </label>
                  <textarea
                    value={cardForm.back}
                    onChange={(e) => setCardForm(prev => ({ ...prev, back: e.target.value }))}
                    placeholder="Masukkan jawaban atau teks belakang kartu..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tingkat Kesulitan
                  </label>
                  <select
                    value={cardForm.difficulty}
                    onChange={(e) => setCardForm(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="easy">Mudah</option>
                    <option value="medium">Sedang</option>
                    <option value="hard">Sulit</option>
                  </select>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={editingCard ? updateCard : addCard}
                    className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{editingCard ? 'Update Kartu' : 'Tambah Kartu'}</span>
                  </button>
                  
                  {editingCard && (
                    <button
                      onClick={() => {
                        setEditingCard(null);
                        setCardForm({ front: '', back: '', difficulty: 'medium' });
                      }}
                      className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Cards List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Kartu dalam Deck ({currentDeck.cards.length})
              </h3>
              
              {currentDeck.cards.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Belum ada kartu. Tambahkan kartu pertama!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentDeck.cards.map((card) => (
                    <div key={card.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Depan:</span>
                            <p className="text-gray-900 dark:text-white mt-1">{card.front}</p>
                          </div>
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Belakang:</span>
                            <p className="text-gray-900 dark:text-white mt-1">{card.back}</p>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className={`px-2 py-1 rounded-full ${getDifficultyColor(card.difficulty)}`}>
                              {getDifficultyLabel(card.difficulty)}
                            </span>
                            <span>Review: {card.reviewCount}x</span>
                            <span>Akurasi: {card.reviewCount > 0 ? Math.round((card.correctCount / card.reviewCount) * 100) : 0}%</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setEditingCard(card.id);
                              setCardForm({
                                front: card.front,
                                back: card.back,
                                difficulty: card.difficulty
                              });
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteCard(card.id)}
                            className="p-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Study Mode */}
        {mode === 'study' && currentDeck && studyCards.length > 0 && (
          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentDeck.name}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {studyIndex + 1} / {studyCards.length}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((studyIndex + 1) / studyCards.length) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Benar: {studyStats.correct}/{studyStats.total}</span>
                <span>Akurasi: {studyStats.total > 0 ? Math.round((studyStats.correct / studyStats.total) * 100) : 0}%</span>
              </div>
            </div>

            {/* Flashcard */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mb-6 min-h-[300px] flex flex-col justify-center">
              <div className="text-center">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${getDifficultyColor(studyCards[studyIndex].difficulty)}`}>
                  {getDifficultyLabel(studyCards[studyIndex].difficulty)}
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {showAnswer ? 'Jawaban:' : 'Pertanyaan:'}
                  </h4>
                  <p className="text-xl text-gray-900 dark:text-white leading-relaxed">
                    {showAnswer ? studyCards[studyIndex].back : studyCards[studyIndex].front}
                  </p>
                </div>

                {!showAnswer ? (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Lihat Jawaban</span>
                  </button>
                ) : (
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => markAnswer(false)}
                      className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
                    >
                      ❌ Salah
                    </button>
                    <button
                      onClick={() => markAnswer(true)}
                      className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
                    >
                      ✅ Benar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Study Controls */}
            <div className="text-center">
              <button
                onClick={() => setMode('manage')}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                Keluar dari Sesi Belajar
              </button>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🧠</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Spaced Repetition</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Sistem pengulangan yang terbukti efektif untuk hafalan jangka panjang
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tracking Progress</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Pantau kemajuan belajar dengan statistik akurasi dan frekuensi review
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">💾</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Local Storage</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Data tersimpan di browser Anda, tidak perlu koneksi internet
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📤</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Export/Import</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Backup dan share deck flashcard dalam format JSON
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardMaker;