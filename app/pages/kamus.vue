<template>
  <div class="container max-w-2xl mx-auto p-4">
    <header class="flex items-center my-8">
      <NuxtLink to="/" class="text-blue-500">&lt; Back</NuxtLink>
      <h1 class="text-4xl font-bold mx-auto">Kamus Kustom</h1>
    </header>

    <main class="bg-white p-6 rounded-lg shadow-lg min-h-[240px]">
      <!-- table header -->
      <div class="grid grid-cols-2 gap-4 font-semibold border-b pb-2 mb-3">
        <div>Teks Indonesia</div>
        <div class="text-right">Pegon</div>
      </div>

      <ul>
        <li v-for="entry in paginatedEntries" :key="entry.id" class="grid grid-cols-2 items-center p-2 border-b">
          <div>{{ entry.teks_ind }}</div>
          <div class="text-right" dir="rtl">{{ entry.pegon }}</div>
        </li>
      </ul>

      <div class="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-2">
          <button class="px-2 py-1 text-sm bg-gray-200 rounded disabled:opacity-50" :disabled="currentPage === 1" @click="prevPage">Prev</button>
          <button class="px-2 py-1 text-sm bg-gray-200 rounded disabled:opacity-50" :disabled="currentPage === totalPages" @click="nextPage">Next</button>
        </div>

        <div class="flex items-center gap-2">
          <label for="perPage" class="text-sm">Per halaman:</label>
          <select id="perPage" v-model.number="perPage" class="border rounded px-2 py-1 text-sm w-24">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
          </select>
        </div>

        <div class="text-sm">
          Halaman {{ currentPage }} / {{ totalPages }} — Total: {{ total }}
        </div>
      </div>

      <nav class="mt-3 flex flex-wrap justify-center gap-2">
        <button v-for="p in pagesToShow" :key="p" @click="goToPage(p)"
          :class="[ 'px-2 py-1 rounded text-sm', { 'bg-blue-500 text-white': p === currentPage, 'bg-gray-100': p !== currentPage } ]">
          {{ p }}
        </button>
      </nav>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

type DictionaryEntry = { id: number; teks_ind: string; pegon: string; createdAt: Date };
// initialize state with an empty array to avoid undefined in computed properties
const customDictionary = useState<DictionaryEntry[]>('customDictionary', () => [])

const currentPage = ref(1)
const perPage = ref(10)

const total = computed(() => customDictionary.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage.value)))

const paginatedEntries = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return customDictionary.value.slice(start, start + perPage.value)
})

const pagesToShow = computed(() => {
  // show a small window of pages around current page
  const maxButtons = 7
  const pages: number[] = []
  const totalP = totalPages.value
  let start = Math.max(1, currentPage.value - Math.floor(maxButtons / 2))
  let end = Math.min(totalP, start + maxButtons - 1)
  if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

async function fetchEntries() {
  try {
    const data = await $fetch<DictionaryEntry[]>('/api/dictionary')
    customDictionary.value = data ?? []
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
  } catch (error) {
    console.error('Failed to fetch dictionary entries:', error)
  }
}

onMounted(fetchEntries)

watch(perPage, () => {
  // reset to first page when page size changes
  currentPage.value = 1
})

function goToPage(n: number) {
  if (n >= 1 && n <= totalPages.value) currentPage.value = n
}
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
</script>
