/**
 * Daftar istilah dalam bahasa awam. Dipakai di tab Petunjuk (daftar lengkap) dan di
 * tanda tanya (?) pada form (hanya `short`). Angka contoh diambil dari ./example.js.
 *
 * Bentuk satu istilah:
 *  id       kunci unik, dipakai <HelpTip term="..."/>
 *  term     nama istilah
 *  alias    nama lain atau kepanjangan (ikut dicari)
 *  group    kelompok (lihat GLOSSARY_GROUPS)
 *  short    penjelasan satu sampai dua kalimat
 *  body     paragraf penjelasan lengkap
 *  formula  rumus (opsional)
 *  example  contoh angka dari data contoh (opsional)
 *  related  id istilah terkait
 */
import { EX } from './example.js';

export const GLOSSARY_GROUPS = [
  { id: 'dasar', label: 'Konsep dasar' },
  { id: 'angka', label: 'Angka dalam rumus' },
  { id: 'bangunan', label: 'Bangunan' },
  { id: 'tanah', label: 'Nilai tanah' },
  { id: 'lain', label: 'Lainnya' }
];

export const GLOSSARY = [
  /* ---------- Konsep dasar ---------- */
  {
    id: 'bmn',
    term: 'BMN',
    alias: 'Barang Milik Negara',
    group: 'dasar',
    short: 'Aset milik pemerintah, seperti tanah dan gedung, yang bisa dipakai sendiri atau disewakan kepada pihak lain.',
    body: [
      'BMN adalah singkatan dari Barang Milik Negara, misalnya tanah dan bangunan kantor, bandara, atau gudang yang dibeli dengan anggaran negara.',
      'Kalau BMN disewakan kepada pihak lain, penilai menentukan berapa sewa yang wajar. Tujuannya agar negara tidak dirugikan dan penyewa tidak membayar berlebihan.'
    ],
    example: `Pada data contoh, BMN yang dinilai adalah tanah ${EX.nama} seluas ${EX.area} m².`,
    related: ['nilai-wajar-sewa']
  },
  {
    id: 'nilai-wajar-sewa',
    term: 'Nilai wajar sewa',
    alias: 'nilai wajar',
    group: 'dasar',
    short: 'Uang sewa yang pantas dibayar untuk seluruh jangka waktu sewa, dihitung dari nilai properti dan kondisi pasar.',
    body: [
      'Nilai wajar adalah nilai yang pantas dalam transaksi antara pihak yang sama-sama paham dan tidak terpaksa. Untuk sewa, hasilnya adalah total uang yang sebaiknya dibayar penyewa untuk seluruh masa sewa.',
      'Aplikasi ini menghitungnya untuk jangka waktu 1, 2, 3, 4, dan 5 tahun, dengan anggapan sewa dibayar sekaligus di awal.'
    ],
    example: `Pada data contoh, sewa 5 tahun bernilai ${EX.rounded5}, atau rata-rata ${EX.perYear5} per tahun. Untuk sewa 1 tahun, nilainya ${EX.rounded1}.`,
    related: ['dibayar-dimuka', 'dcf']
  },
  {
    id: 'dibayar-dimuka',
    term: 'Sewa dibayar di muka',
    alias: 'dibayar sekaligus',
    group: 'dasar',
    short: 'Seluruh sewa dibayar sekaligus di awal. Karena itu uang sewa tahun pertama tidak didiskon.',
    body: [
      'Dalam aplikasi ini, penyewa membayar sewa untuk seluruh jangka waktu sekaligus pada hari pertama. Jadi uang sewa tahun pertama sudah ada di tangan hari ini, nilainya tidak berkurang sama sekali.',
      'Uang sewa tahun ke-2 dan seterusnya dihitung seolah-olah baru diterima setahun, dua tahun, dan seterusnya kemudian, sehingga nilainya hari ini lebih kecil. Pengurangan itu disebut diskonto.'
    ],
    example: `Faktor diskonto tahun ke-1 adalah 1,0000 (tidak berkurang). Tahun ke-2 adalah ${EX.df2}.`,
    related: ['faktor-diskonto', 'nilai-kini']
  },
  {
    id: 'dcf',
    term: 'Discounted cashflow (DCF)',
    alias: 'arus kas terdiskonto',
    group: 'dasar',
    short: 'Metode menghitung nilai dengan memperkirakan uang sewa tiap tahun, lalu menurunkannya ke nilai hari ini.',
    body: [
      'Idenya sederhana: uang Rp 100 juta yang Anda pegang hari ini lebih berharga daripada Rp 100 juta yang baru diterima tahun depan, karena uang hari ini bisa langsung diinvestasikan.',
      'Pada metode ini penilai memproyeksikan uang sewa setiap tahun, mengubah masing-masing menjadi nilai hari ini (nilai kini), lalu menjumlahkannya. Jumlah itulah nilai wajar sewa.'
    ],
    related: ['arus-kas', 'nilai-kini', 'diskonto']
  },
  {
    id: 'arus-kas',
    term: 'Arus kas',
    alias: 'cashflow',
    group: 'dasar',
    short: 'Uang sewa yang diharapkan diterima tiap tahun. Tahun ke-1 dihitung dari nilai properti, tahun berikutnya naik sesuai kenaikan sewa.',
    body: [
      'Arus kas di sini adalah uang sewa per tahun. Arus kas tahun ke-1 adalah nilai properti dikali tingkat kapitalisasi. Tahun ke-2 adalah arus kas tahun ke-1 dikali (1 + kenaikan sewa), dan seterusnya.'
    ],
    formula: 'arus kas tahun t = arus kas tahun (t−1) × (1 + kenaikan sewa)',
    example: `Tahun ke-1: ${EX.cf1}. Tahun ke-2: ${EX.cf2} (naik ${EX.g}).`,
    related: ['kapitalisasi', 'kenaikan-sewa']
  },
  {
    id: 'nilai-kini',
    term: 'Nilai kini',
    alias: 'present value, PV',
    group: 'dasar',
    short: 'Nilai uang di masa depan jika dihitung pada hari ini. Semakin jauh waktunya, semakin kecil nilai kininya.',
    body: [
      'Nilai kini diperoleh dengan mengalikan arus kas dengan faktor diskonto. Nilai kini semua tahun dijumlahkan menjadi nilai wajar sewa.'
    ],
    formula: 'nilai kini = arus kas × faktor diskonto',
    example: `Arus kas tahun ke-2 ${EX.cf2} × faktor ${EX.df2} = nilai kini ${EX.pv2}.`,
    related: ['faktor-diskonto', 'diskonto']
  },
  {
    id: 'tenor',
    term: 'Jangka waktu sewa',
    alias: 'tenor',
    group: 'dasar',
    short: 'Lama sewa, 1 sampai 5 tahun. Setiap jangka waktu punya risk free dan hasil hitung sendiri.',
    body: [
      'Aplikasi menghitung lima skenario sekaligus. Tiap skenario memakai risk free dengan jangka waktu yang sama, karena imbal hasil obligasi 1 tahun berbeda dengan 5 tahun.',
      'Pilih salah satu baris di tabel hasil untuk melihat proyeksi, grafik, dan langkah hitung skenario itu.'
    ],
    related: ['risk-free']
  },
  {
    id: 'nilai-properti',
    term: 'Nilai properti',
    alias: 'nilai objek penilaian',
    group: 'dasar',
    short: 'Nilai tanah, ditambah nilai bangunan bila objeknya tanah dan bangunan. Ini dasar untuk menghitung sewa.',
    body: [
      'Sewa yang wajar dihitung sebagai persentase dari nilai properti. Makin tinggi nilai properti, makin tinggi sewanya.',
      'Nilai tanah bisa diisi langsung dari hasil penilaian Anda, atau diambil dari modul nilai tanah di tab Nilai tanah. Nilai bangunan selalu diisi langsung.'
    ],
    example: `Pada data contoh (tanah saja), nilai properti ${EX.nilai}. Bila ditambah bangunan ${EX.b.nilai}, nilai propertinya ${EX.b.total}.`,
    related: ['nilai-bangunan', 'pendekatan-pasar']
  },

  /* ---------- Angka dalam rumus ---------- */
  {
    id: 'risk-free',
    term: 'Risk free',
    alias: 'tingkat bebas risiko, risk free rate',
    group: 'angka',
    short: 'Imbal hasil investasi yang dianggap hampir tanpa risiko, biasanya bunga obligasi pemerintah dengan jangka waktu yang sama dengan sewa.',
    body: [
      'Bayangkan Anda punya uang dan bisa menaruhnya di obligasi pemerintah yang hampir pasti dibayar. Itulah patokan paling aman. Investasi lain, termasuk menyewakan properti, harus menjanjikan paling tidak sebesar itu.',
      'Karena itu risk free menjadi titik awal untuk menentukan seberapa besar sewa dibanding nilai propertinya. Yang dipakai adalah imbal hasil (yield) Surat Berharga Negara dengan jangka waktu yang sama dengan lama sewa.',
      'Cara mengisi: cari imbal hasil obligasi pemerintah Indonesia untuk tenor 1 sampai 5 tahun di situs data pasar (misalnya Investing.com atau PHEI), isi per jangka waktu, dan tulis sumbernya. Bila hanya punya tenor 5 tahun, centang "Pakai risk free tenor 5 tahun untuk semua jangka waktu".'
    ],
    example: `Pada data contoh, risk free ${EX.rf} (imbal hasil obligasi Indonesia 5 tahun) untuk semua jangka waktu.`,
    related: ['sbn', 'kapitalisasi', 'tenor']
  },
  {
    id: 'sbn',
    term: 'SBN dan imbal hasil (yield)',
    alias: 'Surat Berharga Negara, obligasi',
    group: 'angka',
    short: 'SBN adalah surat utang pemerintah. Imbal hasil atau yield adalah persentase keuntungan per tahun bagi pemegangnya.',
    body: [
      'Pemerintah meminjam uang dari masyarakat dengan menerbitkan Surat Berharga Negara (SBN), atau obligasi. Pemegangnya mendapat bunga. Persentase keuntungan tahunan itu disebut imbal hasil atau yield, dan berubah mengikuti kondisi pasar.',
      'Yield SBN untuk tenor tertentu dipakai sebagai risk free untuk tenor yang sama.'
    ],
    related: ['risk-free']
  },
  {
    id: 'kapitalisasi',
    term: 'Tingkat kapitalisasi',
    alias: 'cap rate',
    group: 'angka',
    short: 'Persentase yang mengubah nilai properti menjadi uang sewa tahun pertama. Rumusnya risk free + recapture − kenaikan sewa.',
    body: [
      'Kalau properti Rp 100 juta dan tingkat kapitalisasinya 6%, sewa tahun pertama yang wajar adalah Rp 6 juta. Makin tinggi risk free atau recapture, makin tinggi persentasenya.',
      'Kenaikan sewa mengurangi tingkat kapitalisasi karena sewa yang naik tiap tahun berarti sewa tahun pertama boleh lebih rendah untuk mencapai imbal hasil yang sama.'
    ],
    formula: 'kapitalisasi = risk free + recapture − kenaikan sewa',
    example: `${EX.rf} + ${EX.rc} − ${EX.g} = ${EX.cap}. Lalu ${EX.nilai} × ${EX.cap} = sewa tahun pertama ${EX.cf1}.`,
    related: ['risk-free', 'recapture', 'kenaikan-sewa', 'arus-kas']
  },
  {
    id: 'kenaikan-sewa',
    term: 'Tingkat kenaikan sewa',
    alias: 'pertumbuhan sewa, growth',
    group: 'angka',
    short: 'Perkiraan kenaikan sewa per tahun, biasanya rata-rata kenaikan di masa lalu, dipakai untuk memproyeksikan sewa tahun ke-2 dan seterusnya.',
    body: [
      'Sewa umumnya naik dari tahun ke tahun. Penilai memperkirakannya dari data kenaikan sewa beberapa tahun terakhir, misalnya indeks harga properti komersial dari Bank Indonesia. Aplikasi merata-ratakan data itu, lalu membulatkannya ke 2 desimal.',
      'Bila Anda sudah punya angkanya sendiri, pilih "Input manual".'
    ],
    example: `Pada data contoh, rata-rata ${EX.gCount} data tahunan adalah ${EX.gAvg}, dibulatkan menjadi ${EX.gUsed}.`,
    related: ['kapitalisasi', 'arus-kas']
  },
  {
    id: 'diskonto',
    term: 'Tingkat diskonto',
    alias: 'discount rate',
    group: 'angka',
    short: 'Persentase untuk menurunkan uang masa depan ke nilai hari ini. Besarnya sama dengan risk free + recapture.',
    body: [
      'Makin tinggi tingkat diskonto, makin kecil nilai kini uang yang baru diterima di tahun-tahun belakang. Di aplikasi ini tingkat diskonto dihitung sebagai tingkat kapitalisasi + kenaikan sewa, yang hasilnya sama dengan risk free + recapture.'
    ],
    formula: 'diskonto = kapitalisasi + kenaikan sewa',
    example: `${EX.cap} + ${EX.g} = ${EX.disc}.`,
    related: ['faktor-diskonto', 'nilai-kini']
  },
  {
    id: 'faktor-diskonto',
    term: 'Faktor diskonto',
    alias: '',
    group: 'angka',
    short: 'Angka pengali (di bawah atau sama dengan 1) untuk mengubah arus kas suatu tahun menjadi nilai kini.',
    body: [
      'Tahun ke-1 faktornya 1 karena sewa dibayar di muka. Tahun-tahun berikutnya faktornya makin kecil.'
    ],
    formula: 'faktor tahun t = 1 ÷ (1 + diskonto)^(t − 1)',
    example: `Faktor tahun ke-1 sampai ke-5 pada data contoh: ${EX.rows.map((r) => r.df).join('; ')}.`,
    related: ['diskonto', 'nilai-kini']
  },
  {
    id: 'pembulatan',
    term: 'Pembulatan ke ribuan',
    alias: '',
    group: 'angka',
    short: 'Hasil akhir dibulatkan ke ribuan rupiah terdekat, sama seperti ROUND(…, −3) di Excel KKAP.',
    body: [
      'Hasil hitung biasanya mengandung pecahan rupiah. Sesuai kebiasaan KKAP, nilai akhir dibulatkan ke ribuan. Nilai tanah di modul nilai tanah juga dibulatkan ke ribuan.'
    ],
    example: `${EX.total5} dibulatkan menjadi ${EX.rounded5}.`,
    related: ['nilai-wajar-sewa']
  },

  /* ---------- Bangunan ---------- */
  {
    id: 'recapture',
    term: 'Recapture rate',
    alias: 'tingkat pengembalian modal',
    group: 'bangunan',
    short: 'Tambahan persentase untuk mengembalikan modal bangunan yang makin menyusut dan akhirnya habis umur. Tanah saja bernilai 0%.',
    body: [
      'Tanah tidak habis dipakai, tetapi bangunan lama-kelamaan menyusut nilainya hingga habis umur ekonomisnya. Pemilik perlu "mengembalikan" modal bangunan dari sewa sebelum itu terjadi. Tambahan persentase itulah recapture rate.',
      'Besarnya 1 dibagi sisa umur ekonomis bangunan. Makin pendek sisa umurnya, makin besar recapture-nya. Sesuai rumus KKAP, persentase ini diterapkan ke seluruh nilai properti (tanah dan bangunan).',
      'Untuk objek tanah saja, recapture 0%.'
    ],
    formula: 'recapture = 1 ÷ sisa umur ekonomis',
    example: `Sisa umur ${EX.b.sisa} tahun (${EX.b.ue} − ${EX.b.uf}) memberi recapture ${EX.b.rc}. Tingkat kapitalisasi naik menjadi ${EX.b.cap}, dan nilai wajar sewa 5 tahun menjadi ${EX.b.rounded5}.`,
    related: ['sisa-umur', 'kapitalisasi']
  },
  {
    id: 'umur-ekonomis',
    term: 'Umur ekonomis',
    alias: '',
    group: 'bangunan',
    short: 'Total masa bangunan masih layak dipakai secara ekonomis sejak baru dibangun, misalnya 40 tahun.',
    body: [
      'Umur ekonomis bergantung pada jenis dan konstruksi bangunan. Gunakan angka yang Anda pakai dalam penilaian bangunan.'
    ],
    related: ['umur-efektif', 'sisa-umur']
  },
  {
    id: 'umur-efektif',
    term: 'Umur efektif',
    alias: '',
    group: 'bangunan',
    short: 'Umur bangunan menurut kondisinya sekarang, bukan menurut tahun berdiri. Bangunan terawat baik umur efektifnya lebih muda.',
    body: [
      'Bangunan yang dibangun 30 tahun lalu tetapi dirawat dan direnovasi dengan baik bisa saja berumur efektif 15 tahun. Sebaliknya bangunan yang terbengkalai bisa lebih tua dari umur sebenarnya.'
    ],
    related: ['umur-ekonomis', 'sisa-umur']
  },
  {
    id: 'sisa-umur',
    term: 'Sisa umur ekonomis',
    alias: '',
    group: 'bangunan',
    short: 'Berapa tahun lagi bangunan masih bisa dipakai: umur ekonomis dikurangi umur efektif.',
    body: [
      'Angka ini menentukan recapture rate. Bila umur efektif sama dengan atau melebihi umur ekonomis, sisa umurnya habis, recapture tidak bisa dihitung, dan aplikasi memberi peringatan.'
    ],
    formula: 'sisa umur = umur ekonomis − umur efektif',
    example: `${EX.b.ue} − ${EX.b.uf} = ${EX.b.sisa} tahun.`,
    related: ['recapture']
  },
  {
    id: 'nilai-bangunan',
    term: 'Nilai bangunan',
    alias: '',
    group: 'bangunan',
    short: 'Hasil penilaian bangunan, misalnya dengan pendekatan biaya, yang diisi langsung di aplikasi.',
    body: [
      'Aplikasi tidak menghitung nilai bangunan. Hitung dulu di kertas kerja penilaian bangunan, lalu masukkan hasilnya.'
    ],
    related: ['nilai-properti', 'recapture']
  },

  /* ---------- Nilai tanah ---------- */
  {
    id: 'pendekatan-pasar',
    term: 'Pendekatan pembandingan data pasar',
    alias: 'market approach',
    group: 'tanah',
    short: 'Nilai tanah ditaksir dari harga tanah serupa di sekitar yang baru dijual atau ditawarkan, setelah disesuaikan dengan perbedaannya.',
    body: [
      'Cara berpikirnya seperti menaksir harga rumah dengan melihat harga rumah tetangga. Tanah yang dinilai dibandingkan dengan tiga tanah pembanding. Harga masing-masing pembanding dikoreksi lebih dulu (kondisi transaksi dan kondisi fisik tanah), lalu hasilnya digabung dengan bobot.',
      'Tahapannya ada empat di tab Nilai tanah: (1) data pembanding, (2) penyesuaian transaksi, (3) penyesuaian properti dengan ranking analysis, dan (4) pembobotan data pembanding.'
    ],
    related: ['data-pembanding', 'ranking', 'bobot-pembanding']
  },
  {
    id: 'data-pembanding',
    term: 'Data pembanding',
    alias: 'transaksi dan penawaran',
    group: 'tanah',
    short: 'Tanah serupa di sekitar objek yang baru dijual (transaksi) atau masih ditawarkan (penawaran), dipakai sebagai acuan harga.',
    body: [
      'Data transaksi adalah harga yang sudah disepakati. Data penawaran adalah harga yang diminta penjual, biasanya masih bisa turun, sehingga perlu disesuaikan (baris "Kondisi penjualan" pada penyesuaian transaksi).',
      'Aplikasi memakai tiga pembanding. Untuk masing-masing, isi luas, harga properti, dan nilai bangunan di atasnya (bila ada).'
    ],
    example: `Pada data contoh, pembanding 2 dan 3 adalah data penawaran dan diberi penyesuaian kondisi penjualan −3%.`,
    related: ['ekstraksi', 'penyesuaian-transaksi']
  },
  {
    id: 'ekstraksi',
    term: 'Ekstraksi bangunan',
    alias: 'harga tanah dari harga properti',
    group: 'tanah',
    short: 'Bila tanah pembanding dijual bersama bangunan, nilai bangunannya dikurangkan dulu agar yang dibandingkan hanya tanah.',
    body: [
      'Baris "Ekstraksi nilai bangunan" pada data pembanding dipakai untuk ini. Isi 0 untuk tanah kosong.'
    ],
    formula: 'harga tanah = harga properti − nilai bangunan; harga per m² = harga tanah ÷ luas',
    related: ['data-pembanding']
  },
  {
    id: 'penyesuaian-transaksi',
    term: 'Penyesuaian transaksi',
    alias: 'adjustment transaksi',
    group: 'tanah',
    short: 'Lima koreksi harga pembanding (jenis dokumen/hak, pembiayaan, kondisi penjualan, biaya setelah pembelian, kondisi pasar) yang diterapkan berurutan.',
    body: [
      'Setiap koreksi diisi dalam persen. Karena diterapkan berurutan, hasil koreksi pertama menjadi dasar untuk koreksi kedua, dan seterusnya (perkalian bertingkat), bukan dijumlahkan begitu saja.'
    ],
    related: ['data-pembanding', 'ranking']
  },
  {
    id: 'ranking',
    term: 'Ranking analysis',
    alias: 'skor, penyesuaian karakteristik',
    group: 'tanah',
    short: 'Membandingkan tanah objek dengan tiap pembanding lewat skor 1 sampai 5 pada 9 kriteria, lalu selisih skor diubah menjadi persentase koreksi harga.',
    body: [
      'Skor 5 berarti sangat baik dan skor 1 jelek sekali (panduan lengkap ada di tab Nilai tanah). Bila objek lebih baik dari pembanding pada suatu kriteria, harga pembanding dinaikkan, dan sebaliknya.',
      'Skor luas tanah dihitung otomatis dari luasnya.'
    ],
    formula: 'penyesuaian = (skor objek − skor pembanding) ÷ 5 × bobot kriteria',
    example: `Kriteria lokasi: skor objek ${EX.rank.op}, pembanding 2 ${EX.rank.c}, bobot ${EX.rank.w}%. Hasilnya (${EX.rank.op} − ${EX.rank.c}) ÷ 5 × ${EX.rank.w}% = ${EX.rank.adj}.`,
    related: ['bobot-kriteria', 'pendekatan-pasar']
  },
  {
    id: 'bobot-kriteria',
    term: 'Bobot kriteria',
    alias: '',
    group: 'tanah',
    short: 'Seberapa besar pengaruh tiap kriteria (lokasi, akses, dan seterusnya) terhadap harga. Total semua bobot 100%.',
    body: [
      'Lokasi, aksesibilitas, dan fasilitas umumnya berbobot besar karena paling mempengaruhi harga. Bobot bisa diubah di tabel pada tab Nilai tanah.'
    ],
    related: ['ranking']
  },
  {
    id: 'bobot-pembanding',
    term: 'Bobot pembanding',
    alias: 'bobot saran',
    group: 'tanah',
    short: 'Seberapa dipercaya tiap pembanding saat harga ketiganya digabung. Total harus 100%.',
    body: [
      'Pembanding yang paling mirip dengan objek (koreksinya paling kecil) layak diberi bobot paling besar. Tombol "Pakai bobot saran" menghitungnya otomatis: makin kecil total koreksi sebuah pembanding, makin besar bobotnya. Anda bebas mengubahnya sesuai pertimbangan penilai.'
    ],
    example: `Pada data contoh, bobotnya ${EX.wComp}.`,
    related: ['ranking', 'pendekatan-pasar']
  },

  /* ---------- Lainnya ---------- */
  {
    id: 'per-m2-bulan',
    term: 'Sewa per m² per bulan',
    alias: '',
    group: 'lain',
    short: 'Sewa dibagi luas tanah dan 12 bulan, supaya mudah dibandingkan dengan sewa properti lain.',
    body: [
      'Aplikasi menampilkan dua angka: sewa tahun ke-1 per m² per bulan, dan rata-rata selama jangka waktu sewa (nilai wajar ÷ jumlah tahun ÷ luas ÷ 12).'
    ],
    example: `Tahun ke-1 pada data contoh: ${EX.perM2y1} per m² per bulan.`,
    related: ['uji-kewajaran']
  },
  {
    id: 'uji-kewajaran',
    term: 'Uji kewajaran',
    alias: 'sewa pembanding',
    group: 'lain',
    short: 'Memeriksa apakah hasil penilaian masuk akal dengan membandingkannya dengan sewa per m² properti sejenis.',
    body: [
      'Isi nama, luas, dan sewa per tahun beberapa properti sejenis (misalnya bandara lain). Aplikasi menghitung sewa per m² per tahun dan per bulan masing-masing, lalu menampilkannya bersama hasil penilaian Anda.',
      'Bagian ini opsional dan tidak mempengaruhi hasil hitung.'
    ],
    related: ['per-m2-bulan']
  },
  {
    id: 'kkap',
    term: 'KKAP',
    alias: 'Kertas Kerja Penilaian',
    group: 'lain',
    short: 'Berkas hitungan penilai (di DJKN berbentuk Excel) yang memuat data, perhitungan, dan kesimpulan nilai.',
    body: [
      'Rumus aplikasi ini mengikuti KKAP sewa metode DCF, dan data contohnya diambil dari KKAP Sewa UPBU Mozes Kilangin Timika. Aplikasi adalah alat bantu dan bahan belajar. Kesimpulan akhir tetap tanggung jawab penilai.'
    ],
    related: ['bmn']
  }
];

export const TERM_BY_ID = Object.fromEntries(GLOSSARY.map((t) => [t.id, t]));
