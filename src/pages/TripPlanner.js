import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addTrip,
  removeTrip,
  setHomeCountry,
  updateTrip,
} from "../store/tripSlice";
import { setUserProfile, loadUserProfiles } from "../store/profileSlice";
import countries from "../data/countries";
import defaultProfile from "../data/profiles";
import { mockSimulate, mockCatalog } from "../data/mockApiData";

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
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [showProfileSelection, setShowProfileSelection] = useState(true);
  const [catalogProfiles] = useState([
    {
      id: "light",
      name: "Hafif Kullanım",
      dailyMB: 50,
      dailyCallMinutes: 5,
      dailySMS: 3,
      description: "Az internet, az arama",
    },
    {
      id: "medium",
      name: "Orta Kullanım",
      dailyMB: 200,
      dailyCallMinutes: 15,
      dailySMS: 10,
      description: "Sosyal medya, haritalar",
    },
    {
      id: "heavy",
      name: "Yoğun Kullanım",
      dailyMB: 500,
      dailyCallMinutes: 30,
      dailySMS: 20,
      description: "Video, müzik, çok arama",
    },
    {
      id: "business",
      name: "İş Kullanımı",
      dailyMB: 1000,
      dailyCallMinutes: 60,
      dailySMS: 50,
      description: "Video konferans, sürekli bağlantı",
    },
  ]);

  const getUserProfile = () => {
    if (selectedCatalog) {
      return selectedCatalog;
    }
    if (currentUser && userProfiles[currentUser.id]) {
      return userProfiles[currentUser.id];
    }
    return defaultProfile;
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

  useEffect(() => {
    if (selectedCatalog) {
      const profile = getUserProfile();
      setFormData((prev) => ({
        ...prev,
        dailyMB: profile.dailyMB,
        dailyCallMinutes: profile.dailyCallMinutes,
        dailySMS: profile.dailySMS,
      }));
    }
  }, [selectedCatalog]);

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

  const handlePlanTrip = () => {
    if (trips.length === 0) {
      alert("Planlamak için en az bir trip ekleyiniz!");
      return;
    }

    // Prepare simulation data
    const profile = getUserProfile();
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

    // Call mock simulate function
    const result = mockSimulate(simulationData);
    setSimulationResult(result);
    setShowSimulation(true);
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

      // Check if dates overlap with existing trips (exclude current trip when editing)
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

    // Reset only trip-specific fields
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

  const SimulationModal = () => {
    if (!showSimulation || !simulationResult) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Roaming Simülasyon Sonuçları
              </h2>
              <button
                onClick={() => setShowSimulation(false)}
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
            </div>
          </div>

          <div className="p-6">
            {/* Summary Section */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Seyahat Özeti
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {simulationResult.summary.days}
                  </p>
                  <p className="text-sm text-blue-800">Toplam Gün</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {simulationResult.summary.total_need.gb} GB
                  </p>
                  <p className="text-sm text-green-800">Toplam Veri</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">
                    {simulationResult.summary.total_need.min}
                  </p>
                  <p className="text-sm text-orange-800">Toplam Dakika</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {simulationResult.summary.total_need.sms}
                  </p>
                  <p className="text-sm text-purple-800">Toplam SMS</p>
                </div>
              </div>
            </div>

            {/* Options Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Roaming Seçenekleri
              </h3>
              <div className="space-y-4">
                {simulationResult.options.map((option, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      index === 0
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200"
                    }`}
                  >
                    {index === 0 && (
                      <div className="flex items-center mb-2">
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          EN EKONOMİK
                        </span>
                      </div>
                    )}

                    {option.kind === "pack" ? (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {option.pack_name || option.pack_id}
                          </h4>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {option.total_cost} {option.currency}
                            </p>
                            <p className="text-sm text-gray-600">
                              Toplam Maliyet
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">
                              Paket Sayısı
                            </p>
                            <p className="text-gray-600">
                              {option.n_packs} adet
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Kapsama</p>
                            <p className="text-gray-600">
                              {option.coverage_hit}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">
                              Süre Uyumu
                            </p>
                            <p
                              className={
                                option.validity_ok
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {option.validity_ok ? "Uygun" : "Yetersiz"}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">
                              Fazla Kullanım
                            </p>
                            <p className="text-gray-600">
                              {option.overflow_breakdown.data_mb > 0
                                ? `${option.overflow_breakdown.data_mb}MB (+${option.overflow_breakdown.cost}₺)`
                                : "Yok"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-gray-900">
                            Kullandığın Kadar Öde
                          </h4>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {option.total_cost} {option.currency}
                            </p>
                            <p className="text-sm text-gray-600">
                              Toplam Maliyet
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Paket kullanmadan, sadece kullandığınız kadar ödeme
                          yapın.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={() => setShowSimulation(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const handleSelectCatalog = (profile) => {
    setSelectedCatalog(profile);
    setShowProfileSelection(false);
    setFormData((prev) => ({
      ...prev,
      dailyMB: profile.dailyMB,
      dailyCallMinutes: profile.dailyCallMinutes,
      dailySMS: profile.dailySMS,
    }));
  };

  const ProfileSelectionPage = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Kullanım Profilinizi Seçin
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Seyahat ihtiyaçlarınıza en uygun profili seçerek başlayın
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {catalogProfiles.map((profile) => (
              <div
                key={profile.id}
                onClick={() => handleSelectCatalog(profile)}
                className="border-2 border-gray-200 dark:border-gray-600 rounded-xl p-6 cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all transform hover:scale-105 bg-white dark:bg-gray-700"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {profile.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {profile.description}
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Günlük Veri:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {profile.dailyMB} MB
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Günlük Arama:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {profile.dailyCallMinutes} dk
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Günlük SMS:</span>
                    <span className="font-medium text-purple-600 dark:text-purple-400">
                      {profile.dailySMS} adet
                    </span>
                  </div>
                </div>

                <div className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg p-3 text-center">
                  <p className="text-sm font-medium">
                    Bu profili seçmek için tıklayın
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-3">
              📋 Katalog Bilgisi
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-blue-800 dark:text-blue-300 font-medium">Ülke Sayısı:</p>
                <p className="text-blue-700 dark:text-blue-400 text-lg">
                  {mockCatalog.countries.length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-blue-800 dark:text-blue-300 font-medium">Paket Sayısı:</p>
                <p className="text-blue-700 dark:text-blue-400 text-lg">
                  {mockCatalog.packs.length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-blue-800 dark:text-blue-300 font-medium">Güncel Tarife:</p>
                <p className="text-blue-700 dark:text-blue-400 text-lg">2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showProfileSelection ? (
        <ProfileSelectionPage />
      ) : (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Seyahat Planlayıcı
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                Seyahat planınızı oluşturun ve en ekonomik roaming çözümünü
                bulun
              </p>

              {selectedCatalog && (
                <div className="flex items-center justify-center space-x-4">
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2">
                    <span className="text-yellow-800 font-medium">
                      Seçili Profil: {selectedCatalog.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowProfileSelection(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Profil Değiştir
                  </button>
                </div>
              )}
            </div>

            {/* Home Country Display */}
            <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Başlangıç Ülkesi:
                  </h3>
                  {trips.length === 0 ? (
                    <select
                      value={homeCountry}
                      onChange={handleHomeCountryChange}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
                      <span className="text-xl">
                        {countries.find((c) => c.code === homeCountry)?.flag}
                      </span>
                      <span className="font-medium text-gray-700">
                        {getHomeCountryName()}
                      </span>
                      <span className="text-sm text-gray-500">
                        (Sabitlendi)
                      </span>
                    </div>
                  )}
                </div>
                {trips.length > 0 && (
                  <button
                    onClick={handlePlanTrip}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
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
              {/* Trip Form */}
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
                    {/* Country Selection */}
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

                    {/* Date Selection */}
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

                    {/* Trip Duration Info */}
                    {calculateDays() > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800">
                          <span className="font-medium">Seyahat Süresi:</span>{" "}
                          {calculateDays()} gün
                        </p>
                      </div>
                    )}

                    {/* Usage Profile */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Kullanım Detayları
                        </h3>
                        <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {selectedCatalog
                            ? selectedCatalog.name
                            : "Varsayılan"}
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

                    {/* Submit Button */}
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

              {/* Trip List Sidebar */}
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
                      {/* Home Country Entry */}
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
                            {/* Trip Header */}
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

                            {/* Trip Summary */}
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

          {/* Simulation Modal */}
          <SimulationModal />
        </div>
      )}
    </>
  );
};

export default TripPlanner;
