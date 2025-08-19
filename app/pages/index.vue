<template>
  <div class="bg-slate-100 min-h-screen font-sans text-slate-800">
    <!-- UPDATED: Added padding-bottom to account for the fixed footer -->
    <div class="container mx-auto p-4 max-w-2xl pb-24">
      <header class="text-center my-6 md:my-10">
        <h1 class="text-3xl md:text-4xl font-bold text-emerald-700">Indonesia → Pegon</h1>
        <p class="text-slate-500 mt-2">Alat bantu transliterasi dengan kamus kustom.</p>
      </header>
      
      <main class="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
        <!-- Input Text Area -->
        <div class="relative">
          <textarea
            v-model="inputText"
            class="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow resize-none"
            rows="6"
            placeholder="Tulis teks Indonesia di sini..."
          ></textarea>
        </div>

        <!-- Convert Button -->
        <div class="flex justify-center my-4">
            <button
                @click="handleConvert"
                class="bg-emerald-600 text-white font-bold py-3 px-6 rounded-md shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform hover:scale-105 flex items-center gap-2"
            >
                <span>Convert</span>
            </button>
        </div>

        <!-- Output Display -->
        <div id="output-section" class="relative">
          <div
            class="w-full p-4 pb-14 border border-slate-200 rounded-xl bg-slate-50 text-right whitespace-pre-wrap font-pegon text-3xl leading-relaxed"
            dir="rtl"
            style="min-height: 160px;"
          >
            <span v-if="!pegonResult" class="text-slate-400 text-lg font-sans" dir="ltr">Hasil akan muncul di sini...</span>
            <span v-else>{{ pegonResult }}</span>
          </div>
          
          <!-- Action Buttons -->
          <div class="absolute bottom-3 right-3 flex gap-2">
            <button 
              @click="clearAll" 
              class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-full transition-colors"
              title="Hapus Semua Teks"
            >
              <Icon name="lucide:square-x" class="h-6 w-6" />
            </button>
            <button 
              @click="copyPegonResult" 
              class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-full transition-colors"
              title="Salin Hasil Pegon"
            >
              <Icon v-if="!copied" name="lucide:copy" class="h-6 w-6" />
              <Icon v-else name="lucide:copy-check" class="h-6 w-6 text-emerald-600" />
            </button>
          </div>
        </div>
      </main>
      
      <!-- Footer Navigation -->
      <footer class="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-slate-200">
        <nav class="flex justify-around max-w-2xl mx-auto">
          <NuxtLink to="/" class="flex flex-col items-center gap-1 p-3 text-emerald-600 w-full">
            <Icon name="lucide:home" class="h-6 w-6" />
            <span class="text-xs font-semibold">Home</span>
          </NuxtLink>
          <NuxtLink to="/kamus" class="flex flex-col items-center gap-1 p-3 text-slate-500 hover:text-emerald-600 w-full">
            <Icon name="lucide:book" class="h-6 w-6" />
            <span class="text-xs font-semibold">Kamus</span>
          </NuxtLink>
          <button @click="showModal = true" class="flex flex-col items-center gap-1 p-3 text-slate-500 hover:text-emerald-600 w-full">
            <Icon name="lucide:square-plus" class="h-6 w-6" />
            <span class="text-xs font-semibold">Tambah Kata</span>
          </button>
        </nav>
      </footer>

      <!-- Add/Edit Word Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
        <div class="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
          <h2 class="text-2xl font-bold mb-6 text-slate-800">Tambah ke Kamus Kustom</h2>
          <form @submit.prevent="saveToDictionary">
            <div class="mb-4">
              <label for="teks_ind" class="block text-sm font-medium text-slate-600 mb-1">Teks Indonesia</label>
              <input type="text" id="teks_ind" v-model="newWord.teks_ind" class="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
            </div>
            <div class="mb-6">
              <label for="pegon" class="block text-sm font-medium text-slate-600 mb-1">Teks Pegon</label>
              <input type="text" id="pegon" v-model="newWord.pegon" class="w-full p-2 border border-slate-300 rounded-lg text-right font-pegon text-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500" dir="rtl">
            </div>
            <div class="flex justify-end gap-3">
              <button type="button" @click="showModal = false" class="px-5 py-2 bg-slate-100 text-slate-700 font-semibold rounded-full hover:bg-slate-200">Batal</button>
              <button type="submit" class="px-5 py-2 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
  /* Import fonts for the application */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Scheherazade+New:wght@400;700&display=swap');
  
  /* NEW: Add smooth scrolling behavior to the entire page */
  html {
    scroll-behavior: smooth;
  }
</style>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { transliterateParagraph } from '../utils/logic';

type DictionaryEntry = { 
  id?: number; 
  teks_ind: string; 
  pegon: string; 
  created_at?: Date 
};

const inputText = ref('');
const pegonResult = ref('');
const showModal = ref(false);
const newWord = ref({ teks_ind: '', pegon: '' });
const customDictionary = useState<DictionaryEntry[]>('customDictionary', () => []);
const copied = ref(false);

// Fetch dictionary data from the server
const { data, refresh } = await useFetch('/api/dictionary');

// Initialize or update the dictionary when data is fetched
watch(data, (newData) => {
  if (newData) {
    customDictionary.value = newData as DictionaryEntry[];
  }
}, { immediate: true });

// Function to handle the conversion and scroll
async function handleConvert() { // 2. Jadikan fungsinya async
    if (!inputText.value.trim()) {
        pegonResult.value = '';
        return;
    }
    pegonResult.value = transliterateParagraph(inputText.value, customDictionary.value);
    
    await nextTick(); // 3. Tunggu hingga DOM diperbarui

    // // Sekarang, perintah scroll akan bekerja dengan benar
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

// NEW: Function to clear all text and scroll to top
function clearAll() {
    inputText.value = '';
    pegonResult.value = '';
    jumpToTop();
}

// NEW: Function to scroll to the top of the page
function jumpToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Function to copy the Pegon result with visual feedback
async function copyPegonResult() {
  if (!pegonResult.value) {
    alert('Tidak ada teks untuk disalin.');
    return;
  }
  try {
    await navigator.clipboard.writeText(pegonResult.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000); // Reset icon after 2 seconds
  } catch (err) {
    console.error('Gagal menyalin teks: ', err);
    alert('Gagal menyalin teks. Silakan coba salin manual.');
  }
}

// Function to save a new word to the dictionary
async function saveToDictionary() {
  if (!newWord.value.teks_ind || !newWord.value.pegon) {
    alert('Kedua kolom harus diisi.');
    return;
  }
  try {
    await $fetch('/api/dictionary', {
      method: 'POST',
      body: newWord.value,
    });
    showModal.value = false;
    newWord.value = { teks_ind: '', pegon: '' };
    await refresh(); // Re-fetch the dictionary to get the latest data
  } catch (error) {
    console.error('Error saving to dictionary:', error);
    alert('Gagal menyimpan kata ke kamus');
  }
}
</script>
