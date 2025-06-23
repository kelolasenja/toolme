import React, { useState } from 'react';
import { ArrowLeft, FileSpreadsheet, Download, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
}

interface ClientInfo {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
}

const InvoiceGenerator: React.FC = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    taxId: ''
  });

  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: ''
  });

  const [invoiceNumber, setInvoiceNumber] = useState('INV-001');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, price: 0 }
  ]);
  const [notes, setNotes] = useState('Pembayaran dapat dilakukan melalui transfer bank. Terima kasih atas kepercayaan Anda.');
  const [taxRate, setTaxRate] = useState(11); // PPN Indonesia
  const [isProcessing, setIsProcessing] = useState(false);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      price: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const generatePDF = async () => {
    if (!companyInfo.name || !clientInfo.name || items.some(item => !item.description)) {
      alert('Mohon lengkapi informasi perusahaan, klien, dan deskripsi item!');
      return;
    }

    setIsProcessing(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 25;

      // Header with company branding
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('INVOICE', 20, 25);
      
      // Invoice number on the right
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(`#${invoiceNumber}`, pageWidth - 20, 25, { align: 'right' });
      
      yPosition = 50;
      doc.setTextColor(0, 0, 0);

      // Company Information (Left side)
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('DARI:', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(companyInfo.name, 20, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      if (companyInfo.address) {
        doc.text(companyInfo.address, 20, yPosition);
        yPosition += 5;
      }
      if (companyInfo.city || companyInfo.postalCode) {
        doc.text(`${companyInfo.city} ${companyInfo.postalCode}`, 20, yPosition);
        yPosition += 5;
      }
      if (companyInfo.phone) {
        doc.text(`Telp: ${companyInfo.phone}`, 20, yPosition);
        yPosition += 5;
      }
      if (companyInfo.email) {
        doc.text(`Email: ${companyInfo.email}`, 20, yPosition);
        yPosition += 5;
      }
      if (companyInfo.website) {
        doc.text(`Website: ${companyInfo.website}`, 20, yPosition);
        yPosition += 5;
      }
      if (companyInfo.taxId) {
        doc.text(`NPWP: ${companyInfo.taxId}`, 20, yPosition);
      }

      // Client Information (Right side)
      let clientYPosition = 50;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('KEPADA:', pageWidth - 20, clientYPosition, { align: 'right' });
      clientYPosition += 8;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(clientInfo.name, pageWidth - 20, clientYPosition, { align: 'right' });
      clientYPosition += 6;

      doc.setFont('helvetica', 'normal');
      if (clientInfo.address) {
        doc.text(clientInfo.address, pageWidth - 20, clientYPosition, { align: 'right' });
        clientYPosition += 5;
      }
      if (clientInfo.city || clientInfo.postalCode) {
        doc.text(`${clientInfo.city} ${clientInfo.postalCode}`, pageWidth - 20, clientYPosition, { align: 'right' });
        clientYPosition += 5;
      }
      if (clientInfo.phone) {
        doc.text(`Telp: ${clientInfo.phone}`, pageWidth - 20, clientYPosition, { align: 'right' });
        clientYPosition += 5;
      }
      if (clientInfo.email) {
        doc.text(`Email: ${clientInfo.email}`, pageWidth - 20, clientYPosition, { align: 'right' });
      }

      yPosition = Math.max(yPosition, clientYPosition) + 20;

      // Invoice details
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Tanggal Invoice: ${formatDate(invoiceDate)}`, 20, yPosition);
      if (dueDate) {
        doc.text(`Jatuh Tempo: ${formatDate(dueDate)}`, 20, yPosition + 6);
        yPosition += 6;
      }
      yPosition += 15;

      // Items table
      const tableStartY = yPosition;
      const colWidths = [80, 25, 35, 35];
      const colPositions = [20, 100, 125, 160];

      // Table header
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPosition, pageWidth - 40, 12, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DESKRIPSI', colPositions[0] + 2, yPosition + 8);
      doc.text('QTY', colPositions[1] + 2, yPosition + 8);
      doc.text('HARGA SATUAN', colPositions[2] + 2, yPosition + 8);
      doc.text('TOTAL', colPositions[3] + 2, yPosition + 8);
      
      yPosition += 12;

      // Table rows
      doc.setFont('helvetica', 'normal');
      items.forEach((item, index) => {
        if (item.description) {
          const total = item.quantity * item.price;
          
          // Alternate row colors
          if (index % 2 === 1) {
            doc.setFillColor(250, 250, 250);
            doc.rect(20, yPosition, pageWidth - 40, 10, 'F');
          }
          
          doc.text(item.description, colPositions[0] + 2, yPosition + 7);
          doc.text(item.quantity.toString(), colPositions[1] + 2, yPosition + 7);
          doc.text(formatCurrency(item.price), colPositions[2] + 2, yPosition + 7);
          doc.text(formatCurrency(total), colPositions[3] + 2, yPosition + 7);
          yPosition += 10;
        }
      });

      // Table border
      doc.setDrawColor(200, 200, 200);
      doc.rect(20, tableStartY, pageWidth - 40, yPosition - tableStartY);
      
      // Vertical lines
      colPositions.slice(1).forEach(pos => {
        doc.line(pos, tableStartY, pos, yPosition);
      });

      yPosition += 15;

      // Totals section
      const totalsX = pageWidth - 80;
      const subtotal = calculateSubtotal();
      const tax = calculateTax();
      const total = calculateTotal();

      doc.setFont('helvetica', 'normal');
      doc.text('Subtotal:', totalsX, yPosition);
      doc.text(formatCurrency(subtotal), pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 8;

      if (taxRate > 0) {
        doc.text(`PPN (${taxRate}%):`, totalsX, yPosition);
        doc.text(formatCurrency(tax), pageWidth - 20, yPosition, { align: 'right' });
        yPosition += 8;
      }

      // Total with background
      doc.setFillColor(41, 128, 185);
      doc.rect(totalsX - 5, yPosition - 5, 85, 12, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('TOTAL:', totalsX, yPosition + 3);
      doc.text(formatCurrency(total), pageWidth - 20, yPosition + 3, { align: 'right' });
      
      doc.setTextColor(0, 0, 0);
      yPosition += 25;

      // Notes section
      if (notes) {
        doc.setFont('helvetica', 'bold');
        doc.text('Catatan:', 20, yPosition);
        yPosition += 8;
        
        doc.setFont('helvetica', 'normal');
        const noteLines = doc.splitTextToSize(notes, pageWidth - 40);
        doc.text(noteLines, 20, yPosition);
        yPosition += noteLines.length * 5 + 10;
      }

      // Footer
      const footerY = pageHeight - 30;
      doc.setDrawColor(41, 128, 185);
      doc.line(20, footerY, pageWidth - 20, footerY);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Terima kasih atas kepercayaan Anda kepada kami.', pageWidth / 2, footerY + 8, { align: 'center' });
      doc.text(`Invoice ini dibuat secara otomatis pada ${new Date().toLocaleDateString('id-ID')}`, pageWidth / 2, footerY + 15, { align: 'center' });

      // Save PDF
      const pdfBlob = doc.output('blob');
      saveAs(pdfBlob, `Invoice-${invoiceNumber}-${companyInfo.name || 'Company'}.pdf`);

    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      alert('Terjadi kesalahan saat membuat invoice PDF.');
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 dark:bg-teal-900/20 rounded-full mb-4">
            <FileSpreadsheet className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Generator Invoice Profesional
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Buat invoice profesional dengan format standar bisnis Indonesia.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-teal-900 dark:text-teal-100 mb-3">
            Fitur Invoice Profesional:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-teal-800 dark:text-teal-200">
            <li>Format standar bisnis Indonesia dengan header berwarna</li>
            <li>Perhitungan PPN otomatis sesuai regulasi Indonesia</li>
            <li>Layout profesional dengan tabel yang rapi</li>
            <li>Informasi lengkap perusahaan dan klien</li>
            <li>Nomor invoice otomatis dan tanggal jatuh tempo</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Invoice Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Detail Invoice
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nomor Invoice *
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Invoice *
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jatuh Tempo
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    PPN (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informasi Perusahaan *
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nama Perusahaan *"
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="Alamat Lengkap"
                  value={companyInfo.address}
                  onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Kota"
                    value={companyInfo.city}
                    onChange={(e) => setCompanyInfo({...companyInfo, city: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Kode Pos"
                    value={companyInfo.postalCode}
                    onChange={(e) => setCompanyInfo({...companyInfo, postalCode: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Nomor Telepon"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Website (opsional)"
                    value={companyInfo.website}
                    onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="NPWP (opsional)"
                    value={companyInfo.taxId}
                    onChange={(e) => setCompanyInfo({...companyInfo, taxId: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informasi Klien *
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nama Klien/Perusahaan *"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="Alamat Lengkap"
                  value={clientInfo.address}
                  onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Kota"
                    value={clientInfo.city}
                    onChange={(e) => setClientInfo({...clientInfo, city: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Kode Pos"
                    value={clientInfo.postalCode}
                    onChange={(e) => setClientInfo({...clientInfo, postalCode: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Nomor Telepon"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items & Preview Section */}
          <div className="space-y-6">
            {/* Items */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Item Invoice *
                </h3>
                <button
                  onClick={addItem}
                  className="flex items-center space-x-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Item</span>
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Item #{index + 1}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Deskripsi item/jasa *"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Jumlah</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Harga Satuan (IDR)</label>
                          <input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Total: </span>
                        <span className="font-semibold text-teal-600 dark:text-teal-400">
                          {formatCurrency(item.quantity * item.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ringkasan Total
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(calculateSubtotal())}
                  </span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">PPN ({taxRate}%):</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(calculateTax())}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex justify-between">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">TOTAL:</span>
                    <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Catatan & Syarat Pembayaran
              </h3>
              <textarea
                placeholder="Tambahkan catatan, syarat pembayaran, atau informasi rekening bank..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={generatePDF}
              disabled={isProcessing}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Membuat Invoice...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Unduh Invoice PDF Profesional</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🏢</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Format Bisnis</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Layout profesional sesuai standar invoice bisnis Indonesia
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">💰</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">PPN Otomatis</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Perhitungan pajak otomatis sesuai regulasi Indonesia
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Siap Cetak</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              PDF berkualitas tinggi siap untuk dicetak atau dikirim email
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;