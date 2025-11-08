<script setup lang="ts">
import { h, ref, watch, nextTick, computed } from 'vue'
import { navigateTo } from '#app' // Standard Nuxt 3 import for navigation
import { useGuideStatus } from '~/composables/useGuideStatus'
// Using your provided import path. 
// If you're using TanStack Table directly, it might be '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui' 

// --- 💡 TYPE DEFINITIONS ---
// We define the shape of your data here.

// For the Vowel table (with nested objects)
type VowelPosition = {
  arab: string
  example: string
  latin: string
}
type VowelRow = {
  letter: string
  awal: VowelPosition
  tengah: VowelPosition
  akhir: VowelPosition
}

// For the Consonant table
type ConsonantRow = {
  latin: string
  pegon: string
}

// For the Special Combinations table
type SpecialRow = {
  combo: string
  pegon: string
  example: string
  read: string
}

// A reusable type for all simple Arabic-to-Pegon tables
type ArabicRow = {
  arabic: string
  pegon: string
}

// --- ONBOARDING LOGIC ---
// (Your existing logic, no changes needed)
const { hasReadGuide, markGuideAsRead } = useGuideStatus()
const hasCompletedOnboarding = ref(hasReadGuide.value)
const hasScrolledToBottom = ref(false)
const hasConfirmed = ref(false)

watch(hasReadGuide, (newVal) => {
  hasCompletedOnboarding.value = newVal
})

function handleScroll(event: Event) {
  const element = event.target as HTMLElement
  const scrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50
  if (scrolledToBottom && !hasScrolledToBottom.value) {
    hasScrolledToBottom.value = true
  }
}

function completeOnboarding() {
  if (hasConfirmed.value && hasScrolledToBottom.value) {
    hasCompletedOnboarding.value = true
    markGuideAsRead()
    nextTick(() => {
      navigateTo('/')
    })
  }
}

// --- TABLE DATA & COLUMNS ---

// VOWEL TABLE DATA & COLUMNS
// Apply the VowelRow type
const vowelData: VowelRow[] = [
  {
    letter: 'A',
    awal: { arab: 'أَ', example: 'أَفِيۡ', latin: 'Api' },
    tengah: { arab: 'ـَا', example: 'ڤَاسَارۡ', latin: 'Pasar' },
    akhir: { arab: 'ـَا', example: 'سَامَا', latin: 'Sama' }
  },
  {
    letter: 'I',
    awal: { arab: 'ئِ', example: 'ئِتُو', latin: 'Itu' },
    tengah: { arab: 'ـِي', example: 'تِيۡڮَا', latin: 'Tiga' },
    akhir: { arab: 'ـِي', example: 'سِينِي', latin: 'Sini' }
  },
  {
    letter: 'U',
    awal: { arab: 'ؤُ', example: 'ؤُبِي', latin: 'Ubi' },
    tengah: { arab: 'ـُو', example: 'كُوكُو', latin: 'Kuku' },
    akhir: { arab: 'ـُو', example: 'سُوكُو', latin: 'Suku' }
  },
  {
    letter: 'E',
    awal: { arab: 'ئٓ', example: 'ئٓنَاكۡ', latin: 'Enak' },
    tengah: { arab: 'ـٓ', example: 'بٓكَالۡ', latin: 'Bekal' },
    akhir: { arab: 'ـٓ', example: 'نَاسِي', latin: 'Nasi' }
  },
  {
    letter: 'O',
    awal: { arab: 'ا۠', example: 'ا۠رَاعۡ', latin: 'Orang' },
    tengah: { arab: 'ا۠', example: 'تا۠ڤِي', latin: 'Topi' },
    akhir: { arab: 'ا۠', example: 'جَاڮا۠', latin: 'Jago' }
  }
]

// Apply the VowelRow type
const vowelColumns: TableColumn<VowelRow>[] = [
  {
    accessorKey: 'letter',
    header: 'Huruf',
    cell: ({ row }) => h('span', { class: 'font-bold text-xl text-primary' }, row.original.letter)
  },
  {
    id: 'awal',
    header: 'Di Awal',
    cell: ({ row }) => h('div', { class: 'space-y-2 text-center' }, [
      h('div', { class: 'text-2xl font-pegon', dir: 'rtl' }, row.original.awal.arab),
      h('div', { class: 'text-xl font-pegon', dir: 'rtl' }, row.original.awal.example),
      h('div', { class: 'text-sm text-muted' }, row.original.awal.latin)
    ])
  },
  {
    id: 'tengah',
    header: 'Di Tengah',
    cell: ({ row }) => h('div', { class: 'space-y-2 text-center' }, [
      h('div', { class: 'text-2xl font-pegon', dir: 'rtl' }, row.original.tengah.arab),
      h('div', { class: 'text-xl font-pegon', dir: 'rtl' }, row.original.tengah.example),
      h('div', { class: 'text-sm text-muted' }, row.original.tengah.latin)
    ])
  },
  {
    id: 'akhir',
    header: 'Di Akhir',
    cell: ({ row }) => h('div', { class: 'space-y-2 text-center' }, [
      h('div', { class: 'text-2xl font-pegon', dir: 'rtl' }, row.original.akhir.arab),
      h('div', { class: 'text-xl font-pegon', dir: 'rtl' }, row.original.akhir.example),
      h('div', { class: 'text-sm text-muted' }, row.original.akhir.latin)
    ])
  }
]

// CONSONANT TABLE DATA & COLUMNS
// Apply the ConsonantRow type
const consonantData: ConsonantRow[] = [
  { latin: 'B', pegon: 'ب' }, { latin: 'K', pegon: 'ك' }, { latin: 'S', pegon: 'س' },
  { latin: 'C', pegon: 'چ' }, { latin: 'L', pegon: 'ل' }, { latin: 'T', pegon: 'ت' },
  { latin: 'D', pegon: 'د' }, { latin: 'M', pegon: 'م' }, { latin: 'V', pegon: 'ڥ' },
  { latin: 'F', pegon: 'ف' }, { latin: 'N', pegon: 'ن' }, { latin: 'W', pegon: 'و' },
  { latin: 'G', pegon: 'ڮ' }, { latin: 'P', pegon: 'ڤ' }, { latin: 'Y', pegon: 'ي' },
  { latin: 'H', pegon: 'ه' }, { latin: 'Q', pegon: 'ق' }, { latin: 'Z', pegon: 'ز' },
  { latin: 'J', pegon: 'ج' }, { latin: 'R', pegon: 'ر' }
].filter(item => item.latin)

// Apply the ConsonantRow type
const consonantColumns: TableColumn<ConsonantRow>[] = [
  {
    accessorKey: 'latin',
    header: 'Latin',
    cell: ({ row }) => h('span', { class: 'font-bold text-lg' }, row.original.latin)
  },
  {
    accessorKey: 'pegon',
    header: 'Pegon',
    cell: ({ row }) => h('span', { class: 'text-3xl font-pegon', dir: 'rtl' }, row.original.pegon)
  }
]

// Dynamically split consonants into 3 columns
// This computed property will now correctly infer its type
const consonantColumns3 = computed(() => {
  const perColumn = Math.ceil(consonantData.length / 3)
  return [
    consonantData.slice(0, perColumn),
    consonantData.slice(perColumn, perColumn * 2),
    consonantData.slice(perColumn * 2)
  ]
})

// SPECIAL COMBINATIONS TABLE DATA & COLUMNS
// Apply the SpecialRow type
const specialCombinations: SpecialRow[] = [
  { combo: 'NG', pegon: 'ع', example: 'عَاجِي', read: 'Ngaji' },
  { combo: 'NY', pegon: 'ۑ', example: 'ۑَامُوكۡ', read: 'Nyamuk' },
  { combo: 'SY', pegon: 'ش', example: 'شُوكُورۡ', read: 'Syukur' },
  { combo: 'DZ', pegon: 'ذ', example: 'ذات', read: 'Dzat' },
  { combo: 'KH', pegon: 'خ', example: 'خُوسُوسۡ', read: 'Khusus' },
  { combo: 'TO', pegon: 'ط', example: 'طَلٓرَانۡسِي', read: 'Toleransi' },
  { combo: 'SO', pegon: 'ص', example: 'صَمۡبا۠ع', read: 'Sombong' },
  { combo: 'KO', pegon: 'ق', example: 'قَڤِي', read: 'Kopi' }
]

