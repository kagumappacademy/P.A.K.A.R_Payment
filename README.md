# P.A.K.A.R — Portal Pendaftaran & Pembayaran

Website bertema **Misi Cuti Sekolah Akhir Tahun 2026**, berfokus kepada pelajar sekolah menengah. Mengandungi landing page, dua track, 10 modul, kombo automatik, pendaftaran tiga langkah, DuitNow QR manual, resit persendirian dan portal admin. Dibina menggunakan Next.js App Router, React, TypeScript dan **Turso/libSQL** melalui `@libsql/client`.

## Buka localhost yang telah disediakan

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin
- Admin dan Finance berkongsi halaman login Admin. Kod akses menentukan paparan selepas log masuk.
- Login Admin dan Finance menggunakan kod akses enam digit yang disediakan secara sulit. `.env.local` dan fail kelayakan tempatan diabaikan Git.
- Untuk menjalankan semula selepas menutup aplikasi / restart komputer, buka PowerShell dalam folder projek dan jalankan:

```powershell
.\Start-Local.ps1
```

Skrip ini menyediakan skema secara idempoten, kemudian menjalankan website yang bersambung terus ke **Turso Cloud** menggunakan `.env.local`. XAMPP/MySQL tidak diperlukan untuk menjalankan aplikasi. Hentikan website dengan `Ctrl+C` pada terminal. Data MySQL lama dikekalkan sebagai sumber asal selepas migrasi.

## Tetapan awal yang perlu disemak

Maklumat track, nama modul dan tempoh **5–31 Disember 2026** diambil daripada poster pengguna. Penerangan dan hasil pembelajaran ialah draf yang boleh disunting admin.

1. **Admin → Tetapan pembayaran:** muat naik QR DuitNow pembayaran rasmi dan isi nama penerima. QR pada poster asal ialah QR pendaftaran; ia tidak digunakan sebagai QR pembayaran. Sehingga QR rasmi disediakan, peserta boleh menyimpan pendaftaran tetapi tidak menghantar resit.
2. **Admin → Modul & harga:** semak harga awal RM39/modul sekolah dan RM59/modul universiti. Harga universiti ialah cadangan permulaan, bukan harga yang dinyatakan poster.
3. Diskaun awal: 2 modul **10%**, 3 atau lebih **20%**, semua modul aktif dalam track **25%**. Diskaun terbaik dikenakan sekali; harga dibekukan semasa pendaftaran. Semua kadar boleh diubah. Semak juga teks promosi dalam FAQ selepas menukar kadar.
4. Semak jadual setiap modul, lokasi, telefon WhatsApp, e-mel, hasil pembelajaran dan maklumat fizikal/online. Jadual serta lokasi sebenar belum dibekalkan, jadi tiada jadual rekaan digunakan.
5. Setiap modul mempunyai gambar kad dan poster penuh yang berasingan, dengan tema warna tersendiri. Gunakan **1200 × 750 px (8:5)** untuk gambar kad dan **1080 × 1350 px (4:5)** untuk poster penuh. PNG, JPG dan WEBP diterima sehingga 3MB. Di **Admin → Modul & harga → Edit**, muat naik kedua-dua gambar melalui medan masing-masing. Peserta boleh membuka poster penuh bersama penerangan, hasil pembelajaran dan harga melalui butang **Lihat modul**. Paparan poster menggunakan `contain` supaya seluruh reka bentuk dapat dilihat.

## Tema dan bahasa

Logo P.A.K.A.R menggunakan imej yang dibekalkan pengguna, dengan versi lutsinar di `public/images/brand/pakar-logo.png` dan WebP untuk header/footer/admin. Favicon pelbagai saiz ada dalam `app/favicon.ico`, bersama `app/icon.png` dan `app/apple-icon.png`. Versi lutsinar disediakan menggunakan built-in imagegen dengan arahan membuang latar putih sahaja sambil mengekalkan badge, tulisan, bingkai metalik dan empat warna asal.

