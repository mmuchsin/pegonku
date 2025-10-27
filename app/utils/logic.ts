// Character mappings for Pegon transliteration
const characterMap: Record<string, string> = {
  'ny': 'ۑ', 'ng': 'ع', 'sy': 'ش', 'c': 'چ', 'g': 'ڮ', 'p': 'ف', 'f': 'ف', 'v': 'ف',
  'k': 'ك', 'q': 'ق', 'b': 'ب', 'd': 'د', 'h': 'ه', 'j': 'ج', 'l': 'ل', 'm': 'م',
  'n': 'ن', 'r': 'ر', 's': 'س', 't': 'ت', 'w': 'و', 'y': 'ي', 'z': 'ز'
}

const vowelMap: Record<string, string> = { 
  'a': 'َا', 
  'i': 'ِي', 
  'u': 'ُو', 
  'o': 'ُو', 
  'e': 'ٓ' 
}

const numberMap: Record<string, string> = { 
  '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤', 
  '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩' 
}

const vowels = 'aiueo'

const isVowel = (char?: string) => typeof char === 'string' && vowels.includes(char)

const needsSukun = (currentIndex: number, word: string) => 
  currentIndex + 1 >= word.length || !isVowel(word.charAt(currentIndex + 1))

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
  const lowerWord = word.toLowerCase()
  const leadingPunctMatch = lowerWord.match(/^[.,;:!?'"()]+/)
  const trailingPunctMatch = lowerWord.match(/[.,;:!?'"()]+$/)
  const leadingPunct = leadingPunctMatch ? leadingPunctMatch[0] : ''
  const trailingPunct = trailingPunctMatch ? trailingPunctMatch[0] : ''

  const coreStart = leadingPunct.length
  const coreEnd = Math.max(coreStart, lowerWord.length - trailingPunct.length)
  let core = lowerWord.substring(coreStart, coreEnd)
  
  if (!core) return lowerWord

  const cleanWord = core.replace(/ /g, '')

  // Check custom dictionary first (case-insensitive)
  const customEntry = customDictionary.find(
    e => e.teks_ind.toLowerCase() === core.toLowerCase()
  )
  if (customEntry) {
    return leadingPunct + customEntry.pegon + trailingPunct
  }

  let pegonResult = ''
  let i = 0

  while (i < cleanWord.length) {
    let consumed = 1
    
    // Skip duplicate consecutive vowels
    if (i > 0 && isVowel(cleanWord.charAt(i)) && cleanWord.charAt(i) === cleanWord.charAt(i - 1)) {
      i += consumed
      continue
    }

    // Check two-character combinations
    if (i + 1 < cleanWord.length) {
      const twoChars = cleanWord.substring(i, i + 2)
      
      // Special diphthong cases
      if (twoChars === 'ua') {
        pegonResult += pegonResult.length === 0 ? 'ُووَا' : 'ُووَا'
        consumed = 2
        i += consumed
        continue
      }
      if (twoChars === 'au') { 
        pegonResult += 'اَوْ'
        consumed = 2
        i += consumed
        continue
      }
      if (twoChars === 'aa') { 
        pegonResult += 'َاَ'
        consumed = 2
        i += consumed
        continue
      }
      if (twoChars === 'oo') { 
        pegonResult += 'ُوؤُ'
        consumed = 2
        i += consumed
        continue
      }
      if (twoChars === 'ii') { 
        pegonResult += 'ِئِي'
        consumed = 2
        i += consumed
        continue
      }
      
      // Check character map for digraphs (ny, ng, sy)
      if (characterMap[twoChars]) {
        pegonResult += characterMap[twoChars]
        consumed = 2
        if (needsSukun(i + 1, cleanWord)) pegonResult += 'ْ'
        i += consumed
        continue
      }
    }

    // Single character processing
    const oneChar = cleanWord.charAt(i)
    
    if (isVowel(oneChar)) {
      // Vowels at the beginning of word
      if (i === 0) {
        if (oneChar === 'a') pegonResult += 'اَ'
        else if (oneChar === 'i') pegonResult += 'اِ'
        else if (oneChar === 'u') pegonResult += 'اُ'
        else if (oneChar === 'o') pegonResult += 'ؤُ'
        else if (oneChar === 'e') pegonResult += 'آ'
      } 
      // Special handling for 'e'
      else if (oneChar === 'e') {
        const prevChar = cleanWord.charAt(i - 1)
        if (isVowel(prevChar)) {
          pegonResult += 'ئ' + (vowelMap[oneChar] || '')
        } else {
          pegonResult += vowelMap[oneChar] || ''
        }
      } 
      // Regular vowels in middle/end of word
      else {
        pegonResult += vowelMap[oneChar] || ''
      }
    } 
    // Consonants
    else if (characterMap[oneChar]) {
      pegonResult += characterMap[oneChar] || ''
      if (needsSukun(i, cleanWord)) pegonResult += 'ْ'
    } 
    // Numbers
    else if (numberMap[oneChar]) {
      pegonResult += numberMap[oneChar] || ''
    } 
    // Unknown characters (pass through)
    else {
      pegonResult += oneChar
    }
    
    i += consumed
  }

  // Clean up double diacritics
  const cleanedResult = pegonResult.replace(/([َاِيُوَْوْٓ])ْ/g, '$1')
  
  return leadingPunct + cleanedResult + trailingPunct
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
  const words = text.split(/(\s+)/)
  
  return words.map(part => {
    if (part.trim() === '') return part
    return transliterateWord(part, customDictionary)
  }).join('')
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
  let preprocessedText = text.replace(/\b(\d+)H\b/gi, '$1 Hijriah')
  preprocessedText = preprocessedText.replace(/\bno\.\b/gi, 'nomor')

  const lines = preprocessedText.split('\n')
  
  const transliteratedLines = lines.map(line => {
    const content = line.trim()
    if (content === '') return line
    return transliterateSentence(content, customDictionary)
  })
  
  // Replace comma with Arabic comma
  return transliteratedLines.join('\n').replace(/,/g, '،')
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
  return words.map(word => transliterateWord(word, customDictionary))
}
