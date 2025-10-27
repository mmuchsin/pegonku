<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui'
import type { Table } from '@tanstack/vue-table'


const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

type Dictionary = {
  id: number
  teks_ind: string
  pegon: string
  created_at: string
  updated_at: string
}

const dictionary = useDictionary()

// Search state
const globalFilter = ref('')
const isExactMode = ref(false)

// Compute the search mode from the boolean
const searchMode = computed(() => isExactMode.value ? 'exact' : 'contain')

// Use the composable with reactive search and mode
const { data: apiData, status, refresh } = dictionary.useGetAll(globalFilter, searchMode)

function clearSearch() {
  globalFilter.value = ''
}

const toast = useToast()
const table = useTemplateRef<{ tableApi: Table<Dictionary> }>('table')

// Computed values for pagination
const paginationInfo = computed(() => {
  if (!table.value?.tableApi) {
    return {
      start: 0,
      end: 0,
      total: 0,
      currentPage: 1,
      pageSize: 10
    }
  }

  const state = table.value.tableApi.getState().pagination
  const totalRows = table.value.tableApi.getFilteredRowModel().rows.length

  return {
    start: (state.pageIndex * state.pageSize) + 1,
    end: Math.min((state.pageIndex + 1) * state.pageSize, totalRows),
    total: totalRows,
    currentPage: state.pageIndex + 1,
    pageSize: state.pageSize
  }
})

// Edit modal state
const isEditModalOpen = ref(false)
const editingItem = ref<Dictionary | null>(null)
const editForm = reactive({
  teks_ind: '',
  pegon: ''
})
const isUpdating = ref(false)

// Delete modal state
const isDeleteModalOpen = ref(false)
const deletingId = ref<number | null>(null)
const isDeleting = ref(false)

const columns: TableColumn<Dictionary>[] = [{
  accessorKey: 'id',
  header: ({ column }) => {
    const isSorted = column.getIsSorted()

    return h(UButton, {
      color: 'neutral',
      variant: 'ghost',
      label: 'ID',
      icon: isSorted ? (isSorted === 'asc' ? 'lucide:arrow-up-narrow-wide' : 'lucide:arrow-down-wide-narrow') : 'lucide:arrow-up-down',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
    })
  },
  cell: ({ row }) => `#${row.getValue('id')}`
}, {
  accessorKey: 'teks_ind',
  header: ({ column }) => {
    const isSorted = column.getIsSorted()

    return h(UButton, {
      color: 'neutral',
      variant: 'ghost',
      label: 'Indonesia',
      icon: isSorted ? (isSorted === 'asc' ? 'lucide:arrow-up-narrow-wide' : 'lucide:arrow-down-wide-narrow') : 'lucide:arrow-up-down',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
    })
  }
}, {
  accessorKey: 'pegon',
  header: ({ column }) => {
    const isSorted = column.getIsSorted()

    return h(UButton, {
      color: 'neutral',
      variant: 'ghost',
      label: 'Pegon',
      icon: isSorted ? (isSorted === 'asc' ? 'lucide:arrow-up-narrow-wide' : 'lucide:arrow-down-wide-narrow') : 'lucide:arrow-up-down',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
    })
  },
  cell: ({ row }) => h('div', { class: 'text-right text-lg font-pegon' }, row.getValue('pegon'))
}, {
  id: 'actions',
  header: '',
  cell: ({ row }) => {
    const items = [{
      label: 'Edit',
      icon: 'lucide:edit',
      onSelect: () => handleEdit(row.original)
    }, {
      label: 'Delete',
      icon: 'lucide:trash',
      color: 'error',
      onSelect: () => confirmDelete(row.original.id)
    }]

    return h('div', { class: 'text-right' }, h(UDropdownMenu, {
      items,
      'aria-label': 'Actions'
    }, () => h(UButton, {
      icon: 'lucide:ellipsis-vertical',
      color: 'neutral',
      variant: 'ghost',
      size: 'sm',
      'aria-label': 'Actions menu'
    })))
  }
}]

const sorting = ref([{
  id: 'id',
  desc: true
}])

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})

// Edit handlers
function handleEdit(item: Dictionary) {
  editingItem.value = item
  editForm.teks_ind = item.teks_ind
  editForm.pegon = item.pegon
  isEditModalOpen.value = true
}

async function saveEdit() {
  if (!editingItem.value?.id) {
    toast.add({
      title: 'Error',
      description: 'ID tidak valid',
      color: 'error',
      icon: 'lucide:alert-circle'
    })
    return
  }

  if (!editForm.teks_ind.trim() || !editForm.pegon.trim()) {
    toast.add({
      title: 'Validasi Gagal',
      description: 'Teks Indonesia dan Pegon harus diisi',
      color: 'warning',
      icon: 'lucide:alert-circle'
    })
    return
  }

  isUpdating.value = true

  try {
    await dictionary.update(editingItem.value.id, {
      teks_ind: editForm.teks_ind.trim(),
      pegon: editForm.pegon.trim()
    })

    isEditModalOpen.value = false
    await refresh()

    toast.add({
      title: 'Berhasil',
      description: 'Data berhasil diperbarui',
      color: 'success',
      icon: 'lucide:check-circle'
    })
  } catch (error: any) {
    console.error('Update failed:', error)
    toast.add({
      title: 'Gagal',
      description: error.message || 'Gagal memperbarui data',
      color: 'error',
      icon: 'lucide:alert-circle'
    })
  } finally {
    isUpdating.value = false
  }
}

// Delete handlers
function confirmDelete(id: number) {
  deletingId.value = id
  isDeleteModalOpen.value = true
}

async function handleDelete() {
  if (!deletingId.value) return

  isDeleting.value = true

  try {
    await dictionary.remove(deletingId.value)

    isDeleteModalOpen.value = false
    await refresh()

    toast.add({
      title: 'Berhasil',
      description: 'Data berhasil dihapus',
      color: 'success',
      icon: 'lucide:check-circle'
    })
  } catch (error: any) {
    console.error('Delete failed:', error)
    toast.add({
      title: 'Gagal',
      description: error.message || 'Gagal menghapus data',
      color: 'error',
      icon: 'lucide:alert-circle'
    })
  } finally {
    isDeleting.value = false
    deletingId.value = null
  }
}

function cancelDelete() {
  isDeleteModalOpen.value = false
  deletingId.value = null
}
</script>

<template>
  <UContainer class="max-w-2xl min-h-screen px-3 sm:px-4 py-4 sm:py-6 pb-24 sm:pb-32">
    <div class="space-y-4 sm:space-y-6">
      <!-- Header -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <h1 class="text-xl sm:text-2xl font-bold truncate">Kamus Pegon</h1>
          <p class="text-xs sm:text-sm text-muted truncate">Daftar kamus Latin ke Pegon</p>
        </div>

        <!-- Home button: with label on desktop, icon only on mobile -->
        <UButton icon="lucide:home" label="Home" color="primary" size="sm" to="/"
          class="shrink-0 hidden sm:inline-flex" />
        <UButton icon="lucide:home" color="primary" size="sm" to="/" square class="shrink-0 sm:hidden"
          aria-label="Home" />
      </div>

      <!-- Search bar with clear button and mode switch -->
      <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <!-- Search input -->
        <UInput v-model="globalFilter" placeholder="Cari teks Indonesia atau Pegon..." icon="lucide:search"
          class="flex-1">
          <template #trailing>
            <UButton v-if="globalFilter" color="neutral" variant="link" icon="lucide:x" size="xs" @click="clearSearch"
              aria-label="Clear search" class="-m-1" />
          </template>
        </UInput>

        <!-- Search mode switch -->
        <div
          class="flex items-center gap-2 justify-between sm:justify-start bg-elevated/50 sm:bg-transparent px-3 py-2 sm:p-0 rounded-md sm:rounded-none -mx-1 sm:mx-0">
          <span class="text-xs sm:text-sm text-muted sm:hidden">Pencarian Presisi</span>
          <USwitch id="mode-switch" v-model="isExactMode" label="Presisi" :ui="{ wrapper: 'hidden sm:block' }" />
        </div>
      </div>


      <!-- Table -->
      <div class="border border-default rounded-md sm:rounded-lg overflow-x-auto -mx-3 sm:mx-0">
        <UTable ref="table" :key="`${pagination.pageIndex}-${pagination.pageSize}`" v-model:sorting="sorting"
          v-model:pagination="pagination" :data="apiData || []" :columns="columns" :loading="status === 'pending'"
          :pagination-options="{
            getPaginationRowModel: getPaginationRowModel()
          }" :ui="{
            root: 'min-w-full',
            td: 'px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm whitespace-nowrap',
            th: 'px-2 sm:px-4 py-2 sm:py-3.5 text-xs sm:text-sm'
          }" />
      </div>

      <!-- Pagination Footer -->
      <div v-if="apiData && table?.tableApi" class="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="text-xs sm:text-sm text-muted order-2 sm:order-1">
          <span class="hidden sm:inline">Menampilkan </span>
          {{ paginationInfo.start }}-{{ paginationInfo.end }} dari {{ paginationInfo.total }}
        </div>

        <UPagination show-edges :default-page="paginationInfo.currentPage" :items-per-page="paginationInfo.pageSize"
          :total="paginationInfo.total" :sibling-count="1" size="sm"
          @update:page="(p: number) => table!.tableApi!.setPageIndex(p - 1)" class="order-1 sm:order-2" />
      </div>
    </div>

    <!-- Edit Modal -->
    <UModal v-model:open="isEditModalOpen" title="Edit Entri Kamus" description="Ubah teks Indonesia atau Pegon" :ui="{
      footer: 'flex gap-2 justify-end',
      content: 'sm:max-w-lg'
    }">
      <template #body>
        <div class="space-y-3 sm:space-y-4">
          <div>
            <label for="edit-teks-ind" class="block text-xs sm:text-sm font-medium mb-1.5">
              Teks Indonesia
            </label>
            <UInput id="edit-teks-ind" class="w-full" v-model="editForm.teks_ind" placeholder="Masukkan teks Indonesia"
              :disabled="isUpdating" />
          </div>

          <div>
            <label for="edit-pegon" class="block text-xs sm:text-sm font-medium mb-1.5">
              Pegon
            </label>
            <UInput id="edit-pegon" v-model="editForm.pegon" placeholder="Masukkan teks Pegon"
              class="w-full font-pegon text-right text-base sm:text-lg" :disabled="isUpdating" />
          </div>
        </div>
      </template>

      <template #footer>
        <UButton label="Batal" color="neutral" variant="outline" :disabled="isUpdating" @click="isEditModalOpen = false"
          class="flex-1 sm:flex-initial" />
        <UButton label="Simpan" icon="lucide:save" :loading="isUpdating" @click="saveEdit"
          class="flex-1 sm:flex-initial" />
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isDeleteModalOpen" title="Konfirmasi Hapus"
      description="Apakah Anda yakin ingin menghapus entri ini? Tindakan ini tidak dapat dibatalkan." :ui="{
        footer: 'flex gap-2 justify-end',
        content: 'sm:max-w-lg'
      }">
      <template #body>
        <div class="flex items-start sm:items-center gap-3 p-3 sm:p-4 bg-error/10 rounded-lg border border-error/20">
          <UIcon name="lucide:alert-triangle" class="size-5 sm:size-6 text-error shrink-0 mt-0.5 sm:mt-0" />
          <div class="text-xs sm:text-sm">
            <p class="font-medium text-error mb-0.5">Peringatan!</p>
            <p class="text-muted">Data yang dihapus tidak dapat dikembalikan.</p>
          </div>
        </div>
      </template>

      <template #footer>
        <UButton label="Batal" color="neutral" variant="outline" :disabled="isDeleting" @click="cancelDelete"
          class="flex-1 sm:flex-initial" />
        <UButton label="Hapus" icon="lucide:trash" color="error" :loading="isDeleting" @click="handleDelete"
          class="flex-1 sm:flex-initial" />
      </template>
    </UModal>
  </UContainer>
</template>