Pelawat baharu bermula dalam **dark mode** dan Bahasa Melayu. Switch di header menukar light/dark mode; butang **BM / ENG** menukar bahasa antara muka termasuk pendaftaran, pembayaran, resit dan admin. Pilihan disimpan dalam cookie pada pelayar. Teks lalai program mempunyai terjemahan English; kandungan tersuai yang ditulis admin dikekalkan seperti yang dimasukkan, dan terjemahannya boleh ditambah dalam `data/en.json`.

Latar teknologi menggunakan litar, grid, orbit HUD, partikel dan cahaya mengikut penunjuk. Animasi masuk, hover dan scroll disediakan dengan sokongan `prefers-reduced-motion` untuk mematikan pergerakan apabila tetapan aksesibiliti pelayar memintanya.

Muzik latar menggunakan MP3 yang dibekalkan pengguna di `public/audio/pakar-technology-theme.mp3` (MUSIC4VIDEO). Pemain di penjuru bawah kanan hanya mempunyai satu butang mute/unmute. Volume awal ialah 20%; pilihan mute dan volume yang pernah disimpan dikekalkan pada pelayar. Website cuba memainkan muzik secara automatik apabila dibuka. Jika pelayar menyekat autoplay bersuara, muzik bermula pada interaksi pertama di halaman atau apabila butang unmute ditekan. Lagu dimainkan sampai habis kemudian berulang dari awal tanpa henti, termasuk semasa navigasi antara halaman. Mute hanya menyenyapkan audio tanpa menghentikan lagu.

Penganjur ialah **Kagum Academy**, dengan logo PNG lutsinar di `public/images/brand/kagum-academy.png`. Versi lutsinar disediakan dengan built-in imagegen, arahan: “Buang latar putih di luar logo sahaja; kekalkan bentuk, warna, tulisan KAGUM/ACADEMY dan bahagian putih dalam perisai.” Nama dan logo penganjur boleh diubah melalui **Admin → Kandungan**; logo dipaparkan pada maklumat program dan footer.

Bahagian **Rakan kolaborasi** memaparkan AR Mechatronics PLT, Rumah Perlindungan TBQ Amal, ProSilat Akademi dan Aerogrit. Empat PNG lutsinar disimpan dalam `public/images/collaborators/`; sumber asal dibekalkan pengguna dan background dibuang menggunakan built-in imagegen. Prompt setiap logo: “Remove only the white background to actual transparent alpha; preserve original geometry, colours and exact lettering; crop empty margins with a transparent safety margin.” Untuk TBQ Amal, tulisan putih dan garis putih logo dikekalkan, manakala ruang putih kosong di belakang keluarga dibuang. Nama, logo, status paparan, tajuk, penerangan dan susunan boleh diubah di **Admin → Kandungan website → Rakan kolaborasi**. Panel biru gelap dengan cahaya teal memastikan logo kekal jelas; fail PNG sendiri tetap lutsinar. Bahagian ini turut boleh dipilih atau disusun dalam editor visual.

**Admin → Ayat & butang** menyediakan carian dan penapis bahagian untuk teks halaman utama, navigasi, borang, pembayaran, resit PDF serta admin. Edit BM dan English secara berasingan, kemudian tekan **Simpan teks & butang**. Kosongkan medan atau tekan **Guna teks asal** untuk pulih kepada teks lalai. Teks yang sama digunakan di beberapa tempat berubah bersama; editor hanya menukar label, bukan tindakan atau pautan butang. Teks tambahan boleh dimasukkan menggunakan teks asal yang tepat. Data peserta, harga dan status pembayaran kekal diurus melalui fungsi asal. Teks disimpan dalam Turso dan perubahan direkod dalam audit log.

