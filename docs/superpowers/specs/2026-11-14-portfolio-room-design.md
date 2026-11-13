# liffrey.github.io: piksel oda portfolyosu — tasarım

Tarih: 2026-11-14. Durum: onaylandı.

## Amaç ve neden

`liffrey.github.io` iki iş görecek: ziyaretçi Liffrey'nin **ilgi alanlarını** (oyunlar, teknoloji,
sinema) öğrenecek ve **işlerini** bir portfolyo gibi gezecek. Bunun için site, izometrik piksel
art tarzında, three.js ile çizilmiş **bir oda**dır: duvarda film afişleri, masada bilgisayar, TV'nin
önünde konsol. Odadaki nesneler içeriğin kapısıdır. Her ilgi alanında hem kendi projeleri hem de
sevdiği 5 şey (oyun, film, teknoloji) gösterilir, çünkü yalnızca projeler "beni tanı" fikrini yarım
anlatır.

Mevcut depo yalnızca hazır bir Jekyll şablonunun yer tutucularını içeriyor ("Project One",
`YourName_CV.pdf`). Taşınacak içerik yok, site sıfırdan yazılır.

## Hedefler

1. Odanın piksel art izometrik bir three.js sahnesi olması; görünüş `docs/superpowers/mockups/`
   altındaki taslakla (v3) aynı dilde: üç köşe (Oyunlar, Teknoloji, Sinema), nesneler koddan kutularla
   kurulu, zengin ışık.
2. Işığın ziyaretçinin **yerel saatine** göre değişmesi (sabah, öğle, gün batımı, mavi saat, gece) ve
   odanın günlük bir **rutini** olması.
3. Nesnelere tıklayınca içeriğin açılması: **monitör → terminal** (teknoloji), **TV → oyun seçme
   ekranı** (oyunlar), **afiş duvarı → filmler** (sinema), **masadaki dosya → CV**, **telefon →
   iletişim**.
4. Proje listesinin GitHub Actions ile **her gün kendiliğinden** güncellenmesi ve duvarda bir
   **commit takvimi**.
5. İçeriğin koddan ayrı dosyalarda durması: film, oyun, metin eklemek kod bilgisi istemez.
6. WebGL çalışmayan tarayıcılarda da sitenin kullanılabilmesi; telefonda çalışması.
7. Site dili: **yalnızca İngilizce**.

## Hedef olmayanlar (ilk sürüm)

Oynanabilir atari oyunu, penceredeki gerçek hava durumu, rehber kedi animasyonu, Letterboxd/Steam
bağlantısı, ses, gizli sürprizler, ziyaretçi defteri, Türkçe sürüm, blog, ziyaretçi istatistiği.
Hepsi sonraki sürümlere aday; tasarım ileride eklenmelerini engellememeli.

## Anti-hedefler (çalışsa bile başarısızlık sayılır)

- **İçeriğin yalnızca 3B sahnenin içinde kalması.** Bütün metin HTML'de durur: arama motoru
  okuyabilmeli, ekran okuyucu okuyabilmeli, klavyeyle gezilebilmeli. Oda, içeriği açmanın görsel
  yoludur; tek yolu değildir.