// Apply the SpecialRow type
const specialColumns: TableColumn<SpecialRow>[] = [
  {
    accessorKey: 'combo',
    header: 'Gabungan',
    cell: ({ row }) => h('span', { class: 'font-medium text-xl' }, row.original.combo)
  },
  {
    accessorKey: 'pegon',
    header: 'Huruf Pegon',
    cell: ({ row }) => h('span', { class: 'text-2xl font-pegon', dir: 'rtl' }, row.original.pegon)
  },
  {
    accessorKey: 'example',
    header: 'Contoh',
    cell: ({ row }) => h('span', { class: 'text-2xl font-pegon', dir: 'rtl' }, [
      h('div', { class: 'text-xl font-pegon', dir: 'rtl' }, row.original.example),
      h('div', { class: 'text-sm text-muted' }, row.original.read)
    ])
  }
]

// ARABIC NAMES TABLE DATA & COLUMNS
// Apply the reusable ArabicRow type
const arabicNames: ArabicRow[] = [
  { arabic: 'مُحَمَّد', pegon: 'مُحَمَّدۡ' },
  { arabic: 'عَلِيّ', pegon: 'عَلِي' },
  { arabic: 'فَاطِمَة', pegon: 'فَاطِمَةۡ' },
  { arabic: 'خَالِد', pegon: 'خَالِدۡ' },
  { arabic: 'عَبۡدُ الله', pegon: 'عَبۡدُ اللهۡ' },
  { arabic: 'يُوسُف', pegon: 'يُوسُفۡ' }
]

// Apply the reusable ArabicRow type
const arabicNamesColumns: TableColumn<ArabicRow>[] = [
  {
    accessorKey: 'arabic',
    header: 'Bahasa Arab',
    cell: ({ row }) => h('span', { class: 'text-2xl font-pegon', dir: 'rtl' }, row.original.arabic)
  },
  {
    accessorKey: 'pegon',
    header: 'Pegon',
    cell: ({ row }) => h('span', { class: 'text-2xl font-pegon', dir: 'rtl' }, row.original.pegon)
  }
]

// ARABIC PLACES TABLE DATA & COLUMNS
// Apply the reusable ArabicRow type
const arabicPlaces: ArabicRow[] = [
  { arabic: 'مَكَّة', pegon: 'مَكَّةۡ' },
  { arabic: 'مَدِينَة', pegon: 'مَدِينَةۡ' },
  { arabic: 'بَغۡدَاد', pegon: 'بَغۡدَادۡ' },
  { arabic: 'شَام', pegon: 'شَامۡ' }
]

// Apply the reusable ArabicRow type
const arabicPlacesColumns: TableColumn<ArabicRow>[] = [
  {
    accessorKey: 'arabic',
    header: 'Bahasa Arab',
    cell: ({ row }) => h('span', { class: 'text-2xl font-pegon', dir: 'rtl' }, row.original.arabic)
  },
  {
    accessorKey: 'pegon',
    header: 'Pegon',
    cell: ({ row }) => h('span', { class: 'text-2xl font-pegon', dir: 'rtl' }, row.original.pegon)
  }
]

// ARABIC TERMS TABLE DATA & COLUMNS
// Apply the reusable ArabicRow type
const arabicTerms: ArabicRow[] = [
  { arabic: 'إِسۡلَام', pegon: 'إِسۡلَامۡ' },
  { arabic: 'قُرۡآن', pegon: 'قُرۡآنۡ' },
  { arabic: 'سُنَّة', pegon: 'سُنَّةۡ' },
  { arabic: 'حَدِيث', pegon: 'حَدِيثۡ' },
  { arabic: 'فِقۡه', pegon: 'فِقِهۡ' },
  { arabic: 'تَوۡحِيد', pegon: 'تَوۡحِيدۡ' },
  { arabic: 'شَرِيعَة', pegon: 'شَرِيعَةۡ' }
]