Katalog sumber dijana daripada komponen dan kamus bahasa dengan `node scripts/generate-text-catalog.mjs`. Jalankan semula selepas menambah ayat atau butang dalam kod. Kandungan program dan modul semasa turut dimasukkan secara automatik dalam editor.

**Admin → Ayat & butang → Editor visual** memaparkan halaman sebenar dalam pratonton yang boleh diklik. Pilih ayat, butang, gambar atau bekas; gunakan **Pilih induk** untuk memilih satu bahagian. Panel kanan membolehkan admin menukar ayat BM/English, warna teks/latar/border, saiz dan ketebalan teks, penjajaran, kedudukan X/Y, lebar, padding, margin, kolum, susunan item, bucu dan bayang. Tema & susunan menyediakan palet light/dark, font global serta seret atau anak panah untuk menyusun sembilan bahagian landing page. Susunan yang disimpan turut digunakan untuk susunan DOM halaman sebenar.

Switch desktop/telefon menyediakan gaya berasingan bagi breakpoint 681px dan 680px; semak kedua-duanya sebelum menerbitkan. Skrin penuh, Undo/Redo serta pulihkan gaya tersedia. Draf kekal ketika bertukar antara editor visual dan senarai ayat sepanjang panel dibuka. Pratonton disokong untuk landing, borang pendaftaran, pilihan modul, semakan dan contoh pembayaran tanpa menghantar pendaftaran. Klik **Simpan & terbitkan** untuk menyimpan ayat dan reka bentuk secara atomik dalam Turso; medan kandungan, harga dan pendaftaran lain tidak ditulis semula oleh endpoint ini.

Gaya hanya menerima sifat terpilih, nilai terhad dan selector yang berakar pada `data-design-id`; admin tidak memasukkan JavaScript, HTML atau CSS mentah. Kad modul menggunakan ID tersendiri supaya gaya tidak berpindah kepada modul daripada track lain. Preview hanya menerima mesej daripada parent pada origin yang sama; `X-Frame-Options: SAMEORIGIN` mengekalkan sekatan embedding dari domain lain. Susun semula komponen dalam kod boleh memerlukan pelarasan gaya anak yang telah disimpan; butang pulihkan gaya tersedia untuk ini.

## Aliran peserta

1. Pilih track dari landing page; isi nama, e-mel, telefon, institusi dan umur. Peserta bawah 18 tahun perlu maklumat penjaga.
2. Pilih satu atau lebih modul. Jumlah dan kombo dikira serta disahkan semula di server. Berikan persetujuan penggunaan maklumat.
3. Pendaftaran disimpan dengan nombor rawak unik. Imbas QR rasmi melalui aplikasi bank; jumlah yang perlu dibayar dipaparkan. Muat naik resit PNG/JPG/WEBP/PDF, maksimum 3MB. Peserta tidak perlu memasukkan nombor rujukan transaksi.
4. Selepas bukti pembayaran dihantar, resit pendaftaran bernombor dijana secara automatik. Peserta boleh melihat atau memuat turun PDF, kemudian menekan butang menyertai kumpulan WhatsApp track mereka jika admin telah menyediakan pautan. Status resit kekal **Menunggu semakan** sehingga admin mengesahkan pembayaran.
5. Semak status menggunakan nombor pendaftaran dan e-mel melalui `/semak`. Jika resit ditolak, nota admin dipaparkan dan peserta boleh memuat naik resit baharu.

Nombor pendaftaran baharu menggunakan format ringkas **PKR-A7K2M9** (enam aksara selepas PKR), tanpa huruf I/O atau angka 0/1 yang mudah tertukar. Pangkalan data memastikan nombor unik dan percubaan baharu dibuat jika nombor rawak sudah digunakan. Nombor pendaftaran, pautan akses dan resit lama dikekalkan; tiada penomboran semula rekod terdahulu.