- **Boş ekran.** WebGL yoksa, sahne yüklenemezse ya da CDN/ağ sorunu varsa ziyaretçi yine içeriği
  görür. (Liffrey'nin kendi makinesinde WebGL çalışmadı; bu gerçek bir durum.)
- **Yavaş ilk açılış.** Metin ve menü hemen görünür, sahne arkadan gelir.
- **Mevcut bir oyunun ya da film afişinin kopyası.** Afişler filmi çağrıştıran soyut motiflerdir,
  gerçek afiş görseli değildir. Görünüş özgündür.
- **İçerik eklemek için kod değiştirmek gerekmesi.**

## Kısıtlar

- GitHub Pages, statik site, sunucu yok. Depo herkese açık (`Liffrey/liffrey.github.io`,
  varsayılan dal `master`). Kullanıcı sitesi olduğu için kök yol `/`.
- Pages bugün "legacy" modda `master` dalının `/docs` klasöründen yayınlıyor. Yeni sitede kaynak
  **GitHub Actions** olur. Bu ayar değişikliği ve ilk push, yayındaki siteyi değiştirdiği için
  Liffrey'nin onayıyla yapılır.
- Yerelde Node 24 ve npm var (PowerShell'de `npm.cmd`).
- three.js ve Vite dışında bağımlılık ancak gerçekten gerekirse eklenir.

## Yaklaşımlar

| | Yaklaşım | Kazanç | Bedel |
|---|---|---|---|
| **A (seçilen)** | Vite + düz JavaScript (ES modülleri) + three.js (npm) | Modüllere bölünmüş kod, anında yenilenen geliştirme sunucusu, three.js pakete gömülü (CDN'e bağımlı değil), saf mantık test edilebilir. Günlük güncelleme zaten Actions'ta çalışacağı için derleme oraya rahat oturur. | Derleme adımı, `node_modules`. |
| B | Derlemesiz tek sayfa, three.js CDN'den (taslaktaki gibi) | Kurulum yok. | Büyüdükçe yönetmesi zor, açılışta CDN'e bağımlı, test etmesi güç. |
| C | React Three Fiber gibi bir çerçeve | Bileşen modeli. | Tek bir sahne ve birkaç panel için gereğinden ağır. |

Liffrey nasıl yapılacağını bana bıraktı; A benim seçimim. Gerekçe: B ilk gün kısa ama büyüdükçe
zorlaşıyor, C ise boşuna ağır.

## Kararlaştırılanlar

### Görünüş (Liffrey'nin seçtiği, taslak v3 referans)

- **Piksel art izometrik.** Sahne düşük çözünürlükte çizilir ve en yakın komşu yöntemiyle
  (pikseller yumuşatılmadan) büyütülür. Ortografik kamera piksel art'ın 2:1 izometrik açısında
  (yatayda 45°, dikeyde 30°). Gölgeler sert. Son geçişte derinlikten 1 piksellik koyu kenar çizgisi
  ve sınırlı palet + sıralı (Bayer) dither uygulanır. Taslağın kaydırıcı ve kutucukları ayar içindi,
  sitede yer almaz.
- **Oda düzeni ve nesneler taslaktaki gibi:**
  - *Oyunlar:* TV ve konsol, oyun kutuları, atari makinesi, neon "play" tabelası, halı, kollar, puf
    ve üstünde uyuyan kedi.
  - *Teknoloji:* masa, kod satırları akan monitör, klavye, kulaklık, masa lambası, RGB ışıklı kasa,
    üstte küçük sunucu, robot ve kitaplar; masanın üstünde pencere.
  - *Sinema:* üç çerçeveli afiş ve onları aydınlatan spot, makaralar ve klaket rafı, film rafı,
    patlamış mısır.
  - *Ortak:* ayaklı lamba, yılbaşı ampulleri, köşede bitki.
  - *Taslakta olmayan, eklenecekler:* masada bir **CV dosyası**, bir **telefon** (masada ya da
    duvarda) ve duvarda küçük bir **commit takvimi**. Yerlerini inşa eden seçer; tıklanabilir
    olmaları ve diğer nesneleri kapatmamaları yeter.
- **Işık zengin:** pencereden giren güneş/ay ışığı (pencere çerçevesinin gölgesi yere düşer), içinde
  toz zerreleri olan huzme, lambalar, ekran parıltıları, neon, RGB. Küçük canlılıklar: TV titrer,
  kasa renk değiştirir, ampuller göz kırpar, neon arada cızırdar, kedi nefes alır.

### Günün saati ve odanın rutini

- Saat, **ziyaretçinin yerel saatidir**. Işık, taslaktaki gibi anahtar saatler arasında yumuşak
  geçişle değişir: güneş/ay rengi, gücü ve açısı, gökyüzü rengi, yıldızlar, şehir ışıkları, ortam
  ışığı, sahne arka planı. Lambalar ve ampuller akşam yanar, sabah söner. Güneş ve ay pencerede
  gökte ilerler.
- **Rutin** *(benim kararım)*: her zaman diliminde bir köşe "uyanır".
  - Sabah (06–12): masada kahve tüter, monitörde kod yazılır (teknoloji).
  - Öğleden sonra (12–18): oda gün ışığında sakin.
  - Akşam (18–23): TV'de oyun açık, atari makinesi tanıtım ekranında (oyunlar).
  - Gece (23–06): TV'de sinemaskop bantlı bir film oynar, ışıklar kısılır, mısırdan buhar çıkar
    (sinema).
- Köşedeki küçük **saat rozetine** tıklayınca ziyaretçi saati kaydırarak günü kendisi gezebilir.
  "Şimdi"ye dönmek tek tık *(benim kararım)*.

### Etkileşim ve gezinme

- Nesnenin üstüne gelince nesne parlar ve adı görünür. Tıklayınca kamera o nesneye yaklaşır ve
  içerik HTML katmanı olarak açılır. Esc, geri tuşu ya da "Back" ile odaya dönülür.
- Her görünümün bir adresi vardır: `#/tech`, `#/games`, `#/cinema`, `#/cv`, `#/contact`. Bağlantı
  paylaşılabilir, tarayıcının geri tuşu çalışır *(benim kararım)*.
- **Her zaman görünen bir metin menüsü** de vardır (Games · Tech · Cinema · CV · Contact). Klavye
  ve ekran okuyucu kullananlar, telefondakiler ve WebGL'siz ziyaretçiler aynı katmanları bu menüden
  açar.
- Sol üstte her zaman ad ve tek satırlık bir tanıtım durur. İlk ziyarette, ilk tıklamaya kadar
  "Click around the room" ipucu görünür *(benim kararım)*.

### İçerik görünümleri

- **Monitör → terminal (Tech).** Terminal görünümlü bir katman. Komutlar: `help`, `ls`,
  `cat <proje>`, `open <proje>` (GitHub'da açar), `whoami` (hakkımda), `favorites` (takip ettiği 5
  teknoloji), `clear`, `exit`. Sekmeyle tamamlama ve ok tuşlarıyla geçmiş vardır. Yazmak istemeyen
  için listedeki her öğe tıklanabilir.
- **TV → oyun seçme ekranı (Games).** Konsol menüsü havasında: oyun projeleri kartuş olarak, altında
  "Favorites" sırasında sevdiği 5 oyun. Ok tuşları ve tıklamayla seçilir, seçilenin ayrıntısı yanda
  görünür.
- **Afiş duvarı → Cinema.** Sevdiği 5 film, her biri piksel bir afiş kartı ve "why" cümlesiyle;
  altında sinema projeleri (CineVault, film veritabanı). Duvardaki üç afiş listenin ilk üçünü
  temsil eder. Afişler `favorites` dosyasındaki iki renk ve bir motif seçiminden kodla üretilir,
  gerçek afiş görseli kullanılmaz *(benim kararım)*.
- **Masadaki dosya → CV.** Kısa özet ve PDF indirme bağlantısı.
- **Telefon → Contact.** E-posta ve profil bağlantıları. Hangilerinin görüneceğine Liffrey karar
  verir.

### İçerik dosyaları

Koddan ayrı bir `content/` klasöründe durur. Derleme, dosyaları bir şemaya göre denetler; bozuk
dosya derlemeyi durdurur.

- `site.json`: ad, tanıtım satırı, "about" metni, iletişim bağlantıları, CV dosyasının yolu.
- `favorites.json`: `games`, `films`, `tech` için en fazla 5'er kalem: başlık, yıl, tek cümlelik
  "why". Filmlerde ayrıca afiş renkleri ve motif.
- `projects.extra.json`: GitHub'dan otomatik gelmeyen projeler (özel depolar, depo dışı işler,
  örneğin Celestial Contact) ve otomatik gelenlerin metnini ezen açıklamalar.

### Günlük güncelleme

- Bir GitHub Actions iş akışı her gün bir kez, her push'ta ve elle tetiklendiğinde çalışır. Akış
  `Liffrey`'nin **herkese açık** depolarını GitHub API'sinden çeker ve depo **konularına** (topics)
  göre köşelere dağıtır. Konular: `portfolio-games`, `portfolio-tech`, `portfolio-cinema`. Konusu
  olmayan depo sitede görünmez *(benim kararım)*. Böylece Liffrey bir projeyi siteye GitHub'da etiket
  ekleyerek koyar, koda dokunmaz.
- Akış, son haftaların katkı verisini de çeker. Duvardaki küçük bir piksel takvim bu veriyle
  doldurulur.
- Akış siteyi derleyip Pages'e yükler. Çekilen veri depoya commit edilmez, yayınlanan pakete girer.
  Bot commit'i oluşmaz.
- Özel depolar (örneğin `filetransfer-go`) Actions'ın varsayılan anahtarıyla görülmez. Bunlar
  `projects.extra.json`'a elle yazılır.
- API çağrısı başarısız olursa ya da hiç proje dönmezse iş akışı hata verir ve yayınlamaz. Böylece
  yayındaki site dünkü haliyle kalır ve asla boş proje listesiyle değişmez *(benim kararım)*.
- Katkı verisi için önce GraphQL `contributionsCollection` denenir. Actions'ın varsayılan anahtarı
  buna yetmezse, herkese açık olay (events) API'sinden son 90 günün push'ları sayılır. Takvim o
  zaman 90 günü gösterir *(inşa eden doğrular)*.
- Yerel geliştirmede ağ gerekmez: depoda örnek bir proje verisi durur, geliştirme sunucusu onu
  kullanır.

### WebGL'siz durum, telefon, erişilebilirlik, hız

- WebGL başlatılamazsa ya da sahne yüklenemezse odanın sabit bir **resmi** gösterilir. Metin menüsü
  ve bütün katmanlar aynen çalışır. Resim depoda durur; sahne değiştikçe yenilenir.
- Telefonda oda ekrana sığar. Dokunmak tıklamak gibidir; üstüne gelme etiketi yoktur. Piksel boyutu
  büyür, gölge kalitesi düşer.
- `prefers-reduced-motion` açıksa toz, titreme ve kamera uçuşu kapanır; geçişler anında olur.
  Katmanlar klavyeyle açılır, odak katmanın içinde kalır, Esc kapatır. Renk zıtlığı okunabilir
  düzeydedir.
- Sekme görünmezken çizim döngüsü durur. three.js dahil ilk JavaScript yükü sıkıştırılmış halde
  **250 KB'ı geçmez** *(benim kararım)*. Metin ve menü, sahneden önce görünür.
- Sayfanın başlığı, açıklaması ve Open Graph görseli (odanın resmi) vardır. Ziyaretçi takibi ya da
  analitik yoktur.

### Yazı tipi

Başlıklar için kendi sunucumuzda barındırılan, açık lisanslı (OFL) bir piksel yazı tipi;
okunabilirlik için gövde metni sistem yazı tipiyle *(benim kararım)*.

### Depo düzeni

- Yeni site deponun köküne kurulur. Eski Jekyll dosyaları (`docs/_config.yml`, `_layouts`,
  `_includes`, `_data`, `assets`, `index.html`, `portfolio.md`, `cv.md`) ve eski `README.md`,
  `NOTES.md` kaldırılır. `LICENSE` kalır. `TODO.md`'deki Celestial Contact notu `content/`'e
  taşınınca o dosya da kaldırılır.
- `docs/superpowers/` tasarım belgeleri için kalır. Pages kaynağı Actions'a geçince `docs/` artık
  yayınlanmaz.

## İnşa edene bırakılanlar

Modül yapısı ve dosya adları; renk paletinin son hali; kamera geçişinin hızı ve eğrisi; terminal ve
oyun ekranının ayrıntılı görünüşü; afiş motiflerinin nasıl çizildiği; şema denetimi ve test araçları
(saf mantık için test beklenir: saat geçişleri, terminal komut çözümleyici, içerik denetimi, GitHub
verisinin dönüştürülmesi); WebGL'siz resmin nasıl üretildiği (taslak, başsız Edge ve SwiftShader ile
çekilebiliyor); telefonda piksel boyutu ve gölge ayarları.

## Liffrey'den gelecek içerik (inşayı engellemez)

İnşa, açıkça işaretlenmiş yer tutucularla ilerler. Gerçek içerik geldikçe yalnızca `content/`
dosyaları değişir:

- Hakkımda metni ve tanıtım satırı.
- Sevdiği 5 oyun, 5 film, 5 teknoloji ve her biri için bir cümle.
- Görünecek iletişim bağlantıları ve CV PDF'i.
- Hangi deponun hangi köşede görüneceği (GitHub'da konu etiketleri). Özel `filetransfer-go`
  gösterilecek mi?
- Celestial Contact nedir? Sitede yer alacak mı?
