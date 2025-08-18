# Development Document (DD.md)

## Codenight Case: Turkcell Roaming Asistanı – Seyahate Göre Paket Önerisi ve Sürpriz Ücret Önleme

### Amaç
Ekipler 10 saat içinde, kullanıcının seyahat planına göre en ekonomik roaming çözümünü
(paket/top-up/kombinasyon) öneren, maliyet simülasyonu yapan ve uyarılar üreten bir
web/mobil uygulama geliştirir.  
Teknolojiler serbest; ChatGPT/Copilot/Cursor kullanılabilir.

---

### İş Senaryosu
Kullanıcılar yurt dışında “MB başı ücretlendirme” veya “yanlış paket” nedeniyle beklenmedik
faturalara maruz kalabiliyor. Roaming Asistanı; seyahat ülkesi/tarihleri ve kullanım profiline
göre, paket mi tekil ücret mi sorusuna cevap verir, en düşük maliyetli alternatifi açıklar, sınır
geçişlerinde (multi-country) paket kapsamı ve geçerlilik süresi (validity) gibi ayrıntıları dikkate
alır. Kullanıcı tek tıkla paket seçimini simüle eder

---

### Zorunlu Özellikler (MVP)
1. **Kullanıcı & Seyahat Girişi (mock)**
   - Kullanıcı seçimi (drop-down).
   - Seyahat planı: ülke(ler), başlangıç/bitiş tarihleri.
   - Kullanım profili: günlük MB/dk/SMS tahmini (varsayılan profili öner, kullanıcı değiştirebilsin).
2. **Katalog & Tarifeler**
   - Roaming paketleri (bölge/ülke kapsama, GB/dk/SMS, fiyat, geçerlilik gün sayısı)
   - Pay-as-you-go (ülke bazlı tekil MB/dk/SMS ücretleri)
3. **Maliyet Simülasyonu**
   - Trip süresini gün cinsinden hesapla → günlük kullanım × gün sayısı.
   - Her paket için: kapsıyorsa base fiyat + aşım (varsa) → toplam maliyet.
   - Pay-as-you-go ile kıyasla.
   - Çok ülke içeren rotada, bölge kapsayan paketleri öncele; kapsam dışı günleri tekil ücretle hesapla.
4. **Öneri & Gerekçe**
   - En düşük 3 seçenek: paket, paket+kısmi tekil, yalnız tekil.
   - “Neden bu paket?” açıklaması: kapsama, validity, aşım riski.
5. **Uyarılar**
   - “Paketin geçerliliği (validity) trip süresinden kısa” → 2 paket öner (greedy).
   - “Ülke kapsama dışı” → alternatif bölge paketi + kalan günler için tekil ücret.
   - “Sınır geçişi” → ikinci ülke günü için otomatik yeni hesap.
6. **İşlem Akışı (Simülasyon)**
   - “Paketi seç” → onay → “başarılı (mock)”.
   - “Top-up ekle” → yeni maliyet simülasyonu.
7. **Sunum**
   - 3 dakikalık demo: Trip gir → simülasyon → öneriler → onay akışı.

---

### UI UX 
• Trip Planlayıcı: Ülke ve tarih seçimi (çoklu ülke).
• Özet Kartları: Toplam gün, beklenen GB/dk/SMS.
• Öneri Kartları: Paket adı, kapsama, kaç paket gerektiği, toplam maliyet, tasarruf (pay-as-
you-go’ya göre).
• Uyarı Rozetleri: “Validity kısa”, “Kapsama dışı gün var”, “Aşım riski”.
• Simülasyon Paneli: Paket + pay-as-you-go ayrıntılı döküm.
• Karanlık/Aydınlık tema (opsiyonel), klavye erişilebilirliği.



### Örnek Veri Setleri
**countries**
country_code,country_name,region
TR,Turkey,Europe
DE,Germany,Europe
US,United States,North America
AE,United Arab Emirates,Middle East
EG,Egypt,Africa
GR,Greece,Europe