Gambar dalam langkah pemilihan modul dipaparkan sepenuhnya mengikut nisbah asal, tanpa crop, pada desktop dan telefon. Modul Sekolah Menengah Pembangunan Website menggantikan Asas Produktiviti dengan penerangan, hasil pembelajaran dan poster sekolah yang sepadan; ID modul, harga dan snapshot pendaftaran terdahulu dikekalkan. Track Universiti disembunyikan daripada pelanggan dan pendaftaran baharu.

Pembayaran **disemak secara manual** oleh admin. Tiada transaksi bank, debit automatik atau pengesahan terus dengan DuitNow dilakukan oleh aplikasi.

## Portal admin

Login bersama di `/admin` menggunakan kod akses enam digit, termasuk sifar di hadapan. Server mengenal pasti peranan daripada hash kod dan membuka dashboard Admin atau semakan pembayaran (`/finance`) secara automatik. Tiada pilihan peranan atau pautan login Finance dipaparkan; `/finance` tanpa sesi kembali ke `/admin`. Login baharu menggantikan sesi peranan sebelumnya. Kod Admin dan Finance mesti berbeza. E-mel dan kata laluan tidak lagi digunakan pada login. Jalankan `node --env-file=.env.local scripts/setup-staff.mjs` sekali dengan `ADMIN_LOGIN_CODE` dan `FINANCE_LOGIN_CODE` untuk menyediakan akaun; kod disimpan sebagai hash bcrypt dalam Turso dan tidak dimasukkan ke Git. Akaun yang sudah wujud dikekalkan apabila setup dijalankan semula. Admin boleh menukar kedua-dua kod melalui **Akaun admin → Urus kod akses** dengan mengesahkan kod admin semasa. Sesi lama dan sesi bagi kod yang ditukar tidak lagi sah.

Finance mempunyai sesi dan akses berasingan: semakan pendaftaran pembayaran, resit persendirian dan pengesahan sahaja. Portal menonjolkan jumlah RM menunggu semakan, disahkan dan dipilih; carian merangkumi nama, rujukan serta modul. Buka bukti pembayaran, semak penerima/jumlah/modul, tandakan pengesahan dan tekan **Hantar pengesahan**. Pengesahan kelompok dibuat secara atomik (maksimum 100 rekod), menolak status/resit/jumlah yang berubah dan pengesahan berulang. Audit merekod petugas, masa dan rekod yang disahkan. Admin dan Finance membaca pendaftaran Turso yang sama dan menyegar senarai setiap 30 saat atau melalui Muat semula; jumlah diterima admin dikira daripada rekod disahkan. Pengesahan kekal manual oleh petugas, tanpa sambungan semakan bank automatik.

- Dashboard jumlah pendaftaran, resit menunggu semakan, penyertaan disahkan dan jumlah bayaran yang disahkan.
- Carian, penapisan status, butiran penuh peserta dan penjaga, paparan resit, pengesahan/penolakan dengan nota, eksport CSV.
- Tambah / edit modul, harga, warna, gambar kad, poster penuh, jadual, hasil pembelajaran dan status aktif.
- Edit landing page, maklumat program, track, FAQ, notis privasi, imej utama serta poster rasmi. Editor JSON penuh turut tersedia untuk manfaat dan semua medan kandungan.
- Edit DuitNow QR, nama penerima, kadar kombo dan pautan jemputan kumpulan WhatsApp berasingan untuk Sekolah Menengah / Universiti; tukar kata laluan admin.

## Database & fail

Skema ada dalam `database/schema.sql`. Persediaan bersifat idempoten dan tidak menulis semula kandungan atau akaun sedia ada:

```powershell
npm.cmd install
npm.cmd run db:setup
npm.cmd run dev
```

