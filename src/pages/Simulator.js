import React from 'react';

const Simulator = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-turkcell-secondary mb-4">
            Maliyet Simülatörü
          </h1>
          <p className="text-xl text-gray-600">
            Farklı paket seçeneklerinin maliyetlerini karşılaştırın
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-turkcell-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-turkcell-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-turkcell-secondary mb-4">
              Maliyet Simülatörü Geliştiriliyor
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Detaylı maliyet analizi ve karşılaştırma özelliği yakında kullanıma sunulacak. 
              Tüm seçenekleri detaylı şekilde analiz edebileceksiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
