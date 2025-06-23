import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Plus, Minus, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assignedTo: string[];
}

interface Person {
  id: string;
  name: string;
}

const BillSplitter: React.FC = () => {
  // State for bill information
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tipPercentage, setTipPercentage] = useState<number>(10);
  const [taxPercentage, setTaxPercentage] = useState<number>(10);
  const [numberOfPeople, setNumberOfPeople] = useState<number>(4);
  const [splitMethod, setSplitMethod] = useState<'equal' | 'custom'>('equal');
  
  // State for custom splitting
  const [items, setItems] = useState<BillItem[]>([]);
  const [people, setPeople] = useState<Person[]>([
    { id: '1', name: 'Budi' },
    { id: '2', name: 'Siti' },
    { id: '3', name: 'Ahmad' },
    { id: '4', name: 'Dewi' }
  ]);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemPrice, setNewItemPrice] = useState<number | ''>('');
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
  const [newPersonName, setNewPersonName] = useState<string>('');

  // Calculated values
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [perPersonAmount, setPerPersonAmount] = useState<number>(0);
  const [customSplitAmounts, setCustomSplitAmounts] = useState<{[key: string]: number}>({});

  // Calculate bill totals
  useEffect(() => {
    // Calculate subtotal for equal split
    if (splitMethod === 'equal') {
      const calculatedTip = (subtotal * tipPercentage) / 100;
      const calculatedTax = (subtotal * taxPercentage) / 100;
      const calculatedTotal = subtotal + calculatedTip + calculatedTax;
      
      setTipAmount(calculatedTip);
      setTaxAmount(calculatedTax);
      setTotal(calculatedTotal);
      setPerPersonAmount(calculatedTotal / numberOfPeople);
    } else {
      // Calculate subtotal from items for custom split
      const calculatedSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const calculatedTip = (calculatedSubtotal * tipPercentage) / 100;
      const calculatedTax = (calculatedSubtotal * taxPercentage) / 100;
      const calculatedTotal = calculatedSubtotal + calculatedTip + calculatedTax;
      
      setSubtotal(calculatedSubtotal);
      setTipAmount(calculatedTip);
      setTaxAmount(calculatedTax);
      setTotal(calculatedTotal);
      
      // Calculate per-person amounts for custom split
      const personAmounts: {[key: string]: number} = {};
      
      // Initialize all people with 0
      people.forEach(person => {
        personAmounts[person.id] = 0;
      });
      
      // Add item costs to assigned people
      items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const perPersonCost = itemTotal / (item.assignedTo.length || 1);
        
        item.assignedTo.forEach(personId => {
          personAmounts[personId] = (personAmounts[personId] || 0) + perPersonCost;
        });
      });
      
      // Add proportional tip and tax
      people.forEach(person => {
        const proportion = personAmounts[person.id] / calculatedSubtotal || 0;
        personAmounts[person.id] += (calculatedTip + calculatedTax) * proportion;
      });
      
      setCustomSplitAmounts(personAmounts);
    }
  }, [subtotal, tipPercentage, taxPercentage, numberOfPeople, splitMethod, items]);

  // Handlers for equal split
  const incrementPeople = () => {
    setNumberOfPeople(prev => prev + 1);
  };

  const decrementPeople = () => {
    if (numberOfPeople > 1) {
      setNumberOfPeople(prev => prev - 1);
    }
  };

  const handleSubtotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSubtotal(isNaN(value) ? 0 : value);
  };

  const handleTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setTipPercentage(isNaN(value) ? 0 : value);
  };

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setTaxPercentage(isNaN(value) ? 0 : value);
  };

  const setQuickTip = (percentage: number) => {
    setTipPercentage(percentage);
  };

  // Handlers for custom split
  const addItem = () => {
    if (!newItemName.trim() || newItemPrice === '' || newItemPrice <= 0) {
      return;
    }

    const newItem: BillItem = {
      id: Date.now().toString(),
      name: newItemName,
      price: typeof newItemPrice === 'number' ? newItemPrice : 0,
      quantity: newItemQuantity,
      assignedTo: people.map(p => p.id) // Default assign to everyone
    };

    setItems(prev => [...prev, newItem]);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemQuantity(1);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleItemAssignment = (itemId: string, personId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const isAssigned = item.assignedTo.includes(personId);
        const newAssignedTo = isAssigned
          ? item.assignedTo.filter(id => id !== personId)
          : [...item.assignedTo, personId];
        
        return {
          ...item,
          assignedTo: newAssignedTo.length > 0 ? newAssignedTo : people.map(p => p.id) // If no one is assigned, assign to everyone
        };
      }
      return item;
    }));
  };

  const addPerson = () => {
    if (!newPersonName.trim()) {
      return;
    }

    const newPerson: Person = {
      id: Date.now().toString(),
      name: newPersonName
    };

    setPeople(prev => [...prev, newPerson]);
    setNewPersonName('');
  };

  const removePerson = (id: string) => {
    if (people.length <= 1) {
      return;
    }

    setPeople(prev => prev.filter(person => person.id !== id));
    
    // Remove this person from all item assignments
    setItems(prev => prev.map(item => ({
      ...item,
      assignedTo: item.assignedTo.filter(personId => personId !== id)
    })));
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate and reset
  const calculateBill = () => {
    // Calculation is already handled by the useEffect
    // This function is for the "Hitung Ulang" button
    // We could add additional logic here if needed
  };

  const resetForm = () => {
    setSubtotal(0);
    setTipPercentage(10);
    setTaxPercentage(10);
    setNumberOfPeople(4);
    setSplitMethod('equal');
    setItems([]);
    setPeople([
      { id: '1', name: 'Budi' },
      { id: '2', name: 'Siti' },
      { id: '3', name: 'Ahmad' },
      { id: '4', name: 'Dewi' }
    ]);
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 dark:bg-rose-900/20 rounded-full mb-4">
            <Users className="w-8 h-8 text-rose-600 dark:text-rose-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Kalkulator Pembagi Tagihan & Tip
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Bagi tagihan restoran secara adil untuk beberapa orang.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-3">
            Fitur Pembagi Tagihan:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-rose-800 dark:text-rose-200">
            <li>Bagi tagihan sama rata atau berdasarkan pesanan masing-masing</li>
            <li>Hitung tip otomatis dengan persentase yang dapat disesuaikan</li>
            <li>Tambahkan pajak atau biaya layanan</li>
            <li>Pembulatan otomatis untuk memudahkan pembayaran</li>
            <li>Simpan riwayat pembagian tagihan</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Bill Input */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Detail Tagihan
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Tagihan
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">Rp</span>
                    </div>
                    <input
                      type="number"
                      placeholder="250000"
                      value={subtotal || ''}
                      onChange={handleSubtotalChange}
                      className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jumlah Orang
                  </label>
                  <div className="flex items-center">
                    <button 
                      onClick={decrementPeople}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-l-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={numberOfPeople}
                      onChange={(e) => setNumberOfPeople(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-3 border-t border-b border-gray-300 dark:border-gray-600 text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button 
                      onClick={incrementPeople}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-r-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tip (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="10"
                      value={tipPercentage || ''}
                      onChange={handleTipChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <button 
                      onClick={() => setQuickTip(5)}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      5%
                    </button>
                    <button 
                      onClick={() => setQuickTip(10)}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      10%
                    </button>
                    <button 
                      onClick={() => setQuickTip(15)}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      15%
                    </button>
                    <button 
                      onClick={() => setQuickTip(20)}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      20%
                    </button>
                    <button 
                      onClick={() => setTipPercentage(0)}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Kustom
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pajak/Biaya Layanan (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="10"
                      value={taxPercentage || ''}
                      onChange={handleTaxChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Metode Pembagian
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="equal"
                    name="split-method"
                    checked={splitMethod === 'equal'}
                    onChange={() => setSplitMethod('equal')}
                    className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="equal" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Bagi Sama Rata
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="custom"
                    name="split-method"
                    checked={splitMethod === 'custom'}
                    onChange={() => setSplitMethod('custom')}
                    className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="custom" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Bagi Berdasarkan Pesanan
                  </label>
                </div>
              </div>

              {splitMethod === 'custom' && (
                <div className="mt-4 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tambah Peserta
                    </h4>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newPersonName}
                        onChange={(e) => setNewPersonName(e.target.value)}
                        placeholder="Nama peserta"
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button 
                        onClick={addPerson}
                        className="p-2 bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-lg"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Peserta ({people.length})
                    </h4>
                    <div className="space-y-2">
                      {people.map(person => (
                        <div key={person.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span>{person.name}</span>
                          <button 
                            onClick={() => removePerson(person.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tambah Item
                    </h4>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Nama item"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400">Rp</span>
                          </div>
                          <input
                            type="number"
                            value={newItemPrice === '' ? '' : newItemPrice}
                            onChange={(e) => setNewItemPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            placeholder="Harga"
                            className="w-full pl-10 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="w-20">
                          <input
                            type="number"
                            value={newItemQuantity}
                            onChange={(e) => setNewItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                            placeholder="Qty"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <button 
                          onClick={addItem}
                          className="p-2 bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-lg"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {items.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Daftar Item
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {items.map(item => (
                          <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <span className="font-medium">{item.name}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                  {formatCurrency(item.price)} x {item.quantity}
                                </span>
                              </div>
                              <button 
                                onClick={() => removeItem(item.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-sm">
                              <p className="mb-1 text-gray-600 dark:text-gray-400">Dibayar oleh:</p>
                              <div className="flex flex-wrap gap-2">
                                {people.map(person => (
                                  <button
                                    key={person.id}
                                    onClick={() => toggleItemAssignment(item.id, person.id)}
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      item.assignedTo.includes(person.id)
                                        ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300'
                                        : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
                                    }`}
                                  >
                                    {person.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Results */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ringkasan
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Pajak/Biaya Layanan ({taxPercentage}%)</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tip ({tipPercentage}%)</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(tipAmount)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-rose-600 dark:text-rose-400">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800 p-6">
              <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-4">
                Hasil Pembagian
              </h3>
              
              {splitMethod === 'equal' ? (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Per Orang ({numberOfPeople} orang)</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(perPersonAmount)}</div>
                      </div>
                      <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-full">
                        <DollarSign className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between mb-1">
                      <span>Subtotal per orang</span>
                      <span>{formatCurrency(subtotal / numberOfPeople)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Pajak/Biaya per orang</span>
                      <span>{formatCurrency(taxAmount / numberOfPeople)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tip per orang</span>
                      <span>{formatCurrency(tipAmount / numberOfPeople)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {people.map(person => {
                    const amount = customSplitAmounts[person.id] || 0;
                    return (
                      <div key={person.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{person.name}</div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(amount)}</div>
                          </div>
                          <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-full">
                            <DollarSign className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <button 
              onClick={calculateBill}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
            >
              Hitung Ulang
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">👥</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Adil & Akurat</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Bagi tagihan dengan tepat tanpa perselisihan
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">💸</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Hitung Tip</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Kalkulasi tip otomatis dengan berbagai persentase
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🍽️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pembagian Kustom</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Bagi berdasarkan pesanan masing-masing orang
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillSplitter;