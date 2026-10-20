<script setup>
/**
 * Alur perhitungan dalam lima langkah, diisi angka dari data contoh KKAP (tetap, tidak ikut
 * data yang sedang Anda isi), ditambah tabel proyeksi 5 tahun sebagai gambaran.
 */
import { EX } from '@/content/example.js';
import HelpTip from '@/components/common/HelpTip.vue';
</script>

<template>
  <div>
    <p class="cap">
      Angka di bawah berasal dari data contoh {{ EX.nama }} (tanah saja, risk free 5 tahun). Angka ini tetap dan tidak berubah saat Anda mengisi data sendiri.
    </p>

    <ol class="flow">
      <li>
        <span class="no" aria-hidden="true">1</span>
        <div class="b">
          <div class="ttl"><b>Nilai properti</b> <HelpTip inline term="nilai-properti" /></div>
          <span class="v">{{ EX.nilai }}</span>
          <small>Hasil penilaian tanah (ditambah bangunan bila ada). Ini dasar perhitungan sewa.</small>
        </div>
      </li>
      <li>
        <span class="no" aria-hidden="true">2</span>
        <div class="b">
          <div class="ttl"><b>Kali tingkat kapitalisasi</b> <HelpTip inline term="kapitalisasi" /></div>
          <span class="v">{{ EX.cap }}</span>
          <small>Risk free {{ EX.rf }} + recapture {{ EX.rc }} − kenaikan sewa {{ EX.g }}.</small>
        </div>
      </li>
      <li>
        <span class="no" aria-hidden="true">3</span>
        <div class="b">
          <div class="ttl"><b>Sama dengan sewa tahun pertama</b> <HelpTip inline term="arus-kas" /></div>
          <span class="v">{{ EX.cf1 }}</span>
          <small>Untuk tahun berikutnya, sewa naik {{ EX.g }} per tahun.</small>
        </div>
      </li>
      <li>
        <span class="no" aria-hidden="true">4</span>
        <div class="b">
          <div class="ttl"><b>Diubah ke nilai kini dengan diskonto</b> <HelpTip inline term="diskonto" /></div>
          <span class="v">{{ EX.disc }}</span>
          <small>Sewa tahun pertama tidak berkurang karena dibayar di muka. Tahun-tahun berikutnya makin kecil nilai kininya.</small>
        </div>
      </li>
      <li>
        <span class="no" aria-hidden="true">5</span>
        <div class="b">
          <div class="ttl"><b>Jumlahkan, lalu bulatkan ke ribuan</b> <HelpTip inline term="nilai-kini" /></div>
          <span class="v">{{ EX.rounded5 }}</span>
          <small>Inilah nilai wajar sewa 5 tahun yang dibayar sekaligus di muka.</small>
        </div>
      </li>
    </ol>

    <div class="tscroll">
      <table class="tbl" aria-label="Contoh proyeksi 5 tahun">
        <thead>
          <tr>
            <th>Tahun</th>
            <th class="n">Sewa tahun itu</th>
            <th class="n">Faktor diskonto</th>
            <th class="n">Nilai kini</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in EX.rows" :key="r.t">
            <th scope="row">{{ r.t }}</th>
            <td class="n">{{ r.cf }}</td>
            <td class="n">{{ r.df }}</td>
            <td class="n">{{ r.pv }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colspan="3">Jumlah nilai kini</th>
            <td class="n">{{ EX.total5 }}</td>
          </tr>
          <tr class="sel">
            <th scope="row" colspan="3">Nilai wajar sewa 5 tahun (dibulatkan ke ribuan)</th>
            <td class="n">{{ EX.rounded5 }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<style scoped>
.cap {
  color: var(--ink-2);
  font-size: 12.5px;
  margin: 10px 0 12px;
}
.flow {
  list-style: none;
  margin: 0 0 14px;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 10px;
}
li {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 10px;
  align-content: start;
  background: var(--surface-3);
  border: 1px solid var(--line-2);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
}
.no {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.b {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
b {
  font-size: 13px;
  font-weight: 600;
}
.v {
  font-family: var(--font-num);
  font-size: 15px;
  font-weight: 500;
  overflow-wrap: anywhere;
}
small {
  font-size: 12px;
  color: var(--ink-3);
}
</style>
