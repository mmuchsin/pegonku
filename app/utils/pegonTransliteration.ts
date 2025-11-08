/**
 * Functional Pegon Transliteration Engine
 * Pure functions with composition and pipeline architecture
 * 
 * @module pegon-transliteration
 * @author Your Name
 * @license MIT
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Custom dictionary entry for Indonesian to Pegon transliteration
 * @typedef {Object} CustomDictionaryEntry
 * @property {number} [id] - Unique identifier
 * @property {string} teks_ind - Indonesian text
 * @property {string} pegon - Pegon script equivalent
 * @property {string} [created_at] - Creation timestamp
 * @property {string} [updated_at] - Last update timestamp
 */
export interface CustomDictionaryEntry {
  id?: number
  teks_ind: string
  pegon: string
  created_at?: string
  updated_at?: string
}

/**
 * Context information for character transliteration
 * @typedef {Object} TransliterationContext
 */
type TransliterationContext = {
  word: string
  index: number
  prevChar: string
  nextChar: string
  isAtStart: boolean
  isAtEnd: boolean
}

/**
 * Result of processing a character or sequence
 * @typedef {Object} ProcessResult
 */
type ProcessResult = {
  pegon: string
  consumed: number
}

/**
 * Extended process result with match status
 * @typedef {Object} RuleMatch
 */
type RuleMatch = ProcessResult & { matched: boolean }

// ============================================================================
// CONSTANTS
// ============================================================================
const PEGON_MAPS = {
  twoCharConsonants: {
    'ny': 'ۑ', 'ng': 'ع', 'sy': 'ش', 'kh': 'خ',
    'dz': 'ذ', 'so': 'صَ', 'to': 'طَ', 'ko': 'قَ',
  },
  singleCharConsonants: {
    'c': 'چ', 'g': 'ڮ', 'p': 'ڤ', 'f': 'ف', 'v': 'ڥ',
    'k': 'ك', 'q': 'ق', 'b': 'ب', 'd': 'د', 'h': 'ه',
    'j': 'ج', 'l': 'ل', 'm': 'م', 'n': 'ن', 'r': 'ر',
    's': 'س', 't': 'ت', 'w': 'و', 'y': 'ي', 'z': 'ز'
  },
  vowels: {
    'a': 'َا', 'i': 'ِي', 'u': 'ُو', 'o': 'ا۠', 'e': 'ٓ'
  },
  initialVowels: {
    'a': 'أَ', 'i': 'ئِ', 'u': 'ؤُ', 'o': 'ا۠', 'e': 'ئٓ'
  },
  vowelAfterVowel: {
    'a': 'أَ', 'i': 'ئِي', 'u': 'ئُو', 'o': 'ا۠',
  },
  numbers: {
    '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
    '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
  },
  diacritics: {
    sukun: 'ۡ', maddah: 'ٓ', fatha: 'َ',
    kasra: 'ِ', dammah: 'ُ', invertedDammah: 'ٗ'
  }
} as const

const VOWEL_CHARS = 'aiueo'
const DIPHTHONGS = [
  { pattern: 'ua', replacement: 'ُووَا', needsPrefix: true },
  { pattern: 'au', replacement: 'َاؤُ', needsPrefix: false },
  { pattern: 'aa', replacement: 'َأَ', needsPrefix: false }
] as const

// ============================================================================
// PURE UTILITY FUNCTIONS
// ============================================================================

/**
 * Checks if a character is a vowel
 * @param {string} [char] - Character to check
 * @returns {boolean} True if the character is a vowel (a, i, u, e, o)
 * @example
 * isVowel('a') // true
 * isVowel('b') // false
 */
function isVowel(char?: string): boolean {
  return typeof char === 'string' && VOWEL_CHARS.includes(char)
}

/**
 * Determines if a consonant needs sukun (ْ) diacritic
 * @param {number} index - Current position in word
 * @param {string} word - The word being processed
 * @returns {boolean} True if sukun is needed
 */
function needsSukun(index: number, word: string): boolean {
  return index + 1 >= word.length || !isVowel(word.charAt(index + 1))
}

/**
 * Creates context object for character processing
 * @param {string} word - The word being processed
 * @param {number} index - Current character index
 * @returns {TransliterationContext} Context with surrounding character info
 */
function createContext(word: string, index: number): TransliterationContext {
  return {
    word,
    index,
    prevChar: word.charAt(index - 1) || '',
    nextChar: word.charAt(index + 1) || '',
    isAtStart: index === 0,
    isAtEnd: index >= word.length - 1
  }
}

/**
 * Extracts leading and trailing punctuation from a word
 * @param {string} word - Word to process
 * @returns {Object} Object with leading, core, and trailing parts
 * @example
 * extractPunctuation('"hello,"') 
 * // { leading: '"', core: 'hello', trailing: ',' }
 */
function extractPunctuation(word: string) {
  const leadingMatch = word.match(/^[.,;:!?'"()]+/)
  const trailingMatch = word.match(/[.,;:!?'"()]+$/)
  
  const leading = leadingMatch?.[0] ?? ''
  const trailing = trailingMatch?.[0] ?? ''
  const coreStart = leading.length
  const coreEnd = Math.max(coreStart, word.length - trailing.length)
  
  return {
    leading,
    core: word.substring(coreStart, coreEnd),
    trailing
  }
}

/**
 * Removes punctuation and whitespace from a word
 * @param {string} word - Word to clean
 * @returns {string} Cleaned word
 */
function cleanWord(word: string): string {
  return word.replace(/[ .,;:!?'"()]/g, '')
}

/**
 * Removes invalid harakat combinations from result
 * @param {string} result - Raw transliteration result
 * @returns {string} Cleaned result
 */
function cleanupResult(result: string): string {
  return result.replace(/([َاِيُوَْوْٓٗ])ْ/g, '$1')
}

// ============================================================================
// RULE PROCESSORS (Pure Functions)
// ============================================================================

/**
 * Attempts to match and process a diphthong (two-vowel combination)
 * @param {string} word - The word being processed
 * @param {number} index - Current position
 * @param {string} resultSoFar - Accumulated result (affects 'ua' prefix)
 * @returns {RuleMatch} Match result with pegon text and consumed characters
 * @example
 * tryDiphthong('saudara', 2, '') // matches 'au'
 */
function tryDiphthong(word: string, index: number, resultSoFar: string): RuleMatch {
  if (index + 1 >= word.length) {
    return { matched: false, pegon: '', consumed: 0 }
  }

  const twoChars = word.substring(index, index + 2)
  const diphthong = DIPHTHONGS.find(d => d.pattern === twoChars)
  
  if (!diphthong) {
    return { matched: false, pegon: '', consumed: 0 }
  }

  const prefix = resultSoFar.length === 0 && diphthong.needsPrefix ? 'ُ' : ''
  return {
    matched: true,
    pegon: prefix + diphthong.replacement,
    consumed: 2
  }
}

/**
 * Attempts to match two-character consonant combinations
 * @param {string} word - The word being processed
 * @param {number} index - Current position
 * @returns {RuleMatch} Match result with pegon text and consumed characters
 * @example
 * tryTwoCharConsonant('nganggo', 0) // matches 'ng' -> 'ع'
 */
function tryTwoCharConsonant(word: string, index: number): RuleMatch {
  if (index + 1 >= word.length) {
    return { matched: false, pegon: '', consumed: 0 }
  }

  const twoChars = word.substring(index, index + 2)
  const pegonChar = PEGON_MAPS.twoCharConsonants[twoChars as keyof typeof PEGON_MAPS.twoCharConsonants]
  
  if (!pegonChar) {
    return { matched: false, pegon: '', consumed: 0 }
  }

  const lastChar = pegonChar.at(-1)
  const isHarakat = lastChar === 'َ'  // fatha (yang digunakan TO/SO/KO)
  
  if (isHarakat) {
    return {
      matched: true,
      pegon: pegonChar,
      consumed: 2
    }
  }

  const sukun = needsSukun(index + 1, word) ? PEGON_MAPS.diacritics.sukun : ''
  return {
    matched: true,
    pegon: pegonChar + sukun,
    consumed: 2
  }
}

/**
 * Processes a vowel at the beginning of a word
 * @param {string} char - The vowel character
 * @returns {string} Pegon representation for initial vowel
 */
function processInitialVowel(char: string): string {
  return PEGON_MAPS.initialVowels[char as keyof typeof PEGON_MAPS.initialVowels] ?? ''
}

/**
 * Processes a vowel in the middle or end of a word
 * @param {string} char - The vowel character
 * @param {string} prevChar - Previous character
 * @param {boolean} isPrevVowel - Whether previous character is a vowel
 * @returns {string} Pegon representation for the vowel
 */
function processMiddleVowel(char: string, prevChar: string, isPrevVowel: boolean): string {
  if (char === 'e') {
    return isPrevVowel
      ? 'ئ' + (PEGON_MAPS.vowels[char] ?? '')
      : PEGON_MAPS.vowels[char] ?? ''
  }

  if (isPrevVowel) {
    return PEGON_MAPS.vowelAfterVowel[char as keyof typeof PEGON_MAPS.vowelAfterVowel] ?? ''
  }

  return PEGON_MAPS.vowels[char as keyof typeof PEGON_MAPS.vowels] ?? ''
}

/**
 * Processes any vowel based on context
 * @param {string} char - The vowel character
 * @param {TransliterationContext} context - Character context
 * @returns {string} Pegon representation
 */
function processVowel(char: string, context: TransliterationContext): string {
  return context.isAtStart
    ? processInitialVowel(char)
    : processMiddleVowel(char, context.prevChar, isVowel(context.prevChar))
}

/**
 * Processes a single consonant character
 * @param {string} char - The consonant
 * @param {string} nextChar - Following character
 * @param {number} index - Current position
 * @param {string} word - The word being processed
 * @returns {string} Pegon representation with appropriate diacritics
 */
function processSingleConsonant(char: string, nextChar: string, index: number, word: string): string {
  const pegonChar = PEGON_MAPS.singleCharConsonants[char as keyof typeof PEGON_MAPS.singleCharConsonants]
  if (!pegonChar) return ''

  let result = pegonChar
  if (nextChar === 'r') {
    result += PEGON_MAPS.diacritics.maddah
  }
  else if (needsSukun(index, word)) {
    result += PEGON_MAPS.diacritics.sukun
  }
  
  return result
}

/**
 * Converts Western Arabic numerals to Eastern Arabic numerals
 * @param {string} char - The numeral character
 * @returns {string} Eastern Arabic numeral
 */
function processNumber(char: string): string {
  return PEGON_MAPS.numbers[char as keyof typeof PEGON_MAPS.numbers] ?? ''
}

// ============================================================================
// MAIN TRANSLITERATION PIPELINE
// ============================================================================

/**
 * Processes a single character or character sequence
 * @param {string} word - The word being processed
 * @param {number} index - Current position
 * @param {string} resultSoFar - Accumulated result
 * @returns {ProcessResult} Pegon output and number of characters consumed
 */
function processCharacter(
  word: string,
  index: number,
  resultSoFar: string
): ProcessResult {
  const context = createContext(word, index)
  const char = word.charAt(index)

  // Try multi-char patterns first
  const diphthong = tryDiphthong(word, index, resultSoFar)
  if (diphthong.matched) return diphthong

  const twoCharCons = tryTwoCharConsonant(word, index)
  if (twoCharCons.matched) return twoCharCons

  // Single character processing
  if (isVowel(char)) {
    return { pegon: processVowel(char, context), consumed: 1 }
  }
  
  if (PEGON_MAPS.singleCharConsonants[char as keyof typeof PEGON_MAPS.singleCharConsonants]) {
    return {
      pegon: processSingleConsonant(char, context.nextChar, index, word),
      consumed: 1
    }
  }
  
  if (PEGON_MAPS.numbers[char as keyof typeof PEGON_MAPS.numbers]) {
    return { pegon: processNumber(char), consumed: 1 }
  }

  // Pass through unknown characters
  return { pegon: char, consumed: 1 }
}

/**
 * Transliterates a complete word using rule-based processing
 * @param {string} word - Word to transliterate (should be cleaned)
 * @returns {string} Pegon script representation
 * @example
 * processWord('salam') // 'سَلَمْ'
 */
function processWord(word: string): string {
  let result = ''
  let i = 0

  while (i < word.length) {
    const { pegon, consumed } = processCharacter(word, i, result)
    result += pegon
    i += consumed
  }

  return cleanupResult(result)
}

// ============================================================================
// DICTIONARY LOOKUP (Higher-order function)
// ============================================================================

/**
 * Creates a fast dictionary lookup function from custom entries
 * Uses Map for O(1) lookups
 * @param {CustomDictionaryEntry[]} dictionary - Array of custom entries
 * @returns {Function} Lookup function that returns pegon or null
 * @example
 * const lookup = createDictionaryLookup([{ teks_ind: 'Allah', pegon: 'ﷲ' }])
 * lookup('Allah') // 'ﷲ'
 */
function createDictionaryLookup(dictionary: CustomDictionaryEntry[]) {
  const lookupMap = new Map(
    dictionary.map(entry => [entry.teks_ind.toLowerCase(), entry.pegon])
  )
  
  return function lookup(word: string): string | null {
    return lookupMap.get(word.toLowerCase()) ?? null
  }
}

// ============================================================================
// WORD TRANSLITERATION (Composition)
// ============================================================================

/**
 * Process word with context awareness (for hyphenated words)
 * @param {string} word - Cleaned word to process
 * @param {boolean} treatAsWordStart - Whether to treat first char as word start
 * @returns {string} Pegon transliteration
 */
function processWordWithContext(word: string, treatAsWordStart: boolean): string {
  let result = ''
  let i = 0

  while (i < word.length) {
    const context = createContext(word, i)
    const char = word.charAt(i)
    
    // ✅ Override isAtStart for words after hyphen
    if (i === 0 && treatAsWordStart) {
      context.isAtStart = true
    }

    // Try multi-char patterns first
    const diphthong = tryDiphthong(word, i, result)
    if (diphthong.matched) {
      result += diphthong.pegon
      i += diphthong.consumed
      continue
    }

    const twoCharCons = tryTwoCharConsonant(word, i)
    if (twoCharCons.matched) {
      result += twoCharCons.pegon
      i += twoCharCons.consumed
      continue
    }

    // Single character processing
    if (isVowel(char)) {
      result += processVowel(char, context)
      i += 1
      continue
    }
    
    if (PEGON_MAPS.singleCharConsonants[char as keyof typeof PEGON_MAPS.singleCharConsonants]) {
      result += processSingleConsonant(char, context.nextChar, i, word)
      i += 1
      continue
    }
    
    if (PEGON_MAPS.numbers[char as keyof typeof PEGON_MAPS.numbers]) {
      result += processNumber(char)
      i += 1
      continue
    }

    // Pass through unknown characters
    result += char
    i += 1
  }

  return cleanupResult(result)
}

/**
 * Creates a word transliteration function with custom dictionary support
 * @param {CustomDictionaryEntry[]} [dictionary=[]] - Optional custom dictionary
 * @returns {Function} Transliteration function for single words
 * @example
 * const transliterate = createWordTransliterator([...customEntries])
 */
function createWordTransliterator(dictionary: CustomDictionaryEntry[] = []) {
  const lookupCustom = createDictionaryLookup(dictionary)
  
  return function transliterateWord(word: string): string {
    // ✅ FIX 1: Handle whitespace-only input
    if (word.trim() === '') return word
    
    const lowerWord = word.toLowerCase()
    const { leading, core, trailing } = extractPunctuation(lowerWord)
    
    if (!core) return lowerWord

    // Try custom dictionary first for the whole word
    const customResult = lookupCustom(core)
    if (customResult) {
      return leading + customResult + trailing
    }

    // ✅ FIX 2: Check if word contains hyphen
    if (core.includes('-')) {
      // Split by hyphens and transliterate each part
      const pegonParts = core.split(/(-)/g)
        .map((subpart, index) => {
          if (subpart === '-') return subpart
          
          // Check if subpart is in dictionary
          const subCustomResult = lookupCustom(subpart)
          if (subCustomResult) return subCustomResult
          
          // Rule-based transliteration
          const cleaned = cleanWord(subpart)
          if (!cleaned) return ''
          
          // ✅ FIX 3: After hyphen, treat as start of new word
          const isAfterHyphen = index > 0 && core.split(/(-)/g)[index - 1] === '-'
          return processWordWithContext(cleaned, isAfterHyphen)
        })
        .join('')
      
      return leading + pegonParts + trailing
    }

    // Fallback to rule-based transliteration for simple words
    const cleaned = cleanWord(core)
    const pegon = processWord(cleaned)
    
    return leading + pegon + trailing
  }
}

// ============================================================================
// SENTENCE & PARAGRAPH PROCESSING (Function composition)
// ============================================================================

/**
 * Preprocesses text by expanding abbreviations
 * @param {string} text - Text to preprocess
 * @returns {string} Preprocessed text
 */
function preprocessText(text: string): string {
  return text
    .replace(/\b(\d+)\s*h\b/gi, '$1 hijriah')
    .replace(/\bno\s*\.\s*/gi, 'nomor ')
}

/**
 * Replaces Western commas with Arabic commas
 * @param {string} text - Text to process
 * @returns {string} Text with Arabic commas
 */
function replaceCommaWithArabic(text: string): string {
  return text.replace(/,/g, '،')
}

/**
 * Creates a sentence transliteration function
 * Preserves whitespace and handles multiple words
 * Also handles hyphens as word separators
 * @param {CustomDictionaryEntry[]} [dictionary=[]] - Optional custom dictionary
 * @returns {Function} Sentence transliteration function
 * @example
 * const transliterate = createSentenceTransliterator()
 * transliterate('assalamu alaikum') // 'أَسَّلَمُ عَلَيْكُمْ'
 * transliterate('apa-apa') // 'أَڤَا-أَڤَا'
 */
function createSentenceTransliterator(dictionary: CustomDictionaryEntry[] = []) {
  const transliterateWord = createWordTransliterator(dictionary)
  
  return function transliterateSentence(text: string): string {
    // ✅ FIX: Split HANYA by whitespace, hyphen logic ada di word level
    return text.split(/(\s+)/g)
      .map(part => {
        if (part.trim() === '') {
          return part // Keep whitespace as-is
        }
        return transliterateWord(part)
      })
      .join('')
  }
}

/**
 * Creates a paragraph transliteration function
 * Handles multiple lines and applies text preprocessing
 * @param {CustomDictionaryEntry[]} [dictionary=[]] - Optional custom dictionary
 * @returns {Function} Paragraph transliteration function
 * @example
 * const transliterate = createParagraphTransliterator()
 * transliterate('Baris pertama\nBaris kedua')
 */
function createParagraphTransliterator(dictionary: CustomDictionaryEntry[] = []) {
  const transliterateSentence = createSentenceTransliterator(dictionary)
  
  return function transliterateParagraph(text: string): string {
    const preprocessed = preprocessText(text)
    const lines = preprocessed.split('\n')
    const transliterated = lines
      .map(line => line.trim() === '' ? line : transliterateSentence(line))
      .join('\n')
    
    return replaceCommaWithArabic(transliterated)
  }
}

// ============================================================================
// PUBLIC API (Functional interface)
// ============================================================================

/**
 * Transliterates a single Indonesian word to Pegon script
 * @param {string} word - Indonesian word to transliterate
 * @param {CustomDictionaryEntry[]} [customDictionary=[]] - Optional custom dictionary entries
 * @returns {string} Pegon script representation
 * @example
 * transliterateWord('salam') // 'سَلَمْ'
 * transliterateWord('Allah', [{ teks_ind: 'Allah', pegon: 'ﷲ' }]) // 'ﷲ'
 */
export function transliterateWord(
  word: string,
  customDictionary: CustomDictionaryEntry[] = []
): string {
  return createWordTransliterator(customDictionary)(word)
}

/**
 * Transliterates an Indonesian sentence to Pegon script
 * Preserves whitespace between words
 * @param {string} text - Indonesian sentence to transliterate
 * @param {CustomDictionaryEntry[]} [customDictionary=[]] - Optional custom dictionary entries
 * @returns {string} Pegon script representation
 * @example
 * transliterateSentence('assalamu alaikum') // 'أَسَّلَمُ عَلَيْكُمْ'
 */
export function transliterateSentence(
  text: string,
  customDictionary: CustomDictionaryEntry[] = []
): string {
  return createSentenceTransliterator(customDictionary)(text)
}

/**
 * Transliterates an Indonesian paragraph to Pegon script
 * Handles multiple lines, preprocesses abbreviations, and replaces commas
 * @param {string} text - Indonesian paragraph to transliterate
 * @param {CustomDictionaryEntry[]} [customDictionary=[]] - Optional custom dictionary entries
 * @returns {string} Pegon script representation with Arabic punctuation
 * @example
 * transliterateParagraph('Baris pertama\nBaris kedua, dengan koma.')
 */
export function transliterateParagraph(
  text: string,
  customDictionary: CustomDictionaryEntry[] = []
): string {
  return createParagraphTransliterator(customDictionary)(text)
}

/**
 * Transliterates an array of Indonesian words to Pegon script
 * @param {string[]} words - Array of Indonesian words
 * @param {CustomDictionaryEntry[]} [customDictionary=[]] - Optional custom dictionary entries
 * @returns {string[]} Array of Pegon script representations
 * @example
 * transliterateWords(['salam', 'alaikum']) // ['سَلَمْ', 'عَلَيْكُمْ']
 */
export function transliterateWords(
  words: string[],
  customDictionary: CustomDictionaryEntry[] = []
): string[] {
  const transliterator = createWordTransliterator(customDictionary)
  return words.map(transliterator)
}

/**
 * Creates a reusable transliterator with custom dictionary
 * More efficient for multiple transliterations with same dictionary
 * @param {CustomDictionaryEntry[]} [customDictionary=[]] - Optional custom dictionary entries
 * @returns {Object} Object with word, sentence, and paragraph transliteration functions
 * @example
 * const transliterator = createTransliterator([...myDictionary])
 * transliterator.word('salam')
 * transliterator.sentence('assalamu alaikum')
 * transliterator.paragraph('...')
 */
export function createTransliterator(customDictionary: CustomDictionaryEntry[] = []) {
  return {
    word: createWordTransliterator(customDictionary),
    sentence: createSentenceTransliterator(customDictionary),
    paragraph: createParagraphTransliterator(customDictionary)
  }
}
