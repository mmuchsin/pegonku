<template>
  <div class="container mx-auto p-4">
    <header class="flex items-center my-8">
      <NuxtLink to="/" class="text-blue-500">&lt; Back</NuxtLink>
      <h1 class="text-4xl font-bold mx-auto">Kamus Kustom</h1>
    </header>

    <main class="bg-white p-6 rounded-lg shadow-lg">
      <ul>
        <li v-for="entry in customDictionary" :key="entry.id" class="flex justify-between items-center p-2 border-b">
          <span>{{ entry.teks_ind }}</span>
          <span class="text-right" dir="rtl">{{ entry.pegon }}</span>
        </li>
      </ul>
    </main>
  </div>
</template>

<script setup lang="ts">
type DictionaryEntry = { id: number; teks_ind: string; pegon: string; createdAt: Date };
const customDictionary = useState<DictionaryEntry[]>('customDictionary');
</script>