Untuk mesin baharu: salin `.env.example` kepada `.env.local`, isi `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `SESSION_SECRET` dan maklumat admin, kemudian jalankan arahan di atas. Node.js **24 LTS** digunakan untuk skrip TypeScript dan pembangunan projek ini.

Untuk pembangunan offline sahaja, gunakan `TURSO_DATABASE_URL=file:.local/pakar.db` dan cipta folder `.local` terlebih dahulu. Fail ini tidak disegerakkan secara automatik dengan cloud. Vercel mesti menggunakan URL Turso remote.

Jadual: `settings`, `modules`, `admins`, `registrations`, `files`, `file_chunks`, `rate_limits`, `audit_logs`. Resit dan imej yang dimuat naik disimpan dalam Turso, bukan filesystem sementara Vercel. Kandungan fail dipecah kepada cebisan 256KB dan disimpan dalam satu transaksi atomik. Semakan bayaran menggunakan transaksi tulis; tarikh database menggunakan UTC ISO 8601. Backup database merangkumi resit dan poster yang dimuat naik.

### Migrasi daripada MySQL

Migrasi sekali sahaja tersedia melalui `node --env-file=.env.local scripts/migrate-mysql-to-turso.mjs`. Isi pemboleh ubah `MYSQL_*` sumber lama serta `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` sasaran dalam `.env.local`. Jalankan pada **database Turso kosong sebelum `db:setup`**. Skrip menolak sasaran berisi, menyimpan backup sulit di `.local`, menyalin semua jadual dalam transaksi, dan membandingkan setiap nilai selepas salinan. Data MySQL tidak diubah. Dependency `mysql2` hanya digunakan oleh alat migrasi ini, bukan runtime website.

Kawalan yang disediakan: kata laluan bcrypt, sesi bertandatangan 8 jam dalam cookie HttpOnly, Secure pada production, semakan asal permintaan, validasi server, pertanyaan berparameter, kadar cubaan berasaskan database, semakan format sebenar fail, resit terhad kepada admin, harga disahkan server, idempotensi pendaftaran dan log tindakan admin. Pelanggan tidak boleh mengesahkan bayaran sendiri. Jangan kongsi `.env.local` atau `.local-admin.txt`.

## Semakan

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
# Dengan localhost sedang berjalan dan database Turso tersedia:
node --env-file=.env.local scripts/verify-local.mjs
```

Ujian unit meliputi harga, pembundaran, kadar kombo dan validasi. Skrip integrasi menjalankan aliran API dengan database sebenar: login, pendaftaran, manipulasi harga/track, idempotensi, muat naik fail, kawalan akses resit, penolakan/hantar semula/pengesahan, edit modul dan CSV. Ia terhad kepada localhost, memulihkan tetapan asal serta membuang data ujian sendiri.

## Persediaan Vercel — belum diterbitkan

1. Gunakan **Turso Cloud** yang boleh dicapai melalui `libsql://...` dan token database dengan hak baca/tulis. Asingkan database preview jika ujian tidak patut menyentuh data produksi.
2. Import repository GitHub ke Vercel, framework **Next.js**, Node.js 24, build command `npm run build`. `.env.local`, token, kata laluan dan `.local` mesti kekal di luar Git. Tiada static export diperlukan.
3. Tetapkan `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` dan `APP_URL=https://domain-anda` dalam Vercel Environment Variables. `JWT_SECRET` turut diterima jika `SESSION_SECRET` tiada; kedua-duanya memerlukan sekurang-kurangnya 32 aksara. Jika kedua-duanya ditetapkan, `SESSION_SECRET` diutamakan. Kekalkan nilai rahsia apabila memindahkan pendaftaran sedia ada supaya token capaian resit kekal sah. Jangan gunakan pemboleh ubah awalan `NEXT_PUBLIC_` untuk token database. Selepas mengubah environment variables, lakukan redeploy supaya deployment menggunakan konfigurasi baharu.
4. Jalankan `npm run db:setup` terhadap database produksi dari persekitaran dipercayai sebelum deployment pertama. Ini menyediakan skema dan akaun admin awal. Tukar `ADMIN_PASSWORD` dalam env sahaja tidak menukar akaun sedia ada; gunakan halaman Akaun admin.
5. Jika localhost dan Vercel menggunakan database Turso yang sama, semua kandungan serta muat naik sudah dikongsi; tiada eksport/import tambahan diperlukan. Backup hendaklah disimpan secara sulit kerana mengandungi maklumat peserta.
6. Deploy, lengkapkan QR/harga/jadual dan uji pendaftaran percubaan sebelum membuka pendaftaran sebenar. Semak had database dan Vercel. Muat naik dihadkan 3MB supaya permintaan kekal di bawah had payload fungsi.

