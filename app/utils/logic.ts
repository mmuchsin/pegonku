const manualCorrections: Record<string, string> = {
  allah: "الله", hadis: "حَدِيْث", ulama: "عُلَمَاء", syariat: "شَرِيْعَة", fiqih: "فِقْه",
  yakni: "يَاكْنِيْ", sudah: "سُوْدَاهْ", teks: "تٓيكْسْ", untuk: "أُوْنْتُوْكْ",
  dengan: "دٓعَانْ", dan: "دَانْ", yang: "يَاعْ", mereka: "مٓرٓيكَا",
  keadaan: "كٓئَادَائَانْ", menghilangkan: "مٓعْهِيلَاعْكَانْ", membuat: "مٓمْبُوَاتْ",
  sebagian: "سٓبَاڮِيَانْ",
};

const characterMap: Record<string, string> = {
  'ny': 'ۑ', 'ng': 'ع', 'sy': 'ش', 'c': 'چ', 'g': 'ڮ', 'p': 'ف', 'f': 'ف', 'v': 'ف',
  'k': 'ك', 'q': 'ق', 'b': 'ب', 'd': 'د', 'h': 'ه', 'j': 'ج', 'l': 'ل', 'm': 'م',
  'n': 'ن', 'r': 'ر', 's': 'س', 't': 'ت', 'w': 'و', 'y': 'ي', 'z': 'ز'
};
const vowelMap: Record<string, string> = { 'a': 'َا', 'i': 'ِي', 'u': 'ُوْ', 'o': 'َوْ', 'e': 'ٓ' };
const numberMap: Record<string, string> = { '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤', '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩' };
const vowels = "aiueo";

const isVowel = (char: string) => vowels.includes(char);
const needsSukun = (currentIndex: number, word: string) => currentIndex + 1 >= word.length || !isVowel(word[currentIndex + 1]);

export function transliterateWord(word: string, customDictionary: {teks_ind: string, pegon: string}[]): string {
    const lowerWord = word.toLowerCase();
    const cleanWord = lowerWord.replace(/[.,;:!?'"()]/g, '');
    const punctuation = lowerWord.replace(/[^.,;:!?'"()]/g, '');

    const customEntry = customDictionary.find(e => e.teks_ind === cleanWord);
    if (customEntry) return customEntry.pegon + punctuation;
    if (manualCorrections[cleanWord]) return manualCorrections[cleanWord] + punctuation;

    let pegonResult = "";
    let i = 0;
    while (i < cleanWord.length) {
        let consumed = 1;
        if (i + 1 < cleanWord.length) {
            const twoChars = cleanWord.substring(i, i + 2);
            if (twoChars === 'ua') { pegonResult += "وَا"; consumed = 2; i += consumed; continue; }
            if (characterMap[twoChars]) {
                pegonResult += characterMap[twoChars];
                consumed = 2;
                if (needsSukun(i + 1, cleanWord)) pegonResult += "ْ";
                i += consumed;
                continue;
            }
        }
        const oneChar = cleanWord[i];
        if (isVowel(oneChar)) {
             if (oneChar === 'e') {
                const prevChar = cleanWord[i-1] || '';
                if (isVowel(prevChar) || i === 0) {
                    pegonResult += 'ئ' + vowelMap[oneChar];
                } else {
                    pegonResult += vowelMap[oneChar];
                }
            } else {
               pegonResult += vowelMap[oneChar];
            }
        } else if (characterMap[oneChar]) {
            pegonResult += characterMap[oneChar];
            if (needsSukun(i, cleanWord)) pegonResult += "ْ";
        } else if (numberMap[oneChar]) {
            pegonResult += numberMap[oneChar];
        } else {
            pegonResult += oneChar;
        }
        i += consumed;
    }
    return pegonResult.replace(/([َاِيُوَْوْٓ])ْ/g, '$1') + punctuation;
}

export function transliterateSentence(text: string, customDictionary: {teks_ind: string, pegon: string}[]): string {
    const words = text.split(/(\s+)/);
    return words.map(part => {
        if (part.trim() === '') return part;
        return transliterateWord(part, customDictionary);
    }).join('');
}

export function transliterateParagraph(text: string, customDictionary: {teks_ind: string, pegon: string}[]): string {
    let preprocessedText = text.replace(/\b(\d+)H\b/gi, '$1 Hijriah');
    preprocessedText = preprocessedText.replace(/\bno\.\b/gi, 'nomor');

    const lines = preprocessedText.split('\n');
    const transliteratedLines = lines.map(line => {
        const content = line.trim();
        if (content === '') return line;
        return transliterateSentence(content, customDictionary);
    });
    
    return transliteratedLines.join('\n').replace(/,/g, '،');
}
