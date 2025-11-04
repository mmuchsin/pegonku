/**
 * Type definition for custom dictionary entries
 */
export interface CustomDictionaryEntry {
  id?: number
  teks_ind: string
  pegon: string
  created_at?: string
  updated_at?: string
}

/**
 * Transliterate a single word from Latin to Pegon script
 * @param word - The word to transliterate
 * @param customDictionary - Array of custom dictionary entries for overrides
 * @returns Transliterated word in Pegon script
 */
export function transliterateWord(
  word: string, 
  customDictionary: CustomDictionaryEntry[] = []
): string {

  // --- Character and Vowel Maps (based on Panduan Pegon) ---
  const characterMap: Record<string, string> = {
    // 2-char combinations
    'ny': 'ۑ', 'ng': 'ع', 'sy': 'ش', 'kh': 'خ', 'dz': 'ذ', 
    // 1-char consonants
    'c': 'چ', 'g': 'ڮ', 
    'p': 'ڤ', // From guide (different from 'f')
    'f': 'ف', 
    'v': 'ڥ', // From guide
    'k': 'ك', 'q': 'ق', 'b': 'ب', 'd': 'د', 'h': 'ه', 'j': 'ج', 'l': 'ل', 'm': 'م',
    'n': 'ن', 'r': 'ر', 's': 'س', 't': 'ت', 'w': 'و', 'y': 'ي', 'z': 'ز'
  };
  const vowelMap: Record<string, string> = { 
    'a': 'َا', 
    'i': 'ِي', 
    'u': 'ُو', 
    'o': 'ٗو', // From guide (dammah inverted)
    'e': 'ٓ' 
  };
  const numberMap: Record<string, string> = { 
    '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤', 
    '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩' 
  };
  const vowels = 'aiueo';

  // --- Helper Functions ---
  const isVowel = (char?: string) => typeof char === 'string' && vowels.includes(char);
  const needsSukun = (currentIndex: number, word: string) => 
    currentIndex + 1 >= word.length || !isVowel(word.charAt(currentIndex + 1));

  // --- Function Body ---
  const lowerWord = word.toLowerCase();
  
  // 1. Separate punctuation
  const leadingPunctMatch = lowerWord.match(/^[.,;:!?'"()]+/)
  const trailingPunctMatch = lowerWord.match(/[.,;:!?'"()]+$/)
  const leadingPunct = leadingPunctMatch ? leadingPunctMatch[0] : ''
  const trailingPunct = trailingPunctMatch ? trailingPunctMatch[0] : ''

  const coreStart = leadingPunct.length
  const coreEnd = Math.max(coreStart, lowerWord.length - trailingPunct.length)
  let core = lowerWord.substring(coreStart, coreEnd)
  
  if (!core) return lowerWord; // Return if only punctuation

  // 2. Check Custom Dictionary (using 'core' *with* punctuation)
  const customEntry = customDictionary.find(
    e => e.teks_ind.toLowerCase() === core.toLowerCase()
  );
  if (customEntry) {
    return leadingPunct + customEntry.pegon + trailingPunct;
  }
  
  // 3. Create 'cleanWord' for the engine (no spaces or internal punct)
  const cleanWord = core.replace(/[ .,;:!?'"()]/g, '');
  let pegonResult = '';
  let i = 0;

  // 4. Start the translation engine loop
  while (i < cleanWord.length) {
    let consumed = 1;

    // --- Check for 2-character combinations FIRST ---
    if (i + 1 < cleanWord.length) {
      const twoChars = cleanWord.substring(i, i + 2);
      
      // Special diphthongs
      if (twoChars === 'ua') {
        pegonResult += (pegonResult.length === 0 ? 'ُ' : '') + 'ووَا'; // e.g., dua -> دُووَا
        consumed = 2; i += consumed; continue;
      }
      if (twoChars === 'au') { 
        pegonResult += 'َاؤُ'; // e.g., mau -> مَااَوْ
        consumed = 2; i += consumed; continue;
      }
      if (twoChars === 'aa') { 
        pegonResult += 'َأَ'; // e.g., mau -> 
        consumed = 2; i += consumed; continue;
      }
      
      // Check for 2-char consonants (ny, ng, sy, kh, dz)
      if (characterMap[twoChars]) {
        pegonResult += characterMap[twoChars];
        consumed = 2;
        if (needsSukun(i + 1, cleanWord)) pegonResult += 'ْ';
        i += consumed;
        continue;
      }
    }

    // --- If no 2-char match, process 1 character ---
    const oneChar = cleanWord.charAt(i);
    
    // --- VOWEL Logic ---
    if (isVowel(oneChar)) {
      // RULE: Vowels at the BEGINNING of a word [Source 4]
      if (i === 0) {
        if (oneChar === 'a') pegonResult += 'أَ';      // e.g., Api
        else if (oneChar === 'i') pegonResult += 'ئِ'; // e.g., Itu
        else if (oneChar === 'u') pegonResult += 'اُ'; // e.g., Ubi
        else if (oneChar === 'o') pegonResult += 'ؤٗ'; // e.g., Orang
        else if (oneChar === 'e') pegonResult += 'ئٓ'; // e.g., Enak
      } 
      // RULE: 'e' vowel (has its own special logic)
      else if (oneChar === 'e') {
        const prevChar = cleanWord.charAt(i - 1);
        if (isVowel(prevChar)) {
          pegonResult += 'ئ' + (vowelMap[oneChar] || ''); // e.g., Keenakan
        } else {
          pegonResult += vowelMap[oneChar] || ''; // e.g., Bekal
        }
      } 
      // RULE: 'a', 'i', 'u', 'o' in MIDDLE or END
      else {
        const prevChar = cleanWord.charAt(i - 1);
        // RULE: Vowel-after-Vowel [Source 4]
        if (isVowel(prevChar)) {
          if (oneChar === 'a') pegonResult += 'أَ';      // e.g., Keadaan
          else if (oneChar === 'i') pegonResult += 'ئِي'; // e.g., Baik
          else if (oneChar === 'u') pegonResult += 'ئُو'; // e.g., Keutamaan
          else if (oneChar === 'o') pegonResult += 'ئٗو'; // e.g., Keorganisasian
        } else {
          // Normal: Vowel-after-Consonant
          pegonResult += vowelMap[oneChar] || '';
        }
      }
    } 
    // --- CONSONANT Logic ---
    else if (characterMap[oneChar]) {
      const pegonChar = characterMap[oneChar] || '';
      const nextChar = cleanWord.charAt(i + 1);

      // RULE: Consonant + 'R' [Source 12]
      if (nextChar === 'r') {
        pegonResult += pegonChar + 'ٓ'; // Add maddah (e.g., Transaksi)
      } else {
        pegonResult += pegonChar;
      }
      
      // Add sukun if needed
      if (needsSukun(i, cleanWord)) pegonResult += 'ْ';
    } 
    // --- NUMBER Logic ---
    else if (numberMap[oneChar]) {
      pegonResult += numberMap[oneChar] || '';
    } 
    // --- Unknown characters ---
    else {
      pegonResult += oneChar; // Pass through
    }
    
    i += consumed;
  }

  // 5. Final cleanup (remove sukun after a harakat)
  // Added ٗ (inverted dammah) to the cleanup rule
  const cleanedResult = pegonResult.replace(/([َاِيُوَْوْٓٗ])ْ/g, '$1'); 
  
  // 6. Re-attach punctuation
  return leadingPunct + cleanedResult + trailingPunct;
}

/**
 * Transliterate a sentence from Latin to Pegon script
 * @param text - The sentence to transliterate
 * @param customDictionary - Array of custom dictionary entries
 * @returns Transliterated sentence in Pegon script
 */
export function transliterateSentence(
  text: string, 
  customDictionary: CustomDictionaryEntry[] = []
): string {
  const words = text.split(/(\s+)/); // Split by space, keeping spaces
  
  return words.map(part => {
    if (part.trim() === '') return part; // Keep the space
    return transliterateWord(part, customDictionary);
  }).join('');
}

/**
 * Transliterate a paragraph or multiple lines from Latin to Pegon script
 * @param text - The paragraph to transliterate
 * @param customDictionary - Array of custom dictionary entries
 * @returns Transliterated paragraph in Pegon script
 */
export function transliterateParagraph(
  text: string, 
  customDictionary: CustomDictionaryEntry[] = []
): string {
  // Preprocess common abbreviations and special cases
  let preprocessedText = text.replace(/\b(\d+)H\b/gi, '$1 Hijriah');
  preprocessedText = preprocessedText.replace(/\bno\.\b/gi, 'nomor');

  const lines = preprocessedText.split('\n');
  
  const transliteratedLines = lines.map(line => {
    const content = line.trim();
    if (content === '') return line; // Keep empty lines
    return transliterateSentence(content, customDictionary);
  });
  
  // Replace comma with Arabic comma
  return transliteratedLines.join('\n').replace(/,/g, '،');
}

/**
 * Batch transliterate multiple words
 * @param words - Array of words to transliterate
 * @param customDictionary - Array of custom dictionary entries
 * @returns Array of transliterated words
 */
export function transliterateWords(
  words: string[], 
  customDictionary: CustomDictionaryEntry[] = []
): string[] {
  return words.map(word => transliterateWord(word, customDictionary));
}