**roaming_rates (pay-as-you-go)**
country_code,data_per_mb,voice_per_min,sms_per_msg,currency
DE,0.10,0.45,0.20,EUR
US,0.15,0.60,0.25,USD
AE,0.18,0.75,0.30,USD
GR,0.09,0.40,0.18,EUR
EG,0.14,0.70,0.28,USD

**roaming_packs**
pack_id,name,coverage,coverage_type,data_gb,voice_min,sms,price,validity_days,currency
201,Avrupa 5GB,Europe,region,5,50,50,19.9,7,EUR
202,Avrupa 10GB,Europe,region,10,100,100,29.9,14,EUR
203,Dünya 3GB,Global,region,3,30,30,34.9,10,USD
204,ABD 5GB,US,country,5,50,50,24.9,10,USD
205,BAE 3GB,AE,country,3,30,30,22.9,7,USD

**users**
user_id,name,home_plan
1001,Ahmet Yılmaz,Faturalı
1002,Aylin Demir,Faturasız

**trips (mock giriş)**
trip_id,user_id,country_code,start_date,end_date
5001,1001,DE,2025-08-20,2025-08-25
5002,1001,GR,2025-08-26,2025-08-28
5003,1002,US,2025-09-10,2025-09-17

**usage_profile (varsayılan günlük beklenti)**
user_id,avg_daily_mb,avg_daily_min,avg_daily_sms
1001,600,10,2
1002,900,15,3

---

### Basit Öneri Mantığı (Referans)
1. **Trip Gün Sayısı:**  
   `days = (end - start + 1)`

2. **Beklenen Toplam Kullanım:**
   - `need_mb = avg_daily_mb * total_days / 1024 (GB’e çevir)`
   - `need_min = avg_daily_min * total_days`
   - `need_sms = avg_daily_sms * total_days`

3. **Paket Uygunluğu:**
   - `coverage_type == region` ve `country.region == pack.coverage` → kapsar
   - `coverage_type == country` ve `country_code == pack.coverage` → kapsar
   - **Validity:** `total_days > validity_days` → çoklu paket gerekli (greedy: `ceil(total_days/validity_days)`).

4. **Maliyet**
   - **Paket:** `base = n_packs * price`
   - **Aşım:** `max(0, need_mb - n_packs*data_gb) * overage_rate(data)` + benzeri voice/SMS.  
     (Basitleştirme: aşım pay-as-you-go ücretleriyle çarpılır, ülke bazlı.)
   - **Pay-as-you-go:** `need_mb*rate_mb + need_min*rate_min + need_sms*rate_sms`

5. **Skor & Sıralama:**  
   `total_cost` artan → eşitlikte kapsama genişliği (region > country) → validity uyumu daha yüksek skor.

---

### API Sözleşmesi (Öneri)

**GET /api/users/{id}**
```json
-> 200: { "user_id":1001, "name":"Ahmet Yılmaz", "home_plan":"Faturalı" }

**GET /api/catalog**
-> 200: { "countries": [...], "rates": [...], "packs": [...] }

**POST /api/simulate**
BODY: { "user_id":1001,
  "trips":[{"country_code":"DE","start_date":"2025-08-20","end_date":"2025-08-25"}],
  "profile":{"avg_daily_mb":600,"avg_daily_min":10,"avg_daily_sms":2}
}
-> 200: {
  "summary": {"days":6, "total_need":{"gb":3.6,"min":60,"sms":12}},
  "options": [
    {"kind":"pack","pack_id":201,"n_packs":1,"total_cost":19.9,"currency":"EUR","coverage_hit":true,"validity_ok":true,"overflow_breakdown":{}},
    {"kind":"payg","total_cost":72.3,"currency":"EUR"}
  ]
}

**POST /api/recommendation**
-> 200: { "top3": [ { "label":"Avrupa 5GB", "total_cost":19.9, "explanation":"Kapsama Avrupa, validity 7 gün, aşım yok" } ], "rationale":"En düşük maliyetli çözüm" }

**POST /api/checkout (mock)**
-> 201: { "status":"ok", "order_id":"MOCK-12345" }


