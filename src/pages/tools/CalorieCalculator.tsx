import React, { useState, useEffect } from 'react';
import { ArrowLeft, Utensils, Calculator, Activity, Info, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CalorieResult {
  bmr: number;
  tdee: number;
  adjustedCalories: number;
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  weightGoal: {
    currentWeight: number;
    targetWeight: number | null;
    timeToReach: number | null;
    deficitPerDay: number | null;
  };
}

const CalorieCalculator: React.FC = () => {
  // Form state
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [targetWeight, setTargetWeight] = useState<number | ''>('');
  const [activityLevel, setActivityLevel] = useState<string>('moderate');
  const [goal, setGoal] = useState<string>('maintain');
  
  // Result state
  const [result, setResult] = useState<CalorieResult | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Activity level multipliers
  const activityMultipliers = {
    sedentary: 1.2,      // Little or no exercise
    light: 1.375,        // Light exercise 1-3 days/week
    moderate: 1.55,      // Moderate exercise 3-5 days/week
    active: 1.725,       // Hard exercise 6-7 days/week
    veryActive: 1.9      // Very hard exercise & physical job
  };

  // Goal adjustments (in percentage)
  const goalAdjustments = {
    lose: -20,           // Lose weight (20% deficit)
    maintain: 0,         // Maintain weight
    gain: 15,            // Gain weight (15% surplus)
    muscle: 20           // Build muscle (20% surplus)
  };

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = (gender: string, weight: number, height: number, age: number): number => {
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  // Calculate calories
  const calculateCalories = () => {
    // Validate inputs
    if (age === '' || height === '' || weight === '') {
      setError('Mohon lengkapi usia, tinggi, dan berat badan Anda.');
      return;
    }

    if (typeof age !== 'number' || typeof height !== 'number' || typeof weight !== 'number' || 
        age <= 0 || height <= 0 || weight <= 0) {
      setError('Nilai usia, tinggi, dan berat badan harus lebih dari 0.');
      return;
    }

    setError('');

    // Calculate BMR
    const bmr = calculateBMR(gender, weight, height, age);
    
    // Calculate TDEE (Total Daily Energy Expenditure)
    const activityMultiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || activityMultipliers.moderate;
    const tdee = bmr * activityMultiplier;
    
    // Adjust calories based on goal
    const goalAdjustment = goalAdjustments[goal as keyof typeof goalAdjustments] || goalAdjustments.maintain;
    const adjustedCalories = (tdee * goalAdjustment) / 100;
    const totalCalories = tdee + adjustedCalories;
    
    // Calculate macros (protein, carbs, fat)
    // Protein: 20% of calories (4 calories per gram)
    // Carbs: 50% of calories (4 calories per gram)
    // Fat: 30% of calories (9 calories per gram)
    const protein = (totalCalories * 0.2) / 4;
    const carbs = (totalCalories * 0.5) / 4;
    const fat = (totalCalories * 0.3) / 9;
    
    // Calculate weight goal timeline
    let timeToReach = null;
    let deficitPerDay = null;
    
    if (targetWeight !== '' && typeof targetWeight === 'number' && targetWeight > 0) {
      const weightDifference = weight - targetWeight;
      
      if (weightDifference !== 0) {
        // If losing weight (goal is "lose" and target < current)
        if (goal === 'lose' && targetWeight < weight) {
          // Assuming 1kg of fat = 7700 calories
          // Daily deficit = adjusted calories (negative)
          deficitPerDay = Math.abs(adjustedCalories);
          // Time to reach = (weight difference * 7700) / daily deficit
          timeToReach = (weightDifference * 7700) / deficitPerDay / 7; // in weeks
        }
        // If gaining weight (goal is "gain"/"muscle" and target > current)
        else if ((goal === 'gain' || goal === 'muscle') && targetWeight > weight) {
          // Assuming 1kg of weight gain = 7700 calories
          // Daily surplus = adjusted calories (positive)
          deficitPerDay = adjustedCalories;
          // Time to reach = (weight difference * 7700) / daily surplus
          timeToReach = (Math.abs(weightDifference) * 7700) / deficitPerDay / 7; // in weeks
        }
      }
    }
    
    // Set result
    setResult({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      adjustedCalories: Math.round(adjustedCalories),
      totalCalories: Math.round(totalCalories),
      macros: {
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fat: Math.round(fat)
      },
      weightGoal: {
        currentWeight: weight,
        targetWeight: targetWeight !== '' ? targetWeight : null,
        timeToReach,
        deficitPerDay
      }
    });

    setShowResult(true);
  };

  // Reset form
  const resetForm = () => {
    setGender('male');
    setAge('');
    setHeight('');
    setWeight('');
    setTargetWeight('');
    setActivityLevel('moderate');
    setGoal('maintain');
    setResult(null);
    setShowResult(false);
    setError('');
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString('id-ID');
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
            <Utensils className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Kalkulator Kalori
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Hitung estimasi kebutuhan kalori harian Anda berdasarkan aktivitas dan tujuan.
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
                Kalkulator ini memberikan estimasi kebutuhan kalori berdasarkan rumus standar. Hasil perhitungan bersifat perkiraan dan tidak menggantikan saran dari profesional kesehatan. Konsultasikan dengan dokter atau ahli gizi untuk rekomendasi diet yang disesuaikan dengan kondisi kesehatan Anda.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Informasi Pribadi
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
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-600"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Pria</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === 'female'}
                      onChange={() => setGender('female')}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-600"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Wanita</span>
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Usia
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
                    placeholder="Tahun"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tinggi Badan
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value ? parseFloat(e.target.value) : '')}
                      placeholder="cm"
                      className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Berat Badan
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : '')}
                      placeholder="kg"
                      className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Berat Target (Opsional)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(e.target.value ? parseFloat(e.target.value) : '')}
                      placeholder="kg"
                      className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tingkat Aktivitas
                </label>
                <select 
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="sedentary">Sangat Rendah (Jarang Berolahraga)</option>
                  <option value="light">Rendah (Olahraga Ringan 1-3 hari/minggu)</option>
                  <option value="moderate">Sedang (Olahraga Moderat 3-5 hari/minggu)</option>
                  <option value="active">Tinggi (Olahraga Berat 6-7 hari/minggu)</option>
                  <option value="veryActive">Sangat Tinggi (Atlet/Pekerjaan Fisik Berat)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tujuan
                </label>
                <select 
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="lose">Menurunkan Berat Badan</option>
                  <option value="maintain">Mempertahankan Berat Badan</option>
                  <option value="gain">Menambah Berat Badan</option>
                  <option value="muscle">Membangun Otot</option>
                </select>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={calculateCalories}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Calculator className="w-5 h-5" />
                  <span>Hitung Kebutuhan Kalori</span>
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
              <>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Hasil Perhitungan
                  </h3>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800 mb-4">
                    <div className="text-center">
                      <div className="text-sm text-red-700 dark:text-red-300 mb-1">
                        Kebutuhan Kalori Harian
                      </div>
                      <div className="text-3xl font-bold text-red-800 dark:text-red-200">
                        {formatNumber(result.totalCalories)}
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                        kalori per hari
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">BMR (Basal Metabolic Rate)</span>
                          <span className="text-gray-900 dark:text-white font-medium">{formatNumber(result.bmr)} kalori</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">TDEE (Total Daily Energy Expenditure)</span>
                          <span className="text-gray-900 dark:text-white font-medium">{formatNumber(result.tdee)} kalori</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Penyesuaian untuk Tujuan</span>
                          <span className={`font-medium ${result.adjustedCalories >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {result.adjustedCalories >= 0 ? '+' : ''}{formatNumber(result.adjustedCalories)} kalori
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Distribusi Makronutrien yang Direkomendasikan
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                          <div className="text-sm text-blue-700 dark:text-blue-300">Protein</div>
                          <div className="text-lg font-bold text-blue-800 dark:text-blue-200">{result.macros.protein}g</div>
                          <div className="text-xs text-blue-600 dark:text-blue-400">20%</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                          <div className="text-sm text-green-700 dark:text-green-300">Karbohidrat</div>
                          <div className="text-lg font-bold text-green-800 dark:text-green-200">{result.macros.carbs}g</div>
                          <div className="text-xs text-green-600 dark:text-green-400">50%</div>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
                          <div className="text-sm text-yellow-700 dark:text-yellow-300">Lemak</div>
                          <div className="text-lg font-bold text-yellow-800 dark:text-yellow-200">{result.macros.fat}g</div>
                          <div className="text-xs text-yellow-600 dark:text-yellow-400">30%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weight Goal - Only show if target weight is provided */}
                {result.weightGoal.targetWeight && result.weightGoal.timeToReach && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Proyeksi Berat Badan
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Berat Saat Ini</div>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">{result.weightGoal.currentWeight} kg</div>
                        </div>
                        <div className="text-2xl text-gray-300 dark:text-gray-600">→</div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Berat Target</div>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">{result.weightGoal.targetWeight} kg</div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimasi Waktu</span>
                          <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                            {Math.ceil(result.weightGoal.timeToReach)} minggu
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Berdasarkan {result.weightGoal.deficitPerDay ? Math.abs(Math.round(result.weightGoal.deficitPerDay)) : 0} kalori {result.adjustedCalories < 0 ? 'defisit' : 'surplus'}/hari ({Math.abs(result.weightGoal.currentWeight - result.weightGoal.targetWeight) / Math.ceil(result.weightGoal.timeToReach)} kg/minggu)
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-start space-x-2">
                          <Activity className="w-4 h-4 mt-0.5 text-gray-500" />
                          <p>
                            {result.adjustedCalories < 0 
                              ? 'Penurunan berat badan yang sehat dan berkelanjutan adalah 0.5-1 kg per minggu. Penurunan yang lebih cepat dapat menyebabkan kehilangan massa otot dan efek yo-yo.'
                              : 'Penambahan berat badan yang sehat adalah 0.25-0.5 kg per minggu untuk memaksimalkan penambahan massa otot dan meminimalkan penambahan lemak.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Nutrition Tips */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">
                Tips Nutrisi
              </h3>
              
              <div className="space-y-3 text-red-800 dark:text-red-200">
                <p className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Fokus pada makanan bergizi padat seperti buah-buahan, sayuran, protein tanpa lemak, dan biji-bijian utuh.</span>
                </p>
                <p className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Minum cukup air (minimal 8 gelas per hari) untuk mendukung metabolisme dan fungsi tubuh.</span>
                </p>
                <p className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Batasi makanan olahan, gula tambahan, dan minuman berkalori tinggi.</span>
                </p>
                <p className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Perubahan pola makan yang berkelanjutan lebih efektif daripada diet ketat jangka pendek.</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🔬</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Akurat</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Menggunakan rumus Mifflin-St Jeor yang diakui secara ilmiah
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🥗</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Makronutrien</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Rekomendasi distribusi protein, karbohidrat, dan lemak
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">⚖️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Multi Tujuan</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Penurunan, pemeliharaan, atau penambahan berat badan
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Proyeksi</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Estimasi waktu untuk mencapai berat badan target
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalorieCalculator;