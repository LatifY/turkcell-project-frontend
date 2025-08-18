import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const HomePage = () => {
  const { currentUser, isLoggedIn } = useSelector((state) => state.user);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          {isLoggedIn && currentUser ? (
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Hoş Geldiniz, {currentUser.name}!
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                Mevcut Planınız: <span className="font-semibold text-yellow-600">{currentUser.home_plan}</span>
              </p>
              <p className="text-gray-500">
                Seyahat planınızı oluşturun ve en uygun roaming çözümünü keşfedin
              </p>
            </div>
          ) : null}
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Turkcell Roaming
            <span className="block text-yellow-400">Asistanı</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Seyahat planınıza göre en ekonomik roaming çözümünü bulun. 
            Sürpriz ücretlerden kaçının, akıllı paket önerileri alın.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/trip-planner"
              className="text-white bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Seyahatimi Planla
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
          Neden Roaming Asistanı?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Akıllı Maliyet Analizi</h3>
            <p className="text-gray-600">
              Seyahat planınıza göre en ekonomik seçeneği bulur. Pay-as-you-go ile paket maliyetlerini karşılaştırır.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Çoklu Ülke Desteği</h3>
            <p className="text-gray-600">
              Birden fazla ülke ziyareti için optimal paket kombinasyonları önerir. Bölgesel kapsama avantajlarını hesaplar.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Proaktif Uyarılar</h3>
            <p className="text-gray-600">
              Paket geçerlilik süreleri, kapsam dışı günler ve aşım riskleri hakkında önceden uyarı alın.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Nasıl Çalışır?
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '1', title: 'Seyahat Planı', description: 'Gideceğiniz ülkeleri ve tarih aralığını seçin' },
              { number: '2', title: 'Kullanım Profili', description: 'Günlük MB, dakika ve SMS ihtiyacınızı belirtin' },
              { number: '3', title: 'Analiz & Öneri', description: 'En ekonomik 3 seçeneği analiz ederek öneriyoruz' },
              { number: '4', title: 'Paket Seçimi', description: 'Tek tıkla en uygun paketi seçin ve aktif edin' }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-black">{step.number}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl font-bold text-yellow-400 mb-4">50+</div>
            <div className="text-xl text-gray-900">Desteklenen Ülke</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-yellow-400 mb-4">%70</div>
            <div className="text-xl text-gray-900">Ortalama Tasarruf</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-yellow-400 mb-4">10K+</div>
            <div className="text-xl text-gray-900">Mutlu Müşteri</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-black to-gray-800 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Seyahatinizi Planlayın, Tasarruf Edin
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Roaming ücretlerinde sürprizle karşılaşmayın. Hemen seyahat planınızı oluşturun.
          </p>
          <Link 
            to="/trip-planner"
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg inline-block"
          >
            Hemen Başla
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
