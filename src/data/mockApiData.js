// Mock API Data for simulation
export const mockCatalog = {
  countries: [
    { code: 'US', name: 'Amerika Birleşik Devletleri', flag: '🇺🇸' },
    { code: 'DE', name: 'Almanya', flag: '🇩🇪' },
    { code: 'FR', name: 'Fransa', flag: '🇫🇷' },
    { code: 'IT', name: 'İtalya', flag: '🇮🇹' },
    { code: 'ES', name: 'İspanya', flag: '🇪🇸' },
    { code: 'GB', name: 'İngiltere', flag: '🇬🇧' },
    { code: 'JP', name: 'Japonya', flag: '🇯🇵' },
    { code: 'AU', name: 'Avustralya', flag: '🇦🇺' }
  ],
  rates: [
    { country_code: 'US', data_per_mb: 0.15, voice_per_min: 0.25, sms_per_unit: 0.10 },
    { country_code: 'DE', data_per_mb: 0.12, voice_per_min: 0.20, sms_per_unit: 0.08 },
    { country_code: 'FR', data_per_mb: 0.13, voice_per_min: 0.22, sms_per_unit: 0.09 },
    { country_code: 'IT', data_per_mb: 0.14, voice_per_min: 0.23, sms_per_unit: 0.09 },
    { country_code: 'ES', data_per_mb: 0.13, voice_per_min: 0.21, sms_per_unit: 0.08 },
    { country_code: 'GB', data_per_mb: 0.16, voice_per_min: 0.26, sms_per_unit: 0.11 },
    { country_code: 'JP', data_per_mb: 0.18, voice_per_min: 0.30, sms_per_unit: 0.12 },
    { country_code: 'AU', data_per_mb: 0.17, voice_per_min: 0.28, sms_per_unit: 0.11 }
  ],
  packs: [
    {
      pack_id: 'EU_DATA_1GB',
      name: 'Avrupa Veri Paketi 1GB',
      countries: ['DE', 'FR', 'IT', 'ES'],
      data_mb: 1024,
      voice_min: 0,
      sms_count: 0,
      price: 25.00,
      currency: 'TL',
      validity_days: 30
    },
    {
      pack_id: 'EU_DATA_3GB',
      name: 'Avrupa Veri Paketi 3GB',
      countries: ['DE', 'FR', 'IT', 'ES'],
      data_mb: 3072,
      voice_min: 0,
      sms_count: 0,
      price: 65.00,
      currency: 'TL',
      validity_days: 30
    },
    {
      pack_id: 'US_COMBO_2GB',
      name: 'ABD Kombo Paketi 2GB',
      countries: ['US'],
      data_mb: 2048,
      voice_min: 100,
      sms_count: 50,
      price: 80.00,
      currency: 'TL',
      validity_days: 15
    },
    {
      pack_id: 'GLOBAL_DATA_5GB',
      name: 'Global Veri Paketi 5GB',
      countries: ['US', 'DE', 'FR', 'IT', 'ES', 'GB', 'JP', 'AU'],
      data_mb: 5120,
      voice_min: 0,
      sms_count: 0,
      price: 150.00,
      currency: 'TL',
      validity_days: 30
    }
  ]
};

// Mock simulate function
export const mockSimulate = (requestData) => {
  const { user_id, trips, profile } = requestData;
  
  // Calculate total needs
  let totalDays = 0;
  let totalMB = 0;
  let totalMin = 0;
  let totalSMS = 0;

  trips.forEach(trip => {
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    totalDays += days;
    totalMB += profile.avg_daily_mb * days;
    totalMin += profile.avg_daily_min * days;
    totalSMS += profile.avg_daily_sms * days;
  });

  const summary = {
    days: totalDays,
    total_need: {
      gb: (totalMB / 1024).toFixed(2),
      min: totalMin,
      sms: totalSMS
    }
  };

  // Find suitable packs
  const options = [];
  const countryCodes = trips.map(trip => trip.country_code);
  
  // Check pack options
  mockCatalog.packs.forEach(pack => {
    const coverage = countryCodes.filter(code => pack.countries.includes(code));
    const coverageHit = ((coverage.length / countryCodes.length) * 100).toFixed(0);
    
    if (coverage.length > 0) {
      const packsNeeded = Math.ceil(totalMB / pack.data_mb);
      const validityOk = pack.validity_days >= totalDays;
      
      // Calculate overflow for data
      const totalPackData = packsNeeded * pack.data_mb;
      const dataOverflow = Math.max(0, totalMB - totalPackData);
      
      // Calculate overflow costs using rates
      let overflowCost = 0;
      if (dataOverflow > 0) {
        const rate = mockCatalog.rates.find(r => countryCodes.includes(r.country_code));
        if (rate) {
          overflowCost = dataOverflow * rate.data_per_mb;
        }
      }

      options.push({
        kind: "pack",
        pack_id: pack.pack_id,
        pack_name: pack.name,
        n_packs: packsNeeded,
        total_cost: (packsNeeded * pack.price + overflowCost).toFixed(2),
        currency: pack.currency,
        coverage_hit: `${coverageHit}%`,
        validity_ok: validityOk,
        overflow_breakdown: {
          data_mb: dataOverflow,
          cost: overflowCost.toFixed(2)
        }
      });
    }
  });

  // Calculate Pay-as-you-go option
  let paygCost = 0;
  countryCodes.forEach(countryCode => {
    const rate = mockCatalog.rates.find(r => r.country_code === countryCode);
    if (rate) {
      const tripData = trips.find(t => t.country_code === countryCode);
      if (tripData) {
        const startDate = new Date(tripData.start_date);
        const endDate = new Date(tripData.end_date);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        paygCost += (profile.avg_daily_mb * days * rate.data_per_mb);
        paygCost += (profile.avg_daily_min * days * rate.voice_per_min);
        paygCost += (profile.avg_daily_sms * days * rate.sms_per_unit);
      }
    }
  });

  options.push({
    kind: "payg",
    total_cost: paygCost.toFixed(2),
    currency: "TL"
  });

  return {
    summary,
    options: options.sort((a, b) => parseFloat(a.total_cost) - parseFloat(b.total_cost))
  };
};