// Apply the reusable ArabicRow type
const arabicTermsColumns: TableColumn<ArabicRow>[] = [
  {
    accessorKey: 'arabic',
    header: 'Bahasa Arab',
    cell: ({ row }) => h('span', { class: 'text-2xl font-pegon', dir: 'rtl' }, row.original.arabic)
  },
  {
    accessorKey: 'pegon',
    header: 'Pegon',
    cell: ({ row }) => h('span', { class: 'text-2xl font-pegon', dir: 'rtl' }, row.original.pegon)
  }
]
</script>

<template>
  <!-- ONBOARDING SCREEN -->
  <div class="min-h-screen bg-elevated p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header Alert -->
      <UAlert color="warning" variant="solid" title="📖 Panduan Pegon - Wajib Dibaca"
        description="Silakan baca panduan lengkap ini dengan seksama sebelum menggunakan aplikasi. Pemahaman yang baik akan membantu Anda menulis Pegon dengan benar."
        class="mb-6" />

      <!-- Main Content -->
      <div class="space-y-6">
        <UAlert color="info" variant="soft" icon="i-lucide-info"
          description="Scroll ke bawah untuk membaca seluruh panduan hingga selesai." />

        <!-- Scrollable Content -->
        <div
          class="max-h-[70vh] overflow-y-auto p-6 md:p-8 bg-default rounded-lg border-2 border-primary/20 shadow-lg space-y-8"
          @scroll="handleScroll">
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
                <span
                  class="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-lg">1</span>
                Huruf Vokal
              </h2>
              <p class="text-sm text-muted">
                Huruf vokal dapat muncul di <strong>awal</strong>, <strong>tengah</strong>, atau <strong>akhir</strong>
                kata.
              </p>
            </div>

            <!-- Mobile-friendly UTable for Vowels -->
            <UTable :data="vowelData" :columns="vowelColumns" :ui="{
              root: 'overflow-x-auto',
              base: 'min-w-full table-auto',
              th: 'bg-primary text-white text-center',
              td: 'text-center p-2 md:p-3'
            }" />
          </section>

          <div class="border-t-2 border-dashed border-primary/20 my-8" />

          <!-- SECTION 2: CONSONANTS -->
          <section>
            <div class="mb-6 p-4 bg-secondary/5 rounded-lg">
              <h2 class="text-2xl font-bold mb-3 flex items-center gap-2">
                <span
                  class="flex items-center justify-center w-8 h-8 bg-secondary text-white rounded-full text-lg">2</span>
                Huruf Konsonan
              </h2>
              <p class="text-sm text-muted">
                Konsonan digunakan sebagai kerangka kata. Bentuknya tetap, hanya harakat dan posisi yang berubah.
              </p>
            </div>

            <!-- Mobile-friendly UTable for Consonants -->
            <!-- Mobile: ONE complete table -->
            <div class="lg:hidden">
              <UTable :data="consonantData" :columns="consonantColumns" :ui="{
                root: 'overflow-x-auto',
                th: 'bg-secondary text-white text-center',
                td: 'text-center p-2 md:p-3'
              }" />
            </div>

            <!-- Desktop: THREE tables side by side -->
            <div class="hidden lg:grid lg:grid-cols-3 gap-4">
              <UTable v-for="(columnData, index) in consonantColumns3" :key="index" :data="columnData"
                :columns="consonantColumns" :ui="{
                  root: 'overflow-x-auto',
                  th: 'bg-secondary text-white text-center',
                  td: 'text-center p-3'
                }" />
            </div>
          </section>

          <div class="border-t-2 border-dashed border-primary/20 my-8" />

          <!-- SECTION 3: SPECIAL COMBINATIONS -->
          <section>
            <div class="mb-6 p-4 bg-warning/5 rounded-lg">
              <h2 class="text-2xl font-bold mb-3 flex items-center gap-2">
                <span
                  class="flex items-center justify-center w-8 h-8 bg-warning text-white rounded-full text-lg">3</span>
                Gabungan Spesial
              </h2>
              <p class="text-sm text-muted">
                Beberapa bunyi khas bahasa lokal menggunakan huruf tambahan khusus dalam Pegon.
              </p>
            </div>

            <UTable :data="specialCombinations" :columns="specialColumns" :ui="{
              root: 'overflow-x-auto',
              th: 'bg-warning text-white text-center',
              td: 'text-center p-3 sm:p-1'
            }" />
          </section>

          <div class="border-t-2 border-dashed border-primary/20 my-8" />

          <!-- SECTION 4: ARABIC WORDS -->
          <section>
            <div class="mb-6 p-4 bg-success/5 rounded-lg">
              <h2 class="text-2xl font-bold mb-3 flex items-center gap-2">
                <span
                  class="flex items-center justify-center w-8 h-8 bg-success text-white rounded-full text-lg">4</span>
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
              <UTable :data="arabicNames" :columns="arabicNamesColumns" :ui="{
                root: 'overflow-x-auto',
                th: 'bg-success text-white text-center',
                td: 'text-center p-3 md:p-4'
              }" />
            </div>

            <!-- Places Section -->
            <div class="mb-6">
              <h3 class="text-lg font-bold mb-3 text-success flex items-center gap-2">
                <UIcon name="i-lucide-map-pin" class="size-5" />
                Contoh Nama Tempat
              </h3>
              <UTable :data="arabicPlaces" :columns="arabicPlacesColumns" :ui="{
                root: 'overflow-x-auto',
                th: 'bg-success text-white text-center',
                td: 'text-center p-3 md:p-4'
              }" />
            </div>

            <!-- Terms Section -->
            <div>
              <h3 class="text-lg font-bold mb-3 text-success flex items-center gap-2">
                <UIcon name="i-lucide-book-open-text" class="size-5" />
                Contoh Istilah Khusus
              </h3>
              <UTable :data="arabicTerms" :columns="arabicTermsColumns" :ui="{
                root: 'overflow-x-auto',
                th: 'bg-success text-white text-center',
                td: 'text-center p-3 md:p-4'
              }" />
            </div>
          </section>

          <!-- Tips Section -->
          <div class="mt-8 p-6 bg-info/10 rounded-lg border-2 border-info/25">
            <h3 class="font-bold text-info flex items-center gap-2 mb-4 text-xl">
              <UIcon name="i-lucide-lightbulb" class="size-6" />
              💡 Tips Penting
            </h3>
            <ul class="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Vokal:</strong> Perhatikan penulisan huruf vokal 'o'. Perhatikan penulisan vokal yang bergandengan karena di beberapa kata
                bentuknya bisa berbeda</li>
              <li><strong>Gabungan Khusus:</strong> TO, SO, KO memiliki huruf tersendiri</li>
              <li><strong>Kata Arab:</strong> Kata benda dari bahasa Arab ditulis menyesuaikan tulisan aslinya</li>
            </ul>
          </div>

          <!-- Footer -->
          <div class="mt-8 pt-6 border-t-2 border-primary/20 text-center text-xs text-muted space-y-1">
            <p>Terakhir diperbarui: November 2025 | Versi 2.0</p>
          </div>
        </div>

        <!-- Scroll Indicator -->
        <div v-if="!hasScrolledToBottom" class="flex items-center gap-2 text-warning justify-center animate-pulse">
          <UIcon name="i-lucide-arrow-down" class="size-5 animate-bounce" />
          <span class="text-sm font-medium">Silakan scroll ke bawah hingga selesai untuk melanjutkan</span>
        </div>

        <!-- Confirmation Checkbox -->
        <UCheckbox v-if="!hasCompletedOnboarding" v-model="hasConfirmed" :disabled="!hasScrolledToBottom"
          color="primary" label="✓ Saya telah membaca dan memahami seluruh Panduan Pegon"
          description="Saya akan menggunakan panduan ini sebagai referensi dalam menulis Pegon dengan benar" required />

        <!-- Complete Button -->
        <UButton v-if="hasCompletedOnboarding" icon="lucide:home" label="Kembali ke Home" color="primary" size="xl"
          to="/" />
        <UButton v-else :disabled="!hasScrolledToBottom || !hasConfirmed" color="primary" size="xl" block
          icon="i-lucide-check-circle" @click="completeOnboarding">
          <span class="font-bold">Saya Siap - Lanjutkan ke Aplikasi</span>
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
