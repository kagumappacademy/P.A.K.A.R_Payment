# P.A.K.A.R — Portal Pendaftaran & Pembayaran

Website bertema **Misi Cuti Sekolah Akhir Tahun 2026**, berfokus kepada pelajar sekolah menengah. Mengandungi landing page, dua track, 10 modul, kombo automatik, pendaftaran tiga langkah, DuitNow QR manual, resit persendirian dan portal admin. Dibina menggunakan Next.js App Router, React, TypeScript dan `mysql2`.

## Buka localhost yang telah disediakan

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin
- E-mel dan kata laluan admin tempatan ada dalam fail **`.local-admin.txt`**. Fail ini dan `.env.local` diabaikan Git.
- Untuk menjalankan semula selepas menutup aplikasi / restart komputer, buka PowerShell dalam folder projek dan jalankan:

```powershell
.\Start-Local.ps1
```

Skrip ini menjalankan database terasing di port **3307** menggunakan binari MariaDB XAMPP (`C:\xampp\mysql`). Data projek disimpan dalam `.local\mysql-data`. MariaDB ialah database yang serasi dengan protokol MySQL; aplikasi dan skema juga menggunakan SQL yang serasi dengan MySQL. Database XAMPP sedia ada pada port 3306 mempunyai jadual sistem rosak ketika persediaan, jadi ia tidak digunakan untuk aplikasi ini. Tiada pembaikan atau pemadaman data projek lain dilakukan.

Hentikan website dengan `Ctrl+C` pada terminal. Database tempatan kekal berjalan untuk kegunaan semula; untuk menghentikannya dengan kemas:

```powershell
& 'C:\xampp\mysql\bin\mysqladmin.exe' --host=127.0.0.1 --port=3307 --user=root shutdown
```

## Tetapan awal yang perlu disemak

Maklumat track, nama modul dan tempoh **5–31 Disember 2026** diambil daripada poster pengguna. Penerangan dan hasil pembelajaran ialah draf yang boleh disunting admin.

1. **Admin → Tetapan pembayaran:** muat naik QR DuitNow pembayaran rasmi dan isi nama penerima. QR pada poster asal ialah QR pendaftaran; ia tidak digunakan sebagai QR pembayaran. Sehingga QR rasmi disediakan, peserta boleh menyimpan pendaftaran tetapi tidak menghantar resit.
2. **Admin → Modul & harga:** semak harga awal RM39/modul sekolah dan RM59/modul universiti. Harga universiti ialah cadangan permulaan, bukan harga yang dinyatakan poster.
3. Diskaun awal: 2 modul **10%**, 3 atau lebih **20%**, semua modul aktif dalam track **25%**. Diskaun terbaik dikenakan sekali; harga dibekukan semasa pendaftaran. Semua kadar boleh diubah. Semak juga teks promosi dalam FAQ selepas menukar kadar.
4. Semak jadual setiap modul, lokasi, telefon WhatsApp, e-mel, hasil pembelajaran dan maklumat fizikal/online. Jadual serta lokasi sebenar belum dibekalkan, jadi tiada jadual rekaan digunakan.
5. Poster setiap modul telah disediakan sebagai SVG bertema warna berbeza. Ganti dengan poster sebenar melalui editor modul jika diperlukan.

## Aliran peserta

1. Pilih track dari landing page; isi nama, e-mel, telefon, institusi dan umur. Peserta bawah 18 tahun perlu maklumat penjaga.
2. Pilih satu atau lebih modul. Jumlah dan kombo dikira serta disahkan semula di server. Berikan persetujuan penggunaan maklumat.
3. Pendaftaran disimpan dengan nombor rawak unik. Imbas QR rasmi melalui aplikasi bank; jumlah yang perlu dibayar dipaparkan. Muat naik resit PNG/JPG/WEBP/PDF, maksimum 3MB. Peserta tidak perlu memasukkan nombor rujukan transaksi.
4. Selepas bukti pembayaran dihantar, resit pendaftaran bernombor dijana secara automatik. Peserta boleh melihat atau memuat turun PDF, kemudian menekan butang menyertai kumpulan WhatsApp track mereka jika admin telah menyediakan pautan. Status resit kekal **Menunggu semakan** sehingga admin mengesahkan pembayaran.
5. Semak status menggunakan nombor pendaftaran dan e-mel melalui `/semak`. Jika resit ditolak, nota admin dipaparkan dan peserta boleh memuat naik resit baharu.

Pembayaran **disemak secara manual** oleh admin. Tiada transaksi bank, debit automatik atau pengesahan terus dengan DuitNow dilakukan oleh aplikasi.

## Portal admin

- Dashboard jumlah pendaftaran, resit menunggu semakan, penyertaan disahkan dan jumlah bayaran yang disahkan.
- Carian, penapisan status, butiran penuh peserta dan penjaga, paparan resit, pengesahan/penolakan dengan nota, eksport CSV.
- Tambah / edit modul, harga, warna, poster, jadual, hasil pembelajaran dan status aktif.
- Edit landing page, maklumat program, track, FAQ, notis privasi, imej utama serta poster rasmi. Editor JSON penuh turut tersedia untuk manfaat dan semua medan kandungan.
- Edit DuitNow QR, nama penerima, kadar kombo dan pautan jemputan kumpulan WhatsApp berasingan untuk Sekolah Menengah / Universiti; tukar kata laluan admin.

## Database & fail

Skema ada dalam `database/schema.sql`. Persediaan bersifat idempoten dan tidak menulis semula kandungan atau akaun sedia ada:

```powershell
npm.cmd install
npm.cmd run db:setup
npm.cmd run dev
```

Untuk mesin baharu: buat database kosong serta pengguna MySQL yang mempunyai hak pada database itu, salin `.env.example` kepada `.env.local`, kemudian jalankan arahan di atas. Node.js **24 LTS** disyorkan; aplikasi Next.js memerlukan sekurang-kurangnya Node.js 20.9.

Jadual: `settings`, `modules`, `admins`, `registrations`, `files`, `file_chunks`, `rate_limits`, `audit_logs`. Resit dan imej yang dimuat naik disimpan dalam database, bukan filesystem sementara Vercel. Kandungan fail dipecah kepada cebisan 256KB supaya serasi dengan had paket MySQL kecil. Backup database merangkumi resit dan poster yang dimuat naik. Tetapkan had storan/backup pada penyedia MySQL mengikut jumlah peserta; storan objek boleh ditambah untuk skala yang lebih besar.

Kawalan yang disediakan: kata laluan bcrypt, sesi bertandatangan 8 jam dalam cookie HttpOnly, Secure pada production, semakan asal permintaan, validasi server, pertanyaan berparameter, kadar cubaan berasaskan database, semakan format sebenar fail, resit terhad kepada admin, harga disahkan server, idempotensi pendaftaran dan log tindakan admin. Pelanggan tidak boleh mengesahkan bayaran sendiri. Jangan kongsi `.env.local` atau `.local-admin.txt`.

## Semakan

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
# Dengan localhost sedang berjalan dan database tempatan tersedia:
node --env-file=.env.local scripts/verify-local.mjs
```

Ujian unit meliputi harga, pembundaran, kadar kombo dan validasi. Skrip integrasi menjalankan aliran API dengan database sebenar: login, pendaftaran, manipulasi harga/track, idempotensi, muat naik fail, kawalan akses resit, penolakan/hantar semula/pengesahan, edit modul dan CSV. Ia terhad kepada localhost, memulihkan tetapan asal serta membuang data ujian sendiri.

## Persediaan Vercel — belum diterbitkan

1. Sediakan **MySQL terurus yang boleh dicapai Vercel melalui rangkaian**. Database localhost komputer anda tidak boleh digunakan terus oleh Vercel. Gunakan pangkalan data produksi berasingan dengan TLS dan pengguna khusus.
2. Simpan kod dalam repo Git peribadi; `.env.local`, kata laluan dan `.local` jangan dimuat naik. Import repo ke Vercel, framework **Next.js**, Node.js 24, build command `npm run build`. Tiada static export diperlukan.
3. Tetapkan `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_SSL=true`, `SESSION_SECRET` rawak baharu, `ADMIN_EMAIL`, `ADMIN_PASSWORD` kukuh dan `APP_URL=https://domain-anda` sebagai environment variables. Simpan rahsia secara berasingan untuk production dan preview. Untuk migration tempatan guna fail `.env.local` yang disambungkan ke database sasaran, kemudian pulihkan konfigurasi tempatan.
4. Jalankan `npm run db:setup` terhadap database produksi dari persekitaran dipercayai sebelum deployment pertama. Ini menyediakan skema dan akaun admin awal. Tukar `ADMIN_PASSWORD` dalam env sahaja tidak menukar akaun sedia ada; gunakan halaman Akaun admin.
5. Untuk memindahkan kandungan dan muat naik localhost, eksport/import database aplikasi termasuk `files` serta `file_chunks`. Backup hendaklah disimpan secara sulit kerana mengandungi maklumat peserta. Alternatif: mulakan dengan seed bersih dan isi semula tetapan produksi melalui admin.
6. Deploy, lengkapkan QR/harga/jadual dan uji pendaftaran percubaan sebelum membuka pendaftaran sebenar. Semak had database dan Vercel. Muat naik dihadkan 3MB supaya permintaan kekal di bawah had payload fungsi.

Rujukan rasmi: [Next.js](https://nextjs.org/docs/app/getting-started/installation), [Deploy Next.js di Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs), [Had payload fungsi](https://vercel.com/docs/errors/function_payload_too_large).

Tiada deployment atau akaun cloud dibuat dalam kerja localhost ini.

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
- Tiada perubahan skema MySQL diperlukan; tetapan dan metadata resit disimpan dalam medan JSON sedia ada. Rekod lama masih boleh dibaca. Medan mod pembelajaran serta rujukan transaksi lama tidak lagi dikumpulkan dalam borang atau dimasukkan dalam eksport CSV baharu.
