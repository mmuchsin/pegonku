<template>
  <div class="bg-gray-100 min-h-screen font-sans">
    <NuxtPage />
  </div>
</template>

<style>
/* Load Scheherazade New once for the whole app and apply it to Arabic/RTL text */
@import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap');

/* Apply Scheherazade New to elements that are right-to-left, declared as Arabic, or use .font-pegon */
[dir="rtl"] {
  font-family: 'Scheherazade New', serif;
}
</style>
