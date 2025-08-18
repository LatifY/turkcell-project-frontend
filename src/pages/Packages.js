import React from 'react';

const Packages = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-turkcell-secondary mb-4">
            Roaming Paketleri
          </h1>
          <p className="text-xl text-gray-600">
            Tüm ülkeler için mevcut roaming paketlerini inceleyin
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-turkcell-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-turkcell-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-turkcell-secondary mb-4">
              Paket Kataloğu Geliştiriliyor
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Tüm roaming paketlerini detaylı şekilde görüntüleyebileceğiniz katalog sayfası 
              yakında kullanıma sunulacak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Packages;
