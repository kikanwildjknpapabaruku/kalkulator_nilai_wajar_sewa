import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { GLOSSARY, GLOSSARY_GROUPS, TERM_BY_ID } from '@/content/glossary.js';
import { STEPS, FAQ } from '@/content/guide.js';
import { EX } from '@/content/example.js';
import { GROUPS } from '@/state/ui.js';

// fmtRp memakai spasi tak terputus setelah "Rp"
const plain = (t) => String(t).replace(/\s/g, ' ');

function vueFiles(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? vueFiles(p) : p.endsWith('.vue') ? [p] : [];
  });
}
const files = vueFiles('src');
const source = files.map((f) => readFileSync(f, 'utf8')).join('\n');

describe('daftar istilah', () => {
  it('id unik, kelompok dikenal, dan istilah terkait ada', () => {
    const ids = GLOSSARY.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    const groups = GLOSSARY_GROUPS.map((g) => g.id);
    GLOSSARY.forEach((t) => {
      expect(groups, t.id).toContain(t.group);
      expect(t.short.length, t.id).toBeGreaterThan(20);
      expect(t.body.length, t.id).toBeGreaterThan(0);
      (t.related || []).forEach((r) => expect(TERM_BY_ID[r], `${t.id} -> ${r}`).toBeTruthy());
    });
  });

  it('setiap tanda tanya (?) di form menunjuk istilah yang ada', () => {
    const used = [...source.matchAll(/(?<![:\w-])term="([a-z0-9-]+)"/g)].map((m) => m[1]);
    expect(used.length).toBeGreaterThan(10);
    used.forEach((id) => expect(TERM_BY_ID[id], id).toBeTruthy());
  });

  it('istilah pada langkah hitung ada di daftar', () => {
    const block = source.match(/const STEP_TERMS = \[([\s\S]*?)\];/)[1];
    [...block.matchAll(/'([a-z-]+)'/g)].forEach((m) => expect(TERM_BY_ID[m[1]], m[1]).toBeTruthy());
  });
});

describe('angka contoh dalam penjelasan', () => {
  it('sama dengan hasil Excel KKAP', () => {
    expect(plain(EX.rounded5)).toBe('Rp 13.602.653.000');
    expect(plain(EX.rounded1)).toBe('Rp 3.050.816.000');
    expect(EX.cap).toBe('6,146%');
    expect(EX.rf).toBe('7,216%');
    expect(EX.g).toBe('1,07%');
    expect(EX.gAvg).toBe('1,0683%');
  });

  it('contoh bangunan: recapture 4% dan nilai 5 tahun yang sama dengan uji bangunan', () => {
    expect(EX.b.rc).toBe('4,00%');
    expect(EX.b.cap).toBe('10,146%');
    expect(plain(EX.b.rounded5)).toBe('Rp 21.833.304.000');
    expect(EX.b.sisa).toBe(25);
  });

  it('contoh ranking analysis: (4 - 2) / 5 x 30% = +12,00%', () => {
    expect(EX.rank.adj).toBe('+12,00%');
  });
});

describe('petunjuk', () => {
  it('tombol langkah menunjuk bagian yang ada', () => {
    STEPS.forEach((s) => {
      if (s.go.section) expect(source, s.go.section).toContain(`id="${s.go.section}"`);
    });
  });

  it('id kelompok petunjuk cocok dengan kartu di GuideTab', () => {
    GROUPS.petunjuk.forEach((id) => expect(source).toContain(`id="${id}"`));
  });

  it('FAQ punya id unik', () => {
    const ids = FAQ.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