Rujukan rasmi: [Turso TypeScript SDK](https://tursodatabase.github.io/libsql-client-ts/), [Next.js](https://nextjs.org/docs/app/getting-started/installation), [Deploy Next.js di Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs), [Had payload fungsi](https://vercel.com/docs/errors/function_payload_too_large).

Website diterbitkan di https://pakar-kagum.vercel.app. Sambungan Turso menggunakan database yang dibekalkan pengguna.

## Kempen cuti sekolah akhir tahun

Halaman utama memberi tumpuan kepada enam modul Sekolah Menengah dengan tema “Cuti sekolah. Misi luar biasa.” Track Universiti kekal tersedia dalam pilihan program. Maklumat program 5–31 Disember 2026 dikekalkan berdasarkan poster; tarikh itu ialah tempoh program, bukan pengisytiharan tarikh rasmi cuti sekolah setiap negeri.

Pemasangan baharu menggunakan kandungan ini terus daripada seed. Untuk database sedia ada, jalankan sekali selepas menyambungkan konfigurasi yang betul:

```powershell
node --env-file=.env.local scripts/apply-school-holiday-campaign.mjs
```

Skrip hanya mengemas kini ayat kempen, manfaat, FAQ dan penerangan modul sekolah. Harga, diskaun, tetapan pembayaran, jadual, poster muat naik dan pendaftaran sedia ada dikekalkan. Salinan sebelum perubahan disimpan di `.local/` yang diabaikan Git. Jangan menjalankan skrip ini semula selepas menyunting ayat kempen melalui admin kecuali anda mahu menggunakan semula ayat seed.

## Resit pendaftaran PDF & kumpulan WhatsApp

- Tetapkan pautan di **Admin → Tetapan pembayaran → Kumpulan WhatsApp peserta**. Gunakan URL jemputan rasmi `https://chat.whatsapp.com/...` bagi setiap track. Medan ini berbeza daripada nombor WhatsApp penganjur untuk dihubungi.
- Selepas bukti pembayaran dimuat naik, peserta memperoleh nombor resit `RCT-...`, paparan resit dan muat turun PDF. Nombor serta tarikh pengeluaran dikekalkan apabila bukti dihantar semula. Nama penerima dan maklumat penganjur direkodkan pada pengeluaran pertama; jumlah dan harga menggunakan pendaftaran asal.
- Pautan kumpulan hanya diberikan kepada peserta yang telah menghantar bukti dan berstatus **Menunggu semakan** atau **Disahkan**. Landing page serta API konfigurasi awam tidak mendedahkan pautan. Sekiranya pautan masih kosong, peserta diminta menyemak semula selepas admin menambah pautan.
- PDF mencerminkan status semasa: **Menunggu semakan**, **Pembayaran disahkan** atau **Perlu tindakan**. Memuat naik imej bank tidak terus mengesahkan pembayaran. Tarikh pengesahan dicatat apabila admin meluluskan resit.
- PDF dijana di server dengan `pdf-lib` dan fon Noto Sans berlesen SIL OFL (lesen di `public/fonts/LICENSE-Noto.txt`). Fon dibundel untuk Vercel, tanpa bergantung pada Python atau fon komputer pengguna. Muat turun menggunakan permintaan POST dengan token peserta atau sesi admin, dan respons tidak dicache.
- Tetapan dan metadata resit disimpan sebagai JSON dalam Turso. Rekod lama masih boleh dibaca. Medan mod pembelajaran serta rujukan transaksi lama tidak lagi dikumpulkan dalam borang atau dimasukkan dalam eksport CSV baharu.

Slider kolaborator memaparkan satu logo pada satu masa, bergerak setiap 3.2 saat dan mengulang tanpa henti. Titik navigasi disediakan tanpa butang play/pause. Slider terus bergerak selepas pilihan logo atau hover; tetapan reduced motion kekal dihormati.

Butang Log keluar tersedia di bar atas Admin dan Finance, serta sidebar Admin. Butang menutup kedua-dua sesi melalui server sebelum kembali ke login bersama `/admin` dengan navigasi penuh. Jika permintaan gagal, mesej ralat dipaparkan dan pengguna boleh mencuba semula.

Finance mempunyai tab Belum disahkan, Sudah disahkan dan Ditanda; kotak 30px di kolum kanan kekal kelihatan ketika jadual ditatal. Tanda satu atau semua resit dalam paparan (maksimum 100), semak ringkasan nama/modul/jumlah dan pengakuan semakan sebelum mengesahkan. Bayaran tanpa resit tidak boleh ditanda. Buka semula pengesahan memerlukan sebab dan mengembalikan status pending; timestamp, bukti dan jumlah disemak secara atomik untuk mengelak pembetulan terhadap rekod lapuk. History pengesahan/pembetulan disimpan dalam rekod pendaftaran, termasuk peranan petugas dan rujukan kelompok; rekod lama menggunakan tarikh pengesahan sedia ada jika tersedia. Jumlah Admin dikira semula daripada status semasa.

Finance kini mempunyai empat langkah dengan progress bar: pilih bayaran, semak resit satu per satu, sahkan ringkasan dan selesai. Laporan Peserta berbayar tersedia pada Admin dan Finance, diasingkan mengikut modul/track dengan nama, telefon, e-mel, institusi dan rujukan. Peserta kombo dikira sekali dalam jumlah keseluruhan.

Halaman `/staff/registrations` membolehkan Admin dan Finance memindahkan pendaftaran tersalah ke Tong sampah serta memulihkannya dengan status pembayaran asal. Jumlah/laporan aktif mengecualikan pendaftaran yang dibuang; bukti dan sejarah dikekalkan, tindakan diaudit, serta pemeriksaan versi mengelakkan perubahan terhadap rekod lapuk. Akses peserta kepada pendaftaran/resit yang dibuang disekat sehingga dipulihkan.

Admin juga boleh memilih **Buang pendaftaran** terus pada baris Pendaftaran peserta atau dalam Butiran pendaftaran, termasuk butiran yang dibuka daripada Peserta mengikut modul. Pengesahan memaparkan nama, nombor pendaftaran dan jumlah peserta yang dipilih serta meminta sebab. Selepas dihantar, rekod dikeluarkan daripada statistik dan senarai aktif; pemulihan tersedia melalui Urus & pulihkan pendaftaran → Tong sampah.

Admin → Tetapan track menyediakan switch Paparkan track bagi Menengah dan Universiti. Hide hanya menutup paparan modul dan pendaftaran baharu bagi track tersebut; rekod peserta terdahulu dan laporan kekal tersedia kepada petugas. Kedua-dua track boleh disembunyikan. URL/API pendaftaran juga memeriksa tetapan ini.

Senarai Finance memaparkan 20 rekod setiap halaman dengan navigasi Sebelum/Seterusnya selepas carian dan penapis. Tanda semua memilih rekod pada halaman semasa sahaja; pilihan daripada halaman lain dikekalkan dalam jumlah serta langkah semakan seterusnya. Carian, status atau tab baharu kembali ke halaman pertama. Ringkasan Jumlah pengesahan dipilih berada dalam aliran halaman biasa di bawah senarai dan tidak lagi sticky/fixed.

Finance menggunakan menu sisi sepadan dengan Admin: logo P.A.K.A.R, Dashboard, Semakan bayaran, Peserta mengikut modul, urus/pulihkan pendaftaran, lihat website dan Log keluar. Menu aktif disorot cyan dan bilangan resit menunggu semakan dipaparkan pada menu Semakan bayaran. Pada skrin sehingga 900px, menu boleh dibuka/ditutup melalui butang menu, klik luar atau Escape.

Finance bermula pada menu Dashboard dengan statistik peserta belum bayar, resit belum disemak, sudah diapprove dan perlu tindakan, serta jumlah diterima dan statistik track/modul. Menu Semakan bayaran mengandungi proses tick empat langkah; pilihan dikekalkan apabila menukar menu. Kad statistik boleh membuka senarai status berkaitan.

Laporan Peserta mengikut modul pada Admin dan Finance kini menyenaraikan semua status, bukan peserta berbayar sahaja. Setiap modul menunjukkan kiraan sudah bayar/disahkan, belum bayar, belum disemak dan perlu tindakan, bersama nama, telefon, e-mel, institusi dan rujukan. Penapis status serta 20 rekod setiap halaman disediakan dalam setiap modul. Jumlah keseluruhan dikira sekali setiap pendaftaran; peserta kombo muncul dalam setiap modul yang dipilih.

Dalam Admin → Peserta mengikut modul, butang **Lihat butiran** membuka butiran penuh pendaftaran termasuk peserta yang telah disahkan pembayarannya. Nombor telefon peserta dan penjaga boleh diklik untuk membuka WhatsApp dalam tab baharu; nombor juga boleh diklik terus dalam senarai peserta modul. Nombor tempatan Malaysia dinormalkan dengan kod negara 60, sementara nombor antarabangsa mengekalkan kod negaranya. Nilai kosong atau format tidak sah kekal sebagai teks. Pautan menggunakan format rasmi [WhatsApp Click to Chat](https://faq.whatsapp.com/5913398998672934), tanpa menghantar mesej secara automatik.

Admin → Modul & harga mempunyai tab Modul aktif dan Modul tidak aktif, masing-masing dengan kiraan modul. Selepas menyimpan perubahan status modul, senarai beralih ke tab yang sesuai supaya modul yang dikemas kini terus kelihatan.

Panel slider kolaborator kini menggunakan latar biru navy dengan grid litar, bingkai cyan dan cahaya teal di belakang logo. Tiada panel putih digunakan; fail serta warna asal logo dikekalkan, dengan glow halus untuk memastikan tulisan gelap kekal jelas. Slider kekal automatik tanpa kawalan play/pause.

Gambaran keseluruhan Admin hanya memaparkan enam statistik utama: jumlah pendaftaran, belum bayar, belum disemak, sudah diapprove, jumlah diterima dan perlu tindakan. Senarai nama peserta serta banner persediaan tidak dipaparkan pada overview; fungsi penuh kekal dalam menu masing-masing.

Senarai peserta modul dipaparkan sebagai kad bergambar menggunakan cover dan accent modul, seperti halaman utama. Buka kad untuk tab Sudah disemak & diapprove, Belum disemak, Belum bayar dan Perlu tindakan yang berasingan. Setiap senarai mengekalkan 20 rekod setiap halaman.

QR pembayaran pelanggan dan pratonton muat naik Admin dipaparkan penuh pada nisbah asal, tanpa kotak square atau tinggi tetap. Pelanggan boleh membuka atau memuat turun fail QR asal untuk paparan lebih jelas.

Menu khusus Admin → Tetapan track menyediakan switch Menengah dan Universiti serta Simpan paparan track. Simpanan hanya mengemas kini flags visibility melalui endpoint admin yang dilindungi; harga, butiran modul dan tetapan pembayaran tidak disentuh. Kandungan website → Maklumat track mempunyai pintasan ke tetapan ini.
