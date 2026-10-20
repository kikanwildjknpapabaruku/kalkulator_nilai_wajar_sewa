/**
 * Isi tab Petunjuk selain daftar istilah: langkah pemakaian, cara membaca hasil, dan tanya jawab.
 * `go` pada langkah menentukan tombol "Buka bagian ini" (id bagian pada tab Sewa, atau aksi khusus).
 */

export const INTRO = [
  'Aplikasi ini menghitung berapa sewa yang wajar untuk BMN (tanah, atau tanah dan bangunan) bila sewa untuk seluruh jangka waktu dibayar sekaligus di muka. Hasilnya muncul langsung saat Anda mengisi data, untuk sewa 1, 2, 3, 4, dan 5 tahun.',
  'Metodenya discounted cashflow (DCF) mengikuti KKAP Sewa UPBU Mozes Kilangin Timika. Cara terbaik untuk belajar adalah memuat data contoh, lalu mengubah angkanya satu per satu dan melihat hasilnya ikut berubah.'
];

export const STEPS = [
  {
    title: 'Isi objek dan nilai properti',
    text: 'Pilih apakah objeknya tanah saja atau tanah dan bangunan, lalu isi luas tanah. Nilai tanah bisa diketik langsung dari hasil penilaian Anda, atau dihitung di tab Nilai tanah. Untuk tanah dan bangunan, isi juga nilai bangunan, umur ekonomis, dan umur efektif.',
    go: { section: 'in-objek', label: 'Buka bagian 1' }
  },
  {
    title: 'Tentukan tingkat kenaikan sewa',
    text: 'Isi kenaikan sewa per tahun dari data masa lalu (misalnya indeks harga properti komersial Bank Indonesia). Aplikasi merata-ratakannya. Bila angkanya sudah ada, pilih "Input manual". Tulis sumbernya.',
    go: { section: 'in-kenaikan', label: 'Buka bagian 2' }
  },
  {
    title: 'Isi risk free',
    text: 'Isi imbal hasil obligasi pemerintah untuk jangka waktu sewa. Bila hanya punya angka tenor 5 tahun, biarkan kotak "Pakai risk free tenor 5 tahun untuk semua jangka waktu" tercentang. Untuk objek tanah dan bangunan, recapture dihitung otomatis dari umur bangunan.',
    go: { section: 'in-riskfree', label: 'Buka bagian 3' }
  },
  {
    title: 'Tambahkan sewa pembanding (opsional)',
    text: 'Isi sewa properti sejenis untuk memeriksa apakah hasil Anda masuk akal. Bagian ini tidak mempengaruhi hasil hitung.',
    go: { section: 'in-pembanding', label: 'Buka bagian 4' }
  },
  {
    title: 'Baca hasilnya',
    text: 'Kotak besar di kanan atas (atau di bawah pada layar kecil) adalah nilai wajar sewa 5 tahun. Tabel di bawahnya memuat nilai untuk 1 sampai 5 tahun. Klik jangka waktunya untuk melihat rinciannya.',
    go: { section: 'out-tabel', label: 'Lihat hasil' }
  },
  {
    title: 'Pelajari langkah hitungnya',
    text: 'Pada bagian Rincian ada tiga tampilan: Proyeksi DCF (tabel tahun demi tahun), Grafik, dan Langkah hitung (7 tahap dengan angka Anda sendiri dimasukkan ke rumus).',
    go: { section: 'out-rincian', label: 'Buka langkah hitung', detailTab: 'langkah' }
  },
  {
    title: 'Simpan sebagai PDF',
    text: 'Tombol Generate PDF membuat laporan A4 berisi asumsi, langkah hitung, proyeksi, dan hasil. Isi identitas penilai di jendela yang muncul, lalu pilih bagian yang ingin dimuat.',
    go: { action: 'pdf', label: 'Buka Generate PDF' }
  }
];

export const READING = [
  {
    t: 'Kotak nilai besar',
    d: 'Nilai wajar sewa untuk 5 tahun yang dibayar sekaligus di muka, lengkap dengan terbilang dan rata-rata per tahun.'
  },
  {
    t: 'Tabel jangka waktu',
    d: 'Satu baris untuk tiap jangka waktu 1 sampai 5 tahun, berisi risk free, tingkat kapitalisasi, diskonto, arus kas tahun pertama, nilai wajar sewa, dan rata-rata sewa per m² per bulan. Klik jangka waktunya (misalnya "3 tahun") untuk melihat rincian skenario itu.'
  },
  {
    t: 'Proyeksi DCF',
    d: 'Untuk jangka waktu yang dipilih: uang sewa tiap tahun, faktor diskonto, dan nilai kininya. Jumlah nilai kini adalah nilai wajar sewa.'
  },
  {
    t: 'Peringatan berwarna',
    d: 'Kuning berarti ada data yang belum diisi atau perlu dicek. Merah berarti angkanya tidak masuk akal secara hitungan, misalnya kenaikan sewa lebih besar dari risk free.'
  }
];

