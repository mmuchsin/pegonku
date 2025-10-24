<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { transliterateParagraph } from '../utils/logic';

definePageMeta({
  middleware: 'guide-check'
})


// Define types
type DictionaryEntry = {
  id?: number;
  teks_ind: string;
  pegon: string;
  created_at?: string
};

// Component state
const inputText = ref('');
const pegonResult = ref('');
const isModalOpen = ref(false);
const newWord = ref({ teks_ind: '', pegon: '' });
const copied = ref(false);
const customDictionary = useState<DictionaryEntry[]>('customDictionary', () => []);

// Composables
const toast = useToast();
const dictionary = useDictionary();

// Fetch dictionary data from the server using useFetch
const { data, refresh } = await useFetch<DictionaryEntry[]>('/api/dictionary', {
  key: 'dictionary-all'
});

// Initialize or update the dictionary when data is fetched
watch(data, (newData) => {
  if (newData) {
    customDictionary.value = newData;
  }
}, { immediate: true });

// Function to handle the conversion and scroll
async function handleConvert() {
  if (!inputText.value.trim()) {
    pegonResult.value = '';
    return;
  }
  pegonResult.value = transliterateParagraph(inputText.value, customDictionary.value);

  await nextTick();
  const outputSection = document.getElementById('output-section');
  if (outputSection) {
    outputSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Function to scroll to the top of the page
function jumpToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Function to clear all text and scroll to top
function clearAll() {
  inputText.value = '';
  pegonResult.value = '';
  jumpToTop();
}

// Function to copy the Pegon result with visual feedback
async function copyPegonResult() {
  if (!pegonResult.value) {
    toast.add({
      title: 'Tidak ada teks untuk disalin.',
      color: 'warning',
      icon: 'lucide:alert-circle'
    });
    return;
  }
  try {
    await navigator.clipboard.writeText(pegonResult.value);
    copied.value = true;
    toast.add({
      title: 'Teks Pegon disalin!',
      icon: 'lucide:circle-check'
    });
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Gagal menyalin teks: ', err);
    toast.add({
      title: 'Gagal menyalin teks.',
      description: 'Silakan coba salin manual.',
      color: 'error',
      icon: 'lucide:alert-circle'
    });
  }
}

// Function to save a new word to the dictionary
async function saveToDictionary() {
  if (!newWord.value.teks_ind || !newWord.value.pegon) {
    toast.add({
      title: 'Kolom tidak boleh kosong.',
      description: 'Teks Indonesia dan Pegon harus diisi.',
      color: 'warning'
    });
    return;
  }

  try {
    // Use the composable method instead
    await dictionary.create(newWord.value);

    isModalOpen.value = false;
    newWord.value = { teks_ind: '', pegon: '' };

    // Refresh the useFetch data
    await refresh();

    // Toast is handled by the composable
  } catch (error) {
    // Error toast is already handled by the composable
    console.error('Error saving to dictionary:', error);
  }
}

// Color mode
const colorMode = useColorMode();

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set(_isDark) {
    colorMode.preference = _isDark ? 'dark' : 'light'
  }
});

const showWarning = ref(true);

</script>



<template>
  <UContainer class="py-6 sm:py-10 pb-20 sm:pb-24 max-w-2xl min-h-screen">
    <header class="text-center my-6 md:my-10">
      <h1 class="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400">Indonesia → Pegon</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-2">Alat bantu transliterasi dengan kamus kustom.</p>
    </header>

    <UCard>
      <div class="space-y-4 min-h-2/3">
        <UTextarea name="text_ind" class="w-full" v-model="inputText" :rows="6" placeholder="Tulis teks Indonesia di sini..."
          autoresize />

        <div class="flex justify-center">
          <UButton @click="handleConvert" size="lg" label="Convert" icon="lucide:arrow-right-left" />
        </div>

        <div id="output-section" class="relative">
          <div
            class="w-full min-h-1/2 p-4 pb-14 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-right whitespace-pre-wrap font-pegon text-3xl leading-relaxed"
            dir="rtl" style="min-height: 160px;">
            <span v-if="!pegonResult" class="text-gray-400 dark:text-gray-500 text-lg font-sans" dir="ltr">Hasil akan
              muncul di sini...</span>
            <span v-else>{{ pegonResult }}</span>
          </div>

          <div class="absolute bottom-2 right-2 flex gap-1">
            <UTooltip text="Hapus Semua Teks">
              <UButton @click="clearAll" icon="lucide:square-x" color="neutral" variant="ghost"
                aria-label="Hapus Semua Teks" />
            </UTooltip>
            <UTooltip text="Salin Hasil Pegon">
              <UButton @click="copyPegonResult" :icon="copied ? 'lucide:copy-check' : 'lucide:copy'"
                :color="copied ? 'success' : 'neutral'" variant="ghost" aria-label="Salin Hasil Pegon" />
            </UTooltip>
          </div>
        </div>
      </div>
    </UCard>

    <footer
      class="fixed bottom-0 left-0 right-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 pb-safe">
      <nav class="flex justify-around items-center max-w-xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <UButton to="/" icon="lucide:home" size="xl" variant="ghost" color="neutral" class="flex-1 justify-center">
        </UButton>

        <UButton to="/panduan" icon="lucide:book-open" size="xl" variant="ghost" color="neutral"
          class="flex-1 justify-center">
        </UButton>

        <UButton to="/kamus" icon="lucide:book" size="xl" variant="ghost" color="neutral" class="flex-1 justify-center">
        </UButton>

        <UModal v-model:open="isModalOpen" title="Tambah Kamus">
          <!-- Trigger button goes in default slot -->
          <UButton icon="lucide:square-plus" size="xl" color="neutral" variant="ghost"
            class="flex-1 justify-center text-xs min-h-[44px]" />

          <!-- Modal content goes in #body slot -->
          <template #body>
            <UForm class="space-y-4" @submit="saveToDictionary">
              <UFormField label="Teks Indonesia" name="teks_ind">
                <UInput v-model="newWord.teks_ind" class="w-full text-left text-2xl sm:text-lg" />
              </UFormField>

              <UFormField label="Teks Pegon" name="pegon">
                <UInput v-model="newWord.pegon" class="w-full font-pegon text-2xl sm:text-lg text-right"
                  dir="rtl" />
              </UFormField>


              <div class="flex justify-end gap-2">
                <UButton label="Cancel" color="neutral" variant="outline" @click="isModalOpen = false" size="lg" />
                <UButton type="submit" label="Save" size="lg" />
              </div>

            </UForm>
          </template>
        </UModal>

        <UColorModeButton size="xl" class="flex-1 justify-center" />
      </nav>
    </footer>

  </UContainer>


</template>

<style scoped>

html {
  scroll-behavior: smooth;
}
</style>