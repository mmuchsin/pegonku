<script setup lang="ts">
import { useGuideStatus } from '~/composables/useGuideStatus'

// Use the composable
const { hasReadGuide, markGuideAsRead } = useGuideStatus()

// Initialize state
const hasCompletedOnboarding = ref(hasReadGuide())
const hasScrolledToBottom = ref(false)
const hasConfirmed = ref(false)
const appButtonRef = ref<HTMLElement | null>(null)

// Handle scroll detection
function handleScroll(event: Event) {
  const element = event.target as HTMLElement
  const scrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50
  
  if (scrolledToBottom && !hasScrolledToBottom.value) {
    hasScrolledToBottom.value = true
  }
}

// Complete onboarding
function completeOnboarding() {
  if (hasConfirmed.value && hasScrolledToBottom.value) {
    hasCompletedOnboarding.value = true
    markGuideAsRead()
    
    // Navigate to the main index page
    nextTick(() => {
      navigateTo('/')
    })
  }
}

// Reopen guide
function reopenGuide() {
  if (process.client) {
    localStorage.removeItem('hasReadGuide')
    hasCompletedOnboarding.value = false
    hasScrolledToBottom.value = false
    hasConfirmed.value = false
  }
}

// Your existing data arrays (keeping them as is)
const vowelData = [
  {
    letter: 'A',
    awal: { arab: 'اَ', example: 'اَفِيْ', latin: 'Api' },
    tengah: { arab: 'ـَا', example: 'فَاسَارْ', latin: 'Pasar' },
    akhir: { arab: 'ـَا', example: 'سَامَا', latin: 'Sama' }
  },
  {
    letter: 'I',
    awal: { arab: 'اِ', example: 'اِتُوْ', latin: 'Itu' },
    tengah: { arab: 'ـِي', example: 'تِيْڮَا', latin: 'Tiga' },
    akhir: { arab: 'ـِي', example: 'سِينِي', latin: 'Sini' }
  },
  {
    letter: 'U',
    awal: { arab: 'اُ', example: 'اُبِيْ', latin: 'Ubi' },
    tengah: { arab: 'ـُو', example: 'كُوْكُوْ', latin: 'Kuku' },
    akhir: { arab: 'ـُو', example: 'سُوكُوْ', latin: 'Suku' }
  },
  {
    letter: 'E',
    awal: { arab: 'آ', example: 'آنَاكْ', latin: 'Enak' },
    tengah: { arab: 'ـٓ', example: 'بٓكَالْ', latin: 'Bekal' },
    akhir: { arab: 'ـٓ', example: 'نَاسِيْ', latin: 'Nasi' }
  },
  {
    letter: 'O',
    awal: { arab: 'ؤُ', example: 'ؤُرَاعْ', latin: 'Orang' },
    tengah: { arab: 'ـُو', example: 'تُوْفِي', latin: 'Topi' },
    akhir: { arab: 'ـُو', example: 'جَاڮُو', latin: 'Jago' }
  }
]

const consonantData = [
  { latin: 'B', pegon: 'ب' }, { latin: 'K', pegon: 'ك' }, { latin: 'S', pegon: 'س' },
  { latin: 'C', pegon: 'چ' }, { latin: 'L', pegon: 'ل' }, { latin: 'T', pegon: 'ت' },
  { latin: 'D', pegon: 'د' }, { latin: 'M', pegon: 'م' }, { latin: 'V', pegon: 'ف' },
  { latin: 'F', pegon: 'ف' }, { latin: 'N', pegon: 'ن' }, { latin: 'W', pegon: 'و' },
  { latin: 'G', pegon: 'ڮ' }, { latin: 'P', pegon: 'ف' }, { latin: 'Y', pegon: 'ي' },
  { latin: 'H', pegon: 'ه' }, { latin: 'Q', pegon: 'ق' }, { latin: 'Z', pegon: 'ز' },
  { latin: 'J', pegon: 'ج' }, { latin: 'R', pegon: 'ر' }, { latin: '', pegon: '' }
]

const specialCombinations = [
  { combo: 'NG', pegon: 'ع', example: 'عَاجِي', meaning: 'Ngaji' },
  { combo: 'NY', pegon: 'ۑ', example: 'ۑَامُوكْ', meaning: 'Nyamuk' },
  { combo: 'SY', pegon: 'ش', example: 'شُوْكُورْ', meaning: 'Syukur' }
]

const arabicNames = [
  { arabic: 'مُحَمَّد', pegon: 'مُحَمَّدْ' },
  { arabic: 'عَلِيّ', pegon: 'عَلِي' },
  { arabic: 'فَاطِمَة', pegon: 'فَاطِمَةْ' },
  { arabic: 'خَالِد', pegon: 'خَالِدْ' },
  { arabic: 'عَبْدُ الله', pegon: 'عَبْدُ اللهْ' },
  { arabic: 'يُوسُف', pegon: 'يُوسُفْ' }
]

const arabicPlaces = [
  { arabic: 'مَكَّة', pegon: 'مَكَّةْ' },
  { arabic: 'مَدِينَة', pegon: 'مَدِينَةْ' },
  { arabic: 'بَغْدَاد', pegon: 'بَغْدَادْ' },
  { arabic: 'شَام', pegon: 'شَامْ' }
]

const arabicTerms = [
  { arabic: 'إِسْلَام', pegon: 'إِسْلَامْ' },
  { arabic: 'قُرْآن', pegon: 'قُرْآنْ' },
  { arabic: 'سُنَّة', pegon: 'سُنَّةْ' },
  { arabic: 'حَدِيث', pegon: 'حَدِيثْ' },
  { arabic: 'فِقْه', pegon: 'فِقِهْ' },
  { arabic: 'تَوْحِيد', pegon: 'تَوْحِيدْ' },
  { arabic: 'شَرِيعَة', pegon: 'شَرِيعَةْ' }
]
</script>

<template>
  <!-- ONBOARDING SCREEN -->
  <div class="min-h-screen bg-elevated p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header Alert -->
      <UAlert
        color="warning"
        variant="solid"
        title="📖 Panduan Pegon - Wajib Dibaca"
        description="Silakan baca panduan lengkap ini dengan seksama sebelum menggunakan aplikasi. Pemahaman yang baik akan membantu Anda menulis Pegon dengan benar."
        class="mb-6"
      />

      <!-- Main Content -->
      <div class="space-y-6">
        <UAlert
          color="info"
          variant="soft"
          icon="i-lucide-info"
          description="Scroll ke bawah untuk membaca seluruh panduan hingga selesai."
        />

        <!-- Scrollable Content -->
        <div
          class="max-h-[70vh] overflow-y-auto p-6 md:p-8 bg-default rounded-lg border-2 border-primary/20 shadow-lg space-y-8"
          @scroll="handleScroll"
        >
          <!-- Title -->
          <div class="text-center pb-6 border-b-2 border-primary/20">
            <h1 class="text-3xl md:text-4xl font-bold text-primary mb-2">
              ✨ Panduan Pegon Lengkap ✨
            </h1>
            <p class="text-muted text-sm">Panduan Resmi Penulisan Aksara Pegon</p>
          </div>

          <!-- SECTION 1: VOWELS -->
          <section>
            <div class="mb-6 p-4 bg-primary/5 rounded-lg">
              <h2 class="text-2xl font-bold mb-3 flex items-center gap-2">
                <span class="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-lg">1</span>
                Huruf Vokal
              </h2>
              <p class="text-sm text-muted">
                Huruf vokal dapat muncul di <strong>awal</strong>, <strong>tengah</strong>, atau <strong>akhir</strong> kata.
              </p>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-primary text-white">
                    <th class="border border-primary/20 p-3 text-left font-bold">Huruf</th>
                    <th class="border border-primary/20 p-3 text-center font-bold">Di Awal</th>
                    <th class="border border-primary/20 p-3 text-center font-bold">Contoh (Awal)</th>
                    <th class="border border-primary/20 p-3 text-center font-bold">Di Tengah</th>
                    <th class="border border-primary/20 p-3 text-center font-bold">Contoh (Tengah)</th>
                    <th class="border border-primary/20 p-3 text-center font-bold">Di Akhir</th>
                    <th class="border border-primary/20 p-3 text-center font-bold">Contoh (Akhir)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(vowel, index) in vowelData"
                    :key="vowel.letter"
                    :class="index % 2 === 0 ? 'bg-primary/5' : 'bg-default'"
                  >
                    <td class="border border-primary/20 p-3">
                      <span class="font-bold text-2xl text-primary">{{ vowel.letter }}</span>
                    </td>
                    <td class="border border-primary/20 p-3 text-center">
                      <span class="text-3xl font-arabic" dir="rtl">{{ vowel.awal.arab }}</span>
                    </td>
                    <td class="border border-primary/20 p-3 text-center">
                      <div class="space-y-1">
                        <div class="text-2xl font-arabic" dir="rtl">{{ vowel.awal.example }}</div>
                        <div class="text-sm text-muted">{{ vowel.awal.latin }}</div>
                      </div>
                    </td>
                    <td class="border border-primary/20 p-3 text-center">
                      <span class="text-3xl font-arabic" dir="rtl">{{ vowel.tengah.arab }}</span>
                    </td>
                    <td class="border border-primary/20 p-3 text-center">
                      <div class="space-y-1">
                        <div class="text-2xl font-arabic" dir="rtl">{{ vowel.tengah.example }}</div>
                        <div class="text-sm text-muted">{{ vowel.tengah.latin }}</div>
                      </div>
                    </td>
                    <td class="border border-primary/20 p-3 text-center">
                      <span class="text-3xl font-arabic" dir="rtl">{{ vowel.akhir.arab }}</span>
                    </td>
                    <td class="border border-primary/20 p-3 text-center">
                      <div class="space-y-1">
                        <div class="text-2xl font-arabic" dir="rtl">{{ vowel.akhir.example }}</div>
                        <div class="text-sm text-muted">{{ vowel.akhir.latin }}</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div class="border-t-2 border-dashed border-primary/20 my-8" />

          <!-- SECTION 2: CONSONANTS -->
          <section>
            <div class="mb-6 p-4 bg-secondary/5 rounded-lg">
              <h2 class="text-2xl font-bold mb-3 flex items-center gap-2">
                <span class="flex items-center justify-center w-8 h-8 bg-secondary text-white rounded-full text-lg">2</span>
                Huruf Konsonan
              </h2>
              <p class="text-sm text-muted">
                Konsonan digunakan sebagai kerangka kata. Bentuknya tetap, hanya harakat dan posisi yang berubah.
              </p>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-secondary text-white">
                    <th class="border border-secondary/20 p-3 text-center font-bold">Huruf Latin</th>
                    <th class="border border-secondary/20 p-3 text-center font-bold">Huruf Pegon</th>
                    <th class="border border-secondary/20 p-3 text-center font-bold">Huruf Latin</th>
                    <th class="border border-secondary/20 p-3 text-center font-bold">Huruf Pegon</th>
                    <th class="border border-secondary/20 p-3 text-center font-bold">Huruf Latin</th>
                    <th class="border border-secondary/20 p-3 text-center font-bold">Huruf Pegon</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="i in 7" :key="i" :class="i % 2 === 0 ? 'bg-secondary/5' : 'bg-default'">
                    <template v-for="col in 3" :key="col">
                      <td class="border border-secondary/20 p-3 text-center font-bold text-lg">
                        {{ consonantData[(i - 1) * 3 + (col - 1)]?.latin || '' }}
                      </td>
                      <td class="border border-secondary/20 p-3 text-center">
                        <span class="text-3xl font-arabic" dir="rtl">
                          {{ consonantData[(i - 1) * 3 + (col - 1)]?.pegon || '' }}
                        </span>
                      </td>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div class="border-t-2 border-dashed border-primary/20 my-8" />

          <!-- SECTION 3: SPECIAL COMBINATIONS -->
          <section>
            <div class="mb-6 p-4 bg-warning/5 rounded-lg">
              <h2 class="text-2xl font-bold mb-3 flex items-center gap-2">
                <span class="flex items-center justify-center w-8 h-8 bg-warning text-white rounded-full text-lg">3</span>
                Gabungan Spesial
              </h2>
              <p class="text-sm text-muted">
                Beberapa bunyi khas bahasa lokal menggunakan huruf tambahan khusus dalam Pegon.
              </p>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-warning text-white">
                    <th class="border border-warning/20 p-3 text-center font-bold">Gabungan</th>
                    <th class="border border-warning/20 p-3 text-center font-bold">Huruf Pegon</th>
                    <th class="border border-warning/20 p-3 text-center font-bold">Contoh</th>
                    <th class="border border-warning/20 p-3 text-center font-bold">Arti</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in specialCombinations"
                    :key="item.combo"
                    :class="index % 2 === 0 ? 'bg-warning/5' : 'bg-default'"
                  >
                    <td class="border border-warning/20 p-3 text-center font-bold text-xl">
                      {{ item.combo }}
                    </td>
                    <td class="border border-warning/20 p-3 text-center">
                      <span class="text-4xl font-arabic" dir="rtl">{{ item.pegon }}</span>
                    </td>
                    <td class="border border-warning/20 p-3 text-center">
                      <span class="text-3xl font-arabic" dir="rtl">{{ item.example }}</span>
                    </td>
                    <td class="border border-warning/20 p-3 text-center font-medium">
                      {{ item.meaning }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div class="border-t-2 border-dashed border-primary/20 my-8" />

          <!-- SECTION 4: ARABIC WORDS -->
          <section>
            <div class="mb-6 p-4 bg-success/5 rounded-lg">
              <h2 class="text-2xl font-bold mb-3 flex items-center gap-2">
                <span class="flex items-center justify-center w-8 h-8 bg-success text-white rounded-full text-lg">4</span>
                Kata Benda Bahasa Arab
              </h2>
              <p class="text-sm text-muted">
                Penulisan kata benda dari bahasa Arab menyesuaikan tulisan aslinya.
              </p>
            </div>

            <!-- Names Section -->
            <div class="mb-6">
              <h3 class="text-lg font-bold mb-3 text-success flex items-center gap-2">
                <UIcon name="i-lucide-user" class="size-5" />
                Contoh Nama Orang
              </h3>
              <div class="overflow-x-auto">
                <table class="w-full border-collapse">
                  <thead>
                    <tr class="bg-success text-white">
                      <th class="border border-success/20 p-3 text-center font-bold">Bahasa Arab</th>
                      <th class="border border-success/20 p-3 text-center font-bold">Pegon</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, index) in arabicNames"
                      :key="index"
                      :class="index % 2 === 0 ? 'bg-success/5' : 'bg-default'"
                    >
                      <td class="border border-success/20 p-4 text-center">
                        <span class="text-2xl font-arabic" dir="rtl">{{ item.arabic }}</span>
                      </td>
                      <td class="border border-success/20 p-4 text-center">
                        <span class="text-2xl font-arabic" dir="rtl">{{ item.pegon }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Places Section -->
            <div class="mb-6">
              <h3 class="text-lg font-bold mb-3 text-success flex items-center gap-2">
                <UIcon name="i-lucide-map-pin" class="size-5" />
                Contoh Nama Tempat
              </h3>
              <div class="overflow-x-auto">
                <table class="w-full border-collapse">
                  <thead>
                    <tr class="bg-success text-white">
                      <th class="border border-success/20 p-3 text-center font-bold">Bahasa Arab</th>
                      <th class="border border-success/20 p-3 text-center font-bold">Pegon</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, index) in arabicPlaces"
                      :key="index"
                      :class="index % 2 === 0 ? 'bg-success/5' : 'bg-default'"
                    >
                      <td class="border border-success/20 p-4 text-center">
                        <span class="text-2xl font-arabic" dir="rtl">{{ item.arabic }}</span>
                      </td>
                      <td class="border border-success/20 p-4 text-center">
                        <span class="text-2xl font-arabic" dir="rtl">{{ item.pegon }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Terms Section -->
            <div>
              <h3 class="text-lg font-bold mb-3 text-success flex items-center gap-2">
                <UIcon name="i-lucide-book-open-text" class="size-5" />
                Contoh Istilah Khusus
              </h3>
              <div class="overflow-x-auto">
                <table class="w-full border-collapse">
                  <thead>
                    <tr class="bg-success text-white">
                      <th class="border border-success/20 p-3 text-center font-bold">Bahasa Arab</th>
                      <th class="border border-success/20 p-3 text-center font-bold">Pegon</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, index) in arabicTerms"
                      :key="index"
                      :class="index % 2 === 0 ? 'bg-success/5' : 'bg-default'"
                    >
                      <td class="border border-success/20 p-4 text-center">
                        <span class="text-2xl font-arabic" dir="rtl">{{ item.arabic }}</span>
                      </td>
                      <td class="border border-success/20 p-4 text-center">
                        <span class="text-2xl font-arabic" dir="rtl">{{ item.pegon }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- Tips Section -->
          <div class="mt-8 p-6 bg-info/10 rounded-lg border-2 border-info/25">
            <h3 class="font-bold text-info flex items-center gap-2 mb-4 text-xl">
              <UIcon name="i-lucide-lightbulb" class="size-6" />
              💡 Tips Penting
            </h3>
            <ul class="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Vokal:</strong> Perhatikan posisi huruf vokal (awal, tengah, akhir) karena di beberapa kata bentuknya bisa berbeda</li>
              <li><strong>Gabungan Khusus:</strong> NG, NY, SY memiliki huruf tersendiri dalam Pegon</li>
              <li><strong>Kata Arab:</strong> Kata benda dari bahasa Arab ditulis menyesuaikan tulisan aslinya</li>
            </ul>
          </div>

          <!-- Footer -->
          <div class="mt-8 pt-6 border-t-2 border-primary/20 text-center text-xs text-muted space-y-1">
            <p class="font-medium">Panduan ini disusun berdasarkan standar penulisan Pegon yang berlaku</p>
            <p>Terakhir diperbarui: Oktober 2025 | Versi 1.0</p>
          </div>
        </div>

        <!-- Scroll Indicator -->
        <div v-if="!hasScrolledToBottom" class="flex items-center gap-2 text-warning justify-center animate-pulse">
          <UIcon name="i-lucide-arrow-down" class="size-5 animate-bounce" />
          <span class="text-sm font-medium">Silakan scroll ke bawah hingga selesai untuk melanjutkan</span>
        </div>

        <!-- Confirmation Checkbox -->
        <UCheckbox
          v-if="!hasCompletedOnboarding"
          v-model="hasConfirmed"
          :disabled="!hasScrolledToBottom"
          color="primary"
          label="✓ Saya telah membaca dan memahami seluruh Panduan Pegon"
          description="Saya akan menggunakan panduan ini sebagai referensi dalam menulis Pegon dengan benar"
          required
        />

        <!-- Complete Button -->

        <UButton v-if="hasCompletedOnboarding" icon="lucide:home" label="Kembali ke Home" color="primary" size="xl" to="/">

        </UButton>
        <UButton
          v-else
          :disabled="!hasScrolledToBottom || !hasConfirmed"
          color="primary"
          size="xl"
          block
          icon="i-lucide-check-circle"
          @click="completeOnboarding"
        >
          <span class="font-bold">Saya Siap - Lanjutkan ke Aplikasi</span>
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Arabic font support */
.font-arabic {
  font-family: 'Scheherazade New', 'Amiri', 'Traditional Arabic', 'Arial Unicode MS', sans-serif;
  font-size: 1.25em;
  line-height: 2;
}

/* RTL support */
[dir="rtl"] {
  direction: rtl;
  unicode-bidi: embed;
}

/* Custom scrollbar */
div::-webkit-scrollbar {
  width: 10px;
}

div::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 5px;
}

div::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 5px;
}

div::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #5568d3 0%, #63408d 100%);
}
</style>