export const FAQ = [
  {
    id: 'faq-simpan',
    q: 'Di mana data saya disimpan?',
    a: 'Hanya di browser pada perangkat yang Anda pakai, tersimpan otomatis setiap kali Anda mengisi. Data tidak dikirim ke server mana pun. Karena itu data tidak ikut bila Anda pindah komputer atau menghapus data situs browser. Simpan hasil penting sebagai PDF.'
  },
  {
    id: 'faq-contoh',
    q: 'Apa bedanya "Muat contoh KKAP" dan "Kosongkan"?',
    a: 'Muat contoh KKAP mengisi semua kotak dengan data KKAP Mozes Kilangin Timika supaya Anda bisa langsung mencoba dan membandingkan dengan Excel. Kosongkan menghapus seluruh isian untuk mulai dari awal. Keduanya mengganti data yang sedang tampil, jadi simpan PDF dulu bila perlu.'
  },
  {
    id: 'faq-rf-tenor',
    q: 'Mengapa risk free bisa berbeda untuk tiap jangka waktu?',
    a: 'Imbal hasil obligasi bergantung pada lamanya. Obligasi 1 tahun biasanya berbeda dari obligasi 5 tahun. Agar sesuai, sewa 1 tahun memakai risk free tenor 1 tahun, sewa 5 tahun memakai tenor 5 tahun. Bila Anda hanya punya satu angka, centang "Pakai risk free tenor 5 tahun untuk semua jangka waktu".'
  },
  {
    id: 'faq-tanah',
    q: 'Mengapa recapture untuk tanah saja 0%?',
    a: 'Tanah tidak habis umur, jadi tidak ada modal yang perlu dikembalikan lewat sewa. Recapture baru muncul bila objeknya tanah dan bangunan, karena bangunan menyusut nilainya hingga habis umur ekonomis.'
  },
  {
    id: 'faq-tahun1',
    q: 'Mengapa uang sewa tahun pertama tidak didiskon?',
    a: 'Karena sewa dibayar di muka. Uang tahun pertama sudah diterima di hari pertama sehingga nilainya hari ini sama dengan nilainya (faktor 1,0000). Tahun ke-2 baru didiskon satu tahun, tahun ke-3 dua tahun, dan seterusnya.'
  },
  {
    id: 'faq-modul-tanah',
    q: 'Bagaimana memakai nilai tanah dari tab Nilai tanah?',
    a: 'Isi data pembanding dan skor di tab Nilai tanah. Lalu di tab Sewa (bagian 1), pada "Nilai tanah", pilih "Dari modul nilai tanah". Bisa juga dengan mencentang "Pakai sebagai nilai tanah di tab Sewa" di tab Nilai tanah.'
  },
  {
    id: 'faq-excel',
    q: 'Mengapa angkanya bisa berbeda tipis dari Excel saya?',
    a: 'Periksa dulu apakah semua masukan sama. Perbedaan kecil biasanya dari pembulatan: kenaikan sewa dibulatkan ke 2 desimal (1,0683% menjadi 1,07%), nilai tanah dan nilai wajar sewa dibulatkan ke ribuan. Bila Excel Anda tidak membulatkan pada titik yang sama, hasilnya bergeser beberapa ribu rupiah.'
  },
  {
    id: 'faq-bobot',
    q: 'Bobot Luas, Jenis, dan Elevasi pada contoh berbeda dengan data baru. Mengapa?',
    a: 'Pada file Excel contoh, bobot ketiganya (2%, 8%, 4%) berbeda dari tabel Hasil Kajian Tanah di file yang sama (8%, 4%, 2%). Data contoh mengikuti angka Excel supaya hasilnya persis sama, sedangkan data baru memakai bobot tabel Hasil Kajian Tanah. Anda bisa mengubah bobot di tab Nilai tanah.'
  },
  {
    id: 'faq-final',
    q: 'Apakah hasil ini bisa langsung dipakai sebagai nilai akhir?',
    a: 'Tidak. Aplikasi adalah alat bantu hitung dan bahan belajar. Penentuan data, asumsi, dan kesimpulan nilai tetap tanggung jawab penilai sesuai pedoman penilaian yang berlaku.'
  }
];
