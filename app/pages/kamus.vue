<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui'

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

// ✨ Add search state
const globalFilter = ref('')

// ✨ Use boolean for switch
const isExactMode = ref(false)

// ✨ Compute the search mode from the boolean
const searchMode = computed(() => isExactMode.value ? 'exact' : 'contain')

// Use the composable with reactive search and mode
const { data: apiData, status, refresh } = dictionary.useGetAll(globalFilter, searchMode)

function clearSearch() {
  globalFilter.value = ''
}

const table = useTemplateRef('table')
const toast = useToast()

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
      size: 'sm'
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
  } catch (error: any) {
    console.error('Update failed:', error)
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
  } catch (error: any) {
    console.error('Delete failed:', error)
  } finally {
    isDeleting.value = false
  }
}

function cancelDelete() {
  isDeleteModalOpen.value = false
  deletingId.value = null
}
</script>

<template>
  <UContainer class="max-w-2xl min-h-screen p-4">
    <div class="min-h-9/10">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-2xl font-bold">Kamus Pegon</h1>
          <p class="text-sm text-muted">Daftar kamus Latin ke Pegon</p>
        </div>

        <UButton icon="lucide:home" label="Home" color="primary" size="sm" to="/" />
      </div>

      <!-- Search bar with clear button and mode switch -->
      <div class="flex gap-3 mb-4 items-center">
        <!-- ✨ Search input with trailing clear button -->
        <UInput 
          v-model="globalFilter" 
          placeholder="Cari teks Indonesia atau Pegon..." 
          icon="lucide:search"
          class="flex-1"
        >
          <template #trailing>
            <UButton
              v-show="globalFilter"
              color="neutral"
              variant="link"
              icon="lucide:x"
              :padded="false"
              @click="clearSearch"
            />
          </template>
        </UInput>
        
        <!-- ✨ Search mode switch -->
        <div class="flex items-center gap-2">
          <USwitch 
            id="mode-switch" 
            v-model="isExactMode" 
            :true-value="true" 
            :false-value="false"
            label="Presisi"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="border border-default rounded-lg overflow-hidden">
        <UTable 
          ref="table" 
          :key="`${pagination.pageIndex}-${pagination.pageSize}`" 
          v-model:sorting="sorting"
          v-model:pagination="pagination" 
          :data="apiData || []" 
          :columns="columns"
          :loading="status === 'pending'" 
          :pagination-options="{
            getPaginationRowModel: getPaginationRowModel()
          }" 
        />
      </div>

      <!-- Pagination Footer -->
      <div v-if="apiData && table?.tableApi" class="flex items-center justify-between mt-4">
        <div class="text-sm text-muted">
          Menampilkan {{ (table.tableApi.getState().pagination.pageIndex * table.tableApi.getState().pagination.pageSize) + 1 }}-{{ 
            Math.min(
              (table.tableApi.getState().pagination.pageIndex + 1) * table.tableApi.getState().pagination.pageSize, 
              table.tableApi.getFilteredRowModel().rows.length
            ) 
          }} dari {{ table.tableApi.getFilteredRowModel().rows.length }}
        </div>

        <UPagination 
          show-edges 
          :default-page="table.tableApi.getState().pagination.pageIndex + 1"
          :items-per-page="table.tableApi.getState().pagination.pageSize"
          :total="table.tableApi.getFilteredRowModel().rows.length"
          @update:page="(p) => table.tableApi.setPageIndex(p - 1)" 
        />
      </div>
    </div>

    <!-- Edit Modal -->
    <UModal v-model:open="isEditModalOpen" title="Edit Entri Kamus" description="Ubah teks Indonesia atau Pegon"
      :ui="{ footer: 'justify-end' }">
      <template #body>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Teks Indonesia</label>
            <UInput v-model="editForm.teks_ind" placeholder="Masukkan teks Indonesia" :disabled="isUpdating" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Pegon</label>
            <UInput v-model="editForm.pegon" placeholder="Masukkan teks Pegon" class="font-pegon text-right text-lg"
              :disabled="isUpdating" />
          </div>
        </div>
      </template>

      <template #footer>
        <UButton label="Batal" color="neutral" variant="outline" :disabled="isUpdating"
          @click="isEditModalOpen = false" />
        <UButton label="Simpan" icon="lucide:save" :loading="isUpdating" @click="saveEdit" />
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isDeleteModalOpen" title="Konfirmasi Hapus"
      description="Apakah Anda yakin ingin menghapus entri ini? Tindakan ini tidak dapat dibatalkan."
      :ui="{ footer: 'justify-end' }">
      <template #body>
        <div class="flex items-center gap-3 p-4 bg-error/10 rounded-lg border border-error/20">
          <UIcon name="lucide:alert-triangle" class="size-5 text-error" />
          <div class="text-sm">
            <p class="font-medium text-error">Peringatan!</p>
            <p class="text-muted">Data yang dihapus tidak dapat dikembalikan.</p>
          </div>
        </div>
      </template>

      <template #footer>
        <UButton label="Batal" color="neutral" variant="outline" :disabled="isDeleting" @click="cancelDelete" />
        <UButton label="Hapus" icon="lucide:trash" color="error" :loading="isDeleting" @click="handleDelete" />
      </template>
    </UModal>
  </UContainer>
</template>
