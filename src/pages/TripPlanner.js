import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addTrip,
  removeTrip,
  setHomeCountry,
  updateTrip,
} from "../store/tripSlice";
import { setUserProfile, loadUserProfiles } from "../store/profileSlice";
import { logoutUser } from "../store/userSlice";
import defaultProfile from "../data/profiles";
import ApiService from "../services/api";

const TripPlanner = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { trips, homeCountry } = useSelector((state) => state.trip);
  const { userProfiles } = useSelector((state) => state.profile);

  const [errors, setErrors] = useState({});
  const [editingTrip, setEditingTrip] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("TRY");
  const [catalogData, setCatalogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRates, setSelectedRates] = useState({});
  const [selectedPacks, setSelectedPacks] = useState([]);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true);
        const catalog = await ApiService.getCatalog();
        setCatalogData(catalog);
        console.log(catalog);
        
        if (!homeCountry && catalog.countries) {
          const turkey = catalog.countries.find(c => c.countryCode === 'TR');
          if (turkey) {
            dispatch(setHomeCountry('TR'));
          }
        }
      } catch (error) {
        console.error('Katalog yüklenirken hata:', error);
        
        // Oturum süresi dolmuş kontrolü
        if (error.message.includes('Oturum süresi doldu')) {
          // Session süresi dolmuş, kullanıcıyı logout yap
          dispatch(logoutUser());
          return; // Catalog yüklemeyi durdur
        }
        
        // Diğer hatalar için default catalog kullan
        setCatalogData({
          countries: [
            { countryCode: 'TR', countryName: 'Turkey' },
            { countryCode: 'DE', countryName: 'Germany' },
            { countryCode: 'US', countryName: 'United States' }
          ],
          rates: [],
          packs: []
        });
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadCatalog();
    } else {
      setLoading(false);
    }
  }, [currentUser, dispatch, homeCountry]);

  const getCountries = () => {
    if (catalogData?.countries) {
      return catalogData.countries.map(country => ({
        code: country.countryCode,
        name: country.countryName,
        flag: getCountryFlag(country.countryCode)
      }));
    }
    return [
      { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
      { code: 'DE', name: 'Germany', flag: '🇩🇪' },
      { code: 'US', name: 'United States', flag: '🇺🇸' },
      { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
      { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
      { code: 'GR', name: 'Greece', flag: '🇬🇷' },
    ];
  };

  const getCountryFlag = (countryCode) => {
    const flags = {
      'TR': '🇹🇷', 'DE': '🇩🇪', 'US': '🇺🇸', 'AE': '🇦🇪', 
      'EG': '🇪🇬', 'GR': '🇬🇷', 'FR': '🇫🇷', 'IT': '🇮🇹',
      'ES': '🇪🇸', 'GB': '🇬🇧', 'NL': '🇳🇱', 'BE': '🇧🇪'
    };
    return flags[countryCode] || '🌍';
  };

  const countries = getCountries();

  const [exchangeRates] = useState({
    TRY: 1,
    USD: 0.029,
    EUR: 0.027,
    GBP: 0.023,
    JPY: 4.35,
    CAD: 0.040,
    AUD: 0.045,
    CHF: 0.026,
    CNY: 0.21,
    SEK: 0.32,
    NOK: 0.31,
    DKK: 0.20,
    PLN: 0.12,
    RUB: 2.85,
    BRL: 0.16,
    INR: 2.43,
    KRW: 38.5,
    SGD: 0.039,
    HKD: 0.23,
    MXN: 0.51,
  });

  const currencies = [
    { code: "TRY", name: "Türk Lirası", symbol: "₺" },
    { code: "USD", name: "ABD Doları", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "İngiliz Sterlini", symbol: "£" },
    { code: "JPY", name: "Japon Yeni", symbol: "¥" },
    { code: "CAD", name: "Kanada Doları", symbol: "C$" },
    { code: "AUD", name: "Avustralya Doları", symbol: "A$" },
    { code: "CHF", name: "İsviçre Frangı", symbol: "CHF" },
    { code: "CNY", name: "Çin Yuanı", symbol: "¥" },
    { code: "SEK", name: "İsveç Kronu", symbol: "kr" },
    { code: "NOK", name: "Norveç Kronu", symbol: "kr" },
    { code: "DKK", name: "Danimarka Kronu", symbol: "kr" },
    { code: "PLN", name: "Polonya Zlotisi", symbol: "zł" },
    { code: "RUB", name: "Rus Rublesi", symbol: "₽" },
    { code: "BRL", name: "Brezilya Reali", symbol: "R$" },
    { code: "INR", name: "Hindistan Rupisi", symbol: "₹" },
    { code: "KRW", name: "Güney Kore Wonu", symbol: "₩" },
    { code: "SGD", name: "Singapur Doları", symbol: "S$" },
    { code: "HKD", name: "Hong Kong Doları", symbol: "HK$" },
    { code: "MXN", name: "Meksika Pezosu", symbol: "$" },
  ];

  const convertCurrency = (amount, fromCurrency = "TRY", toCurrency = selectedCurrency) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      return 0;
    }

    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
      return numAmount;
    }

    const tryAmount = fromCurrency === "TRY" ? numAmount : numAmount / exchangeRates[fromCurrency];
    const convertedAmount = toCurrency === "TRY" ? tryAmount : tryAmount * exchangeRates[toCurrency];
    
    return Number(convertedAmount) || 0;
  };

  const formatCurrency = (amount, currencyCode = selectedCurrency) => {
    const currency = currencies.find(c => c.code === currencyCode);
    const convertedAmount = convertCurrency(amount, "TRY", currencyCode);
    
    const safeAmount = Number(convertedAmount) || 0;
    
    if (currencyCode === "TRY") {
      return `${safeAmount.toFixed(2)} ${currency?.symbol || "₺"}`;
    } else {
      return `${currency?.symbol || ""}${safeAmount.toFixed(2)}`;
    }
  };

  const getUserProfile = () => {
    if (currentUser && userProfiles[currentUser.id]) {
      return userProfiles[currentUser.id];
    }
    return defaultProfile;
  };

  const getRateForCountry = (countryCode) => {
    if (!catalogData?.rates) return null;
    return catalogData.rates.find(rate => rate.countryCode === countryCode);
  };

  const getPacksForCountry = (countryCode) => {
    if (!catalogData?.packs) return [];
    return catalogData.packs.filter(pack => 
      pack.coverageType === 'COUNTRY' && pack.coverage === countryCode ||
      pack.coverageType === 'REGION' && 
      (pack.coverage === 'Global' || 
       (pack.coverage === 'Europe' && ['DE', 'GR', 'FR', 'IT', 'ES'].includes(countryCode)))
    );
  };

  const [formData, setFormData] = useState({
    country: "",
    startDate: "",
    endDate: "",
    dailyMB: defaultProfile.dailyMB,
    dailyCallMinutes: defaultProfile.dailyCallMinutes,
    dailySMS: defaultProfile.dailySMS,
  });

  useEffect(() => {
    dispatch(loadUserProfiles());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleHomeCountryChange = (e) => {
    if (trips.length === 0) {
      dispatch(setHomeCountry(e.target.value));
    }
  };

  const handlePlanTrip = async () => {
    if (trips.length === 0) {
      alert("Planlamak için en az bir trip ekleyiniz!");
      return;
    }

    try {
      const profile = getUserProfile();
      console.log(profile);

      const simulationData = {
        user_id: currentUser?.id || "anonymous",
        trips: trips.map((trip) => ({
          country_code: trip.country,
          start_date: trip.startDate,
          end_date: trip.endDate,
        })),
        profile: {
          avg_daily_mb: profile.dailyMB,
          avg_daily_min: profile.dailyCallMinutes,
          avg_daily_sms: profile.dailySMS,
        },
      };

      console.log(simulationData);
      const result = await ApiService.simulateRoaming(simulationData);
      setSimulationResult(result);
      setShowSimulation(true);
    } catch (error) {
      console.error('Simülasyon hatası:', error);
      
      // Oturum süresi dolmuş hatası için
      if (error.message.includes('Oturum süresi doldu')) {
        alert('Oturum süreniz dolmuş. Sayfayı yenileyerek tekrar giriş yapın.');
        // Redux store'dan logout yap
        dispatch(logoutUser());
        // Sayfayı yenile
        window.location.reload();
      } else {
        alert(`Simülasyon sırasında bir hata oluştu: ${error.message}`);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.country) {
      newErrors.country = "Ülke seçimi gereklidir";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Başlangıç tarihi gereklidir";
    }

    if (!formData.endDate) {
      newErrors.endDate = "Bitiş tarihi gereklidir";
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        newErrors.startDate = "Başlangıç tarihi bugünden önce olamaz";
      }

      if (end <= start) {
        newErrors.endDate = "Bitiş tarihi başlangıç tarihinden sonra olmalıdır";
      }

      if (trips.length > 0) {
        const otherTrips = isEditMode
          ? trips.filter((trip) => trip.id !== editingTrip.id)
          : trips;

        if (otherTrips.length > 0) {
          const lastTrip = otherTrips[otherTrips.length - 1];
          const lastTripEnd = new Date(lastTrip.endDate);

          if (start <= lastTripEnd) {
            newErrors.startDate =
              "Yeni trip son tripin bitiş tarihinden sonra başlamalıdır";
          }
        }
      }
    }

    if (formData.dailyMB < 1) {
      newErrors.dailyMB = "Günlük MB en az 1 olmalıdır";
    }

    if (formData.dailyCallMinutes < 0) {
      newErrors.dailyCallMinutes = "Günlük arama süresi negatif olamaz";
    }

    if (formData.dailySMS < 0) {
      newErrors.dailySMS = "Günlük SMS sayısı negatif olamaz";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isEditMode) {
      handleUpdateTrip();
      return;
    }

    const selectedCountry = countries.find((c) => c.code === formData.country);
    const tripData = {
      country: formData.country,
      countryName: selectedCountry.name,
      countryFlag: selectedCountry.flag,
      startDate: formData.startDate,
      endDate: formData.endDate,
      dailyMB: formData.dailyMB,
      dailyCallMinutes: formData.dailyCallMinutes,
      dailySMS: formData.dailySMS,
      userId: currentUser?.id || null,
    };

    dispatch(addTrip(tripData));

    setFormData((prev) => ({
      ...prev,
      country: "",
      startDate: "",
      endDate: "",
    }));

    alert("Seyahat planı başarıyla eklendi!");
  };

  const handleRemoveTrip = (tripId) => {
    dispatch(removeTrip(tripId));
  };

  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setIsEditMode(true);
    setFormData({
      country: trip.country,
      startDate: trip.startDate,
      endDate: trip.endDate,
      dailyMB: trip.dailyMB,
      dailyCallMinutes: trip.dailyCallMinutes,
      dailySMS: trip.dailySMS,
    });
  };

  const handleCancelEdit = () => {
    setEditingTrip(null);
    setIsEditMode(false);
    const profile = getUserProfile();
    setFormData({
      country: "",
      startDate: "",
      endDate: "",
      dailyMB: profile.dailyMB,
      dailyCallMinutes: profile.dailyCallMinutes,
      dailySMS: profile.dailySMS,
    });
    setErrors({});
  };

  const handleUpdateTrip = () => {
    if (!validateForm()) {
      return;
    }

    const selectedCountry = countries.find((c) => c.code === formData.country);
    const updatedTripData = {
      id: editingTrip.id,
      country: formData.country,
      countryName: selectedCountry.name,
      countryFlag: selectedCountry.flag,
      startDate: formData.startDate,
      endDate: formData.endDate,
      dailyMB: formData.dailyMB,
      dailyCallMinutes: formData.dailyCallMinutes,
      dailySMS: formData.dailySMS,
    };

    dispatch(updateTrip(updatedTripData));
    handleCancelEdit();
    alert("Seyahat planı başarıyla güncellendi!");
  };

  const calculateTripDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatUsageData = (trip) => {
    const days = calculateTripDays(trip.startDate, trip.endDate);
    return {
      totalMB: trip.dailyMB * days,
      totalGB: ((trip.dailyMB * days) / 1024).toFixed(2),
      totalCallMinutes: trip.dailyCallMinutes * days,
      totalSMS: trip.dailySMS * days,
    };
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getHomeCountryName = () => {
    const country = countries.find((c) => c.code === homeCountry);
    return country ? country.name : "Türkiye";
  };

  const SimulationResultsPage = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Roaming Simülasyon Sonuçları
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Seyahatiniz için en ekonomik roaming çözümünü keşfedin
          </p>
          
          {/* Döviz Seçici */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Para Birimi:
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name} ({currency.code})
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setShowSimulation(false)}
              className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200"
            >
              Geri Dön
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 transition-colors duration-200">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Seyahat Özeti
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {simulationResult.summary.days}
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">Toplam Gün</p>
            </div>
            <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                {simulationResult.summary.total_need.gb} GB
              </p>
              <p className="text-sm text-green-800 dark:text-green-300 font-medium">Toplam Veri</p>
            </div>
            <div className="text-center bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
              <p className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {simulationResult.summary.total_need.min}
              </p>
              <p className="text-sm text-orange-800 dark:text-orange-300 font-medium">Toplam Dakika</p>
            </div>
            <div className="text-center bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {simulationResult.summary.total_need.sms}
              </p>
              <p className="text-sm text-purple-800 dark:text-purple-300 font-medium">Toplam SMS</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors duration-200">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Roaming Seçenekleri
          </h3>
          <div className="space-y-6">
            {simulationResult.options.map((option, index) => (
              <div
                key={index}
                className={`border-2 rounded-xl p-6 transition-all duration-200 ${
                  index === 0
                    ? "border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                }`}
              >
                {index === 0 && (
                  <div className="flex items-center mb-4">
                    <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                      🏆 EN EKONOMİK SEÇENEK
                    </span>
                  </div>
                )}

                {option.kind === "pack" ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          📦 {option.pack_name || option.pack_id}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Roaming Paketi
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(option.total_cost)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Toplam Maliyet
                        </p>
                        {selectedCurrency !== "TRY" && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            ({option.total_cost} ₺)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-4">
                        <p className="font-medium text-gray-700 dark:text-gray-200 text-sm mb-1">
                          Paket Sayısı
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {option.n_packs} adet
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-4">
                        <p className="font-medium text-gray-700 dark:text-gray-200 text-sm mb-1">
                          Kapsama
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {option.coverage_hit}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-4">
                        <p className="font-medium text-gray-700 dark:text-gray-200 text-sm mb-1">
                          Süre Uyumu
                        </p>
                        <p className={`text-lg font-bold ${
                          option.validity_ok
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {option.validity_ok ? "✅ Uygun" : "❌ Yetersiz"}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-4">
                        <p className="font-medium text-gray-700 dark:text-gray-200 text-sm mb-1">
                          Fazla Kullanım
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {option.overflow_breakdown.data_mb > 0
                            ? `${option.overflow_breakdown.data_mb}MB`
                            : "❌ Yok"}
                        </p>
                        {option.overflow_breakdown.data_mb > 0 && (
                          <p className="text-sm text-red-600 dark:text-red-400">
                            +{formatCurrency(option.overflow_breakdown.cost)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          💳 Kullandığın Kadar Öde
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Paket kullanmadan, sadece kullandığınız kadar ödeme yapın
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(option.total_cost)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Toplam Maliyet
                        </p>
                        {selectedCurrency !== "TRY" && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            ({option.total_cost} ₺)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-2">
                    {index === 0 && (
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                        🏆 Önerilen seçenek
                      </span>
                    )}
                  </div>
                  <button className="bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-lg transition-colors duration-200">
                    Bu Seçeneği Tercih Et
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* döviz */}
        {selectedCurrency !== "TRY" && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-600 rounded-lg p-4 mt-6">
            <p className="text-yellow-800 dark:text-yellow-300 text-sm">
              💱 Döviz Kuru: 1 TRY = {formatCurrency(1, selectedCurrency).replace(/[^\d.,]/g, '')} {selectedCurrency}
              <span className="text-xs ml-2">(Güncel kur ile hesaplanmıştır)</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {!currentUser ? (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Giriş Yapmanız Gerekiyor
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Seyahat planlayıcısını kullanmak için lütfen giriş yapın veya hesap oluşturun.
            </p>
            <div className="space-y-3">
              <a href="/login" className="block w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                Giriş Yap
              </a>
              <a href="/register" className="block w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                Hesap Oluştur
              </a>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Katalog Yükleniyor
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Roaming paketleri ve tarifeleri getiriliyor...
            </p>
          </div>
        </div>
      ) : showSimulation ? (
        <SimulationResultsPage />
      ) : (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Seyahat Planlayıcı
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                Seyahat planınızı oluşturun ve en ekonomik roaming çözümünü
                bulun
              </p>
            </div>

            <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Başlangıç Ülkesi:
                  </h3>
                  {trips.length === 0 ? (
                    <select
                      value={homeCountry}
                      onChange={handleHomeCountryChange}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                      <span className="text-xl">
                        {countries.find((c) => c.code === homeCountry)?.flag}
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {getHomeCountryName()}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        (Sabitlendi)
                      </span>
                    </div>
                  )}
                </div>
                {trips.length > 0 && (
                  <button
                    onClick={handlePlanTrip}
                    className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span>Planla</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* trip form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {isEditMode ? "Seyahat Düzenle" : "Yeni Seyahat Ekle"}
                    </h2>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* countryy */}
                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Gidilecek Ülke
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                          errors.country ? "border-red-300" : "border-gray-300"
                        }`}
                      >
                        <option value="">Ülke seçiniz</option>
                        {countries
                          .filter((c) => c.code !== homeCountry)
                          .map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.flag} {country.name}
                            </option>
                          ))}
                      </select>
                      {errors.country && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.country}
                        </p>
                      )}
                    </div>

                    {/* Country Rate and Packages Info */}
                    {formData.country && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-3">
                          📊 {countries.find(c => c.code === formData.country)?.name} Bilgileri
                        </h4>
                        
                        {/* rate info */}
                        {getRateForCountry(formData.country) && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                              💰 Kullandığın Kadar Öde Tarifeleri:
                            </h5>
                            <div className="grid grid-cols-3 gap-3 text-xs">
                              <div className="bg-white dark:bg-gray-700 rounded p-2">
                                <span className="text-gray-600 dark:text-gray-400">Veri/MB:</span>
                                <span className="font-medium text-blue-600 dark:text-blue-400 ml-1">
                                  {getRateForCountry(formData.country).dataPerMb} {getRateForCountry(formData.country).currency}
                                </span>
                              </div>
                              <div className="bg-white dark:bg-gray-700 rounded p-2">
                                <span className="text-gray-600 dark:text-gray-400">Arama/dk:</span>
                                <span className="font-medium text-green-600 dark:text-green-400 ml-1">
                                  {getRateForCountry(formData.country).voicePerMin} {getRateForCountry(formData.country).currency}
                                </span>
                              </div>
                              <div className="bg-white dark:bg-gray-700 rounded p-2">
                                <span className="text-gray-600 dark:text-gray-400">SMS:</span>
                                <span className="font-medium text-purple-600 dark:text-purple-400 ml-1">
                                  {getRateForCountry(formData.country).smsPerMsg} {getRateForCountry(formData.country).currency}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* paketler */}
                        {getPacksForCountry(formData.country).length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                              📦 Mevcut Paketler ({getPacksForCountry(formData.country).length} adet):
                            </h5>
                            <div className="space-y-2">
                              {getPacksForCountry(formData.country).slice(0, 2).map(pack => (
                                <div key={pack.id} className="bg-white dark:bg-gray-700 rounded p-3 border border-blue-200 dark:border-blue-600">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <span className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                                        {pack.name}
                                      </span>
                                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        {pack.dataGb}GB • {pack.voiceMin}dk • {pack.sms}SMS • {pack.validityDays} gün
                                      </div>
                                    </div>
                                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                      {pack.price} {pack.currency}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {getPacksForCountry(formData.country).length > 2 && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
                                  +{getPacksForCountry(formData.country).length - 2} paket daha...
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* dates */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="startDate"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Başlangıç Tarihi
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                            errors.startDate
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.startDate && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.startDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="endDate"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Bitiş Tarihi
                        </label>
                        <input
                          type="date"
                          id="endDate"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                            errors.endDate
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.endDate && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.endDate}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* trip duration */}
                    {calculateDays() > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800">
                          <span className="font-medium">Seyahat Süresi:</span>{" "}
                          {calculateDays()} gün
                        </p>
                      </div>
                    )}

                    {/* profile */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Kullanım Detayları
                        </h3>
                        <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          Varsayılan Profil
                        </span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Günlük MB
                          </label>
                          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600">
                            {formData.dailyMB} MB
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Günlük Arama (dk)
                          </label>
                          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600">
                            {formData.dailyCallMinutes} dk
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Günlük SMS
                          </label>
                          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600">
                            {formData.dailySMS} adet
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-3">
                        Kullanım detaylarını değiştirmek için yukarıdan farklı
                        bir profil seçin.
                      </p>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                      >
                        {isEditMode ? "Güncelle" : "Trip Ekle"}
                      </button>
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                          İptal
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* trip list */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Seyahat Programı
                  </h3>

                  {trips.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">
                        Henüz trip eklenmemiş
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        İlk seyahatinizi ekleyin
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* home country */}
                      <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">
                            {
                              countries.find((c) => c.code === homeCountry)
                                ?.flag
                            }
                          </span>
                          <span className="font-medium text-green-800 text-sm">
                            {getHomeCountryName()}
                          </span>
                          <span className="text-xs text-green-600 bg-green-200 px-2 py-1 rounded">
                            Başlangıç
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {trips.map((trip, index) => (
                          <div
                            key={trip.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            {/* trip header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">
                                    {index + 1}
                                  </span>
                                </div>
                                <span className="text-2xl">
                                  {trip.countryFlag}
                                </span>
                                <div>
                                  <h3 className="font-semibold text-gray-900 text-base">
                                    {trip.countryName}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {new Date(
                                      trip.startDate
                                    ).toLocaleDateString("tr-TR")}{" "}
                                    -{" "}
                                    {new Date(trip.endDate).toLocaleDateString(
                                      "tr-TR"
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditTrip(trip)}
                                  className="text-blue-600 hover:text-blue-800 text-sm p-1 rounded hover:bg-blue-50"
                                  title="Düzenle"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleRemoveTrip(trip.id)}
                                  className="text-red-500 hover:text-red-700 text-sm p-1 rounded hover:bg-red-50"
                                  title="Sil"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* summary */}
                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-blue-600">
                                    {calculateTripDays(
                                      trip.startDate,
                                      trip.endDate
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-600 uppercase tracking-wide">
                                    Toplam Gün
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-lg font-semibold text-gray-800">
                                    {(
                                      (trip.dailyMB *
                                        calculateTripDays(
                                          trip.startDate,
                                          trip.endDate
                                        )) /
                                      1024
                                    ).toFixed(1)}{" "}
                                    GB
                                  </p>
                                  <p className="text-xs text-gray-600 uppercase tracking-wide">
                                    Toplam Veri
                                  </p>
                                </div>
                              </div>

                              <div className="border-t pt-2">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  Günlük Kullanım Tahmini:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                    📱 {trip.dailyMB} MB
                                  </span>
                                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                    📞 {trip.dailyCallMinutes} dk
                                  </span>
                                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                    💬 {trip.dailySMS} SMS
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TripPlanner;
