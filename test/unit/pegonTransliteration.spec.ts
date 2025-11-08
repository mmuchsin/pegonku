import { describe, it, expect } from 'vitest';
import { 
  transliterateWord, 
  transliterateSentence, 
  transliterateParagraph 
} from '@/utils/pegonTransliteration'

// Definisikan kamus kustom untuk pengujian
const customDictionary = [
  { teks_ind: "qur'an", pegon: "قُرۡآنۡ", id: 1 },
  { teks_ind: "islam", pegon: "إِسۡلَامۡ", id: 2 },
  { teks_ind: "hijriah", pegon: "هِجۡرِيَّةۡ", id: 3 }
];

// --- Tes untuk transliterateWord ---
describe('transliterateWord', () => {

  describe('Skenario 1: Tes Aturan Dasar (Maps)', () => {
    it('Harusnya mentransliterasi kata dasar (makan)', () => {
      expect(transliterateWord('makan')).toBe('مَاكَانۡ');
    });

    it('Harusnya mentransliterasi digraf (nyanyi)', () => {
      expect(transliterateWord('nyanyi')).toBe('ۑَاۑِي');
    });

    it('Harusnya mentransliterasi digraf (khusus)', () => {
      expect(transliterateWord('khusus')).toBe('خُوسُوسۡ');
    });

    it('Harusnya mentransliterasi konsonan panduan (pesta)', () => {
      expect(transliterateWord('pesta')).toBe('ڤٓسۡتَا');
    });

    it('Harusnya mentransliterasi konsonan panduan (visual)', () => {
      expect(transliterateWord('visual')).toBe('ڥِيسُووَالۡ');
    });

    it('Harusnya mentransliterasi vokal panduan (sore)', () => {
      expect(transliterateWord('sore')).toBe('صَرٓ');
    });
  });

  describe('Skenario 2: Tes Aturan Awal Vokal', () => {
    it('Harusnya menangani "a" di awal (api)', () => {
      expect(transliterateWord('api')).toBe('أَڤِي');
    });

    it('Harusnya menangani "i" di awal (itu)', () => {
      expect(transliterateWord('itu')).toBe('ئِتُو');
    });

    it('Harusnya menangani "e" di awal (enak)', () => {
      expect(transliterateWord('enak')).toBe('ئٓنَاكۡ');
    });

    it('Harusnya menangani "o" di awal (orang)', () => {
      expect(transliterateWord('orang')).toBe('ا۠رَاعۡ');
    });

    it('Harusnya menangani "u" di awal (ubi)', () => {
      expect(transliterateWord('ubi')).toBe('ؤُبِي');
    });
  });

  describe('Skenario 3: Tes Aturan Vokal-setelah-Vokal', () => {
    it('Harusnya menangani "ai" (baik)', () => {
      expect(transliterateWord('baik')).toBe('بَائِيكۡ');
    });

    it('Harusnya menangani "eu" (keutamaan)', () => {
      expect(transliterateWord('keutamaan')).toBe('كٓئُوتَامَأَنۡ');
    });

    it('TES PENTING: Harusnya menangani "ea" (keadaan)', () => {
      expect(transliterateWord('keadaan')).toBe('كٓأَدَأَنۡ');
    });
  });

  describe('Skenario 4: Tes Aturan Konsonan + R', () => {
    it('Harusnya menangani "tr" (transaksi)', () => {
      expect(transliterateWord('transaksi')).toBe('تٓرَانۡسَاكۡسِي');
    });

    it('Harusnya menangani "kr" (kreatif)', () => {
      expect(transliterateWord('kreatif')).toBe('كٓرٓأَتِيفۡ');
    });
  });

  describe('Skenario 5: Tes Kamus (Custom Dictionary)', () => {
    it('Harusnya menggunakan entri kamus (qur\'an)', () => {
      expect(transliterateWord("qur'an", customDictionary)).toBe('قُرۡآنۡ');
      expect(transliterateWord("hijriah", customDictionary)).toBe('هِجۡرِيَّةۡ');
    });

    it('Harusnya BUKAN menggunakan kamus jika tidak cocok (quran)', () => {
      expect(transliterateWord('quran', customDictionary)).toBe('قُورَانۡ');
    });
  });

  describe('Skenario 6: Tes Karakter Campuran', () => {
    it('Harusnya menangani angka saja (1945)', () => {
      expect(transliterateWord('1945')).toBe('١٩٤٥');
    });
  });

  describe('Skenario 7: Tes Kapitalisasi', () => {
    it('Harusnya mengabaikan huruf besar (SAYA)', () => {
      expect(transliterateWord('SAYA')).toBe('سَايَا');
    });

    it('Harusnya mengabaikan huruf besar pada digraf (Syukur)', () => {
      expect(transliterateWord('Syukur')).toBe('شُوكُورۡ');
    });

    it('Harusnya mengabaikan huruf besar campuran (NGaji)', () => {
      expect(transliterateWord('NGaji')).toBe('عَاجِي');
    });
  });

  describe('Skenario 8: Tes Tanda Baca Internal', () => {
    it('Harusnya menghapus tanda baca internal (apa-apa)', () => {
      expect(transliterateWord('apa-apa')).toBe('أَڤَا-أَڤَا')
    });
  });

  describe('Skenario 9: Tes Input Kosong', () => {
    it('Harusnya mengembalikan string kosong', () => {
      expect(transliterateWord('')).toBe('');
    });

    it('Harusnya mengembalikan spasi', () => {
      expect(transliterateWord(' ')).toBe(' ');
    });
  });

});

// --- Tes untuk Fungsi Wrapper ---

describe('transliterateSentence', () => {
  it('Skenario 10: Harusnya mempertahankan spasi', () => {
    const input = 'Saya makan nasi.';
    const expected = 'سَايَا مَاكَانۡ نَاسِي.';
    expect(transliterateSentence(input, customDictionary)).toBe(expected);
  });

  it('Skenario 11: Harusnya menangani string spasi', () => {
    expect(transliterateSentence('   ')).toBe('   ');
  });
});

describe('transliterateParagraph', () => {
  it('Skenario 12: Harusnya melakukan pre-processing dan mengganti koma', () => {
    const input = 'No. 1, 1445H';
    const expected = 'نا۠ما۠رۡ ١، ١٤٤٥ هِجۡرِيَّةۡ';
    expect(transliterateParagraph(input, customDictionary)).toBe(expected);
  });
});