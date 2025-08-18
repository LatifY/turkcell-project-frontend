const countries = [
  { code: "DE", name: "Almanya", flag: "🇩🇪", region: "Europe" },
  { code: "US", name: "Amerika Birleşik Devletleri", flag: "🇺🇸", region: "North America" },
  { code: "GB", name: "Birleşik Krallık", flag: "🇬🇧", region: "Europe" },
  { code: "FR", name: "Fransa", flag: "🇫🇷", region: "Europe" },
  { code: "IT", name: "İtalya", flag: "🇮🇹", region: "Europe" },
  { code: "ES", name: "İspanya", flag: "🇪🇸", region: "Europe" },
  { code: "NL", name: "Hollanda", flag: "🇳🇱", region: "Europe" },
  { code: "BE", name: "Belçika", flag: "🇧🇪", region: "Europe" },
  { code: "AT", name: "Avusturya", flag: "🇦🇹", region: "Europe" },
  { code: "CH", name: "İsviçre", flag: "🇨🇭", region: "Europe" },
  { code: "JP", name: "Japonya", flag: "🇯🇵", region: "Asia" },
  { code: "CN", name: "Çin", flag: "🇨🇳", region: "Asia" },
  { code: "KR", name: "Güney Kore", flag: "🇰🇷", region: "Asia" },
  { code: "TH", name: "Tayland", flag: "🇹🇭", region: "Asia" },
  { code: "SG", name: "Singapur", flag: "🇸🇬", region: "Asia" },
  { code: "MY", name: "Malezya", flag: "🇲🇾", region: "Asia" },
  { code: "AE", name: "Birleşik Arap Emirlikleri", flag: "🇦🇪", region: "Middle East" },
  { code: "SA", name: "Suudi Arabistan", flag: "🇸🇦", region: "Middle East" },
  { code: "EG", name: "Mısır", flag: "🇪🇬", region: "Africa" },
  { code: "ZA", name: "Güney Afrika", flag: "🇿🇦", region: "Africa" },
  { code: "AU", name: "Avustralya", flag: "🇦🇺", region: "Oceania" },
  { code: "NZ", name: "Yeni Zelanda", flag: "🇳🇿", region: "Oceania" },
  { code: "CA", name: "Kanada", flag: "🇨🇦", region: "North America" },
  { code: "MX", name: "Meksika", flag: "🇲🇽", region: "North America" },
  { code: "BR", name: "Brezilya", flag: "🇧🇷", region: "South America" },
  { code: "AR", name: "Arjantin", flag: "🇦🇷", region: "South America" },
  { code: "CL", name: "Şili", flag: "🇨🇱", region: "South America" },
  { code: "RU", name: "Rusya", flag: "🇷🇺", region: "Europe/Asia" },
  { code: "IN", name: "Hindistan", flag: "🇮🇳", region: "Asia" },
  { code: "ID", name: "Endonezya", flag: "🇮🇩", region: "Asia" }
];

export const getCountriesByRegion = () => {
  const grouped = {};
  countries.forEach(country => {
    if (!grouped[country.region]) {
      grouped[country.region] = [];
    }
    grouped[country.region].push(country);
  });
  return grouped;
};

export default countries;
