import React, { useState, useEffect } from 'react';
import { ArrowLeft, Thermometer, Calculator, Info, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BMIResult {
  bmi: number;
  category: string;
  healthRisk: string;
  idealWeightRange: {
    min: number;
    max: number;
  };
  color: string;
}

const BMICalculator: React.FC = () => {
  // Form state
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'm' | 'ft' | 'in'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  
  // Result state
  const [result, setResult] = useState<BMIResult | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Convert height to meters based on the selected unit
  const convertHeightToMeters = (value: number, unit: string): number => {
    switch (unit) {
      case 'cm':
        return value / 100;
      case 'm':
        return value;
      case 'ft':
        return value * 0.3048;
      case 'in':
        return value * 0.0254;
      default:
        return value;
    }
  };

  // Convert weight to kg based on the selected unit
  const convertWeightToKg = (value: number, unit: string): number => {
    switch (unit) {
      case 'kg':
        return value;
      case 'lbs':
        return value * 0.453592;
      default:
        return value;
    }
  };

  // Calculate BMI
  const calculateBMI = () => {
    // Validate inputs
    if (height === '' || weight === '') {
      setError('Mohon lengkapi tinggi dan berat badan Anda.');
      return;
    }

    if (typeof height !== 'number' || typeof weight !== 'number' || height <= 0 || weight <= 0) {
      setError('Nilai tinggi dan berat badan harus lebih dari 0.');
      return;
    }

    setError('');

    // Convert height to meters and weight to kg
    const heightInMeters = convertHeightToMeters(height, heightUnit);
    const weightInKg = convertWeightToKg(weight, weightUnit);

    // Calculate BMI: weight (kg) / (height (m) * height (m))
    const bmiValue = weightInKg / (heightInMeters * heightInMeters);
    
    // Determine BMI category and health risk
    let category = '';
    let healthRisk = '';
    let color = '';

    if (bmiValue < 18.5) {
      category = 'Kekurangan Berat Badan';
      healthRisk = 'Sedang';
      color = 'blue';
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      category = 'Berat Badan Normal';
      healthRisk = 'Rendah';
      color = 'green';
    } else if (bmiValue >= 25 && bmiValue < 30) {
      category = 'Kelebihan Berat Badan';
      healthRisk = 'Sedang';
      color = 'yellow';
    } else {
      category = 'Obesitas';
      healthRisk = 'Tinggi';
      color = 'red';
    }

    // Calculate ideal weight range (BMI between 18.5 and 24.9)
    const idealWeightMin = 18.5 * (heightInMeters * heightInMeters);
    const idealWeightMax = 24.9 * (heightInMeters * heightInMeters);

    // Set result
    setResult({
      bmi: bmiValue,
      category,
      healthRisk,
      idealWeightRange: {
        min: idealWeightMin,
        max: idealWeightMax
      },
      color
    });

    setShowResult(true);
  };

  // Reset form
  const resetForm = () => {
    setGender('male');
    setAge('');
    setHeight('');
    setWeight('');
    setHeightUnit('cm');
    setWeightUnit('kg');
    setResult(null);
    setShowResult(false);
    setError('');
  };

  // Get BMI category color class
  const getBmiColorClass = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
      case 'green':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200';
      case 'yellow':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200';
      case 'red':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200';
    }
  };

  // Get BMI indicator position
  const getBmiIndicatorPosition = (bmi: number) => {
    // Calculate position percentage based on BMI value
    // Assuming the scale goes from 15 to 35
    const minBmi = 15;
    const maxBmi = 35;
    const clampedBmi = Math.min(Math.max(bmi, minBmi), maxBmi);
    const percentage = ((clampedBmi - minBmi) / (maxBmi - minBmi)) * 100;
    return `${percentage}%`;
  };

  // Format number to 1 decimal place
  const formatNumber = (num: number): string => {
    return num.toFixed(1);
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
            <Thermometer className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Kalkulator IMT / BMI
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Hitung Indeks Massa Tubuh untuk mengetahui status berat badan.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                Disclaimer Medis
              </h3>
              <p className="text-yellow-800 dark:text-yellow-200">
                Kalkulator IMT ini hanya untuk referensi umum dan bukan pengganti konsultasi medis profesional. IMT memiliki keterbatasan dan tidak memperhitungkan faktor seperti komposisi tubuh, distribusi lemak, atau kondisi kesehatan spesifik. Konsultasikan dengan dokter atau ahli gizi untuk evaluasi kesehatan yang komprehensif.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Hitung IMT Anda
            </h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jenis Kelamin
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === 'male'}
                      onChange={() => setGender('male')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Pria</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === 'female'}
                      onChange={() => setGender('female')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Wanita</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Usia
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="Masukkan usia Anda"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tinggi Badan
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="Masukkan tinggi badan"
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <select
                    value={heightUnit}
                    onChange={(e) => setHeightUnit(e.target.value as 'cm' | 'm' | 'ft' | 'in')}
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="cm">cm</option>
                    <option value="m">m</option>
                    <option value="ft">ft</option>
                    <option value="in">in</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Berat Badan
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="Masukkan berat badan"
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <select
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lbs')}
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={calculateBMI}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Calculator className="w-5 h-5" />
                  <span>Hitung IMT</span>
                </button>
                
                <button 
                  onClick={resetForm}
                  className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {showResult && result && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Hasil IMT
                </h3>
                
                <div className={`rounded-lg p-6 border mb-4 ${
                  result.color === 'green' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : result.color === 'blue'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      : result.color === 'yellow'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className="text-center">
                    <div className={`text-sm mb-1 ${
                      result.color === 'green' 
                        ? 'text-green-700 dark:text-green-300' 
                        : result.color === 'blue'
                          ? 'text-blue-700 dark:text-blue-300'
                          : result.color === 'yellow'
                            ? 'text-yellow-700 dark:text-yellow-300'
                            : 'text-red-700 dark:text-red-300'
                    }`}>
                      Indeks Massa Tubuh (IMT)
                    </div>
                    <div className={`text-3xl font-bold mb-2 ${
                      result.color === 'green' 
                        ? 'text-green-800 dark:text-green-200' 
                        : result.color === 'blue'
                          ? 'text-blue-800 dark:text-blue-200'
                          : result.color === 'yellow'
                            ? 'text-yellow-800 dark:text-yellow-200'
                            : 'text-red-800 dark:text-red-200'
                    }`}>
                      {formatNumber(result.bmi)}
                    </div>
                    <div className={`mt-2 inline-block px-3 py-1 text-sm font-medium rounded-full ${getBmiColorClass(result.color)}`}>
                      {result.category}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Kategori IMT
                    </h4>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                      <div className="flex h-full">
                        <div className="bg-blue-500 w-[16.6%]"></div>
                        <div className="bg-green-500 w-[33.4%]"></div>
                        <div className="bg-yellow-500 w-[33.4%]"></div>
                        <div className="bg-red-500 w-[16.6%]"></div>
                      </div>
                      {/* BMI Indicator */}
                      <div 
                        className="absolute top-0 w-4 h-6 bg-white dark:bg-gray-200 border-2 border-gray-800 dark:border-white rounded-full -ml-2"
                        style={{ left: getBmiIndicatorPosition(result.bmi) }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <span>Kurus</span>
                      <span>Normal</span>
                      <span>Kelebihan</span>
                      <span>Obesitas</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Berat Badan Ideal</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formatNumber(result.idealWeightRange.min)} - {formatNumber(result.idealWeightRange.max)} kg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Kategori</span>
                        <span className={`font-medium ${
                          result.color === 'green' 
                            ? 'text-green-600 dark:text-green-400' 
                            : result.color === 'blue'
                              ? 'text-blue-600 dark:text-blue-400'
                              : result.color === 'yellow'
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-red-600 dark:text-red-400'
                        }`}>
                          {result.category}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Risiko Kesehatan</span>
                        <span className="text-gray-900 dark:text-white font-medium">{result.healthRisk}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BMI Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Kategori IMT
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center p-2 rounded-lg">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-gray-900 dark:text-white font-medium">Kekurangan Berat Badan</span>
                      <span className="text-gray-600 dark:text-gray-400">&lt; 18.5</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center p-2 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-gray-900 dark:text-white font-medium">Berat Badan Normal</span>
                      <span className="text-gray-600 dark:text-gray-400">18.5 - 24.9</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center p-2 rounded-lg">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-gray-900 dark:text-white font-medium">Kelebihan Berat Badan</span>
                      <span className="text-gray-600 dark:text-gray-400">25.0 - 29.9</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center p-2 rounded-lg">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-gray-900 dark:text-white font-medium">Obesitas</span>
                      <span className="text-gray-600 dark:text-gray-400">≥ 30.0</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Kategori IMT berdasarkan standar WHO (World Health Organization).
                </p>
              </div>
            </div>

            {/* Health Tips */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
                Tips Kesehatan
              </h3>
              
              <div className="space-y-3 text-green-800 dark:text-green-200">
                <p className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>IMT adalah alat skrining, bukan alat diagnostik. Konsultasikan dengan profesional kesehatan untuk evaluasi menyeluruh.</span>
                </p>
                <p className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Pola makan seimbang dan aktivitas fisik teratur adalah kunci untuk berat badan yang sehat.</span>
                </p>
                <p className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Perubahan berat badan yang sehat dan berkelanjutan adalah 0.5-1 kg per minggu.</span>
                </p>
                <p className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Jika IMT Anda di luar rentang normal, pertimbangkan untuk berkonsultasi dengan dokter atau ahli gizi.</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Akurat</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Perhitungan IMT berdasarkan standar WHO
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🔄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Multi Unit</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Mendukung metrik (kg/cm) dan imperial (lbs/ft)
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📱</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Responsif</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Berfungsi di semua perangkat: desktop, tablet, dan mobile
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🔒</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Privasi</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Semua perhitungan dilakukan di browser, data tidak dikirim
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BMICalculator;