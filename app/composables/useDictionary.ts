// composables/useDictionary.ts
export const useDictionary = () => {
  const toast = useToast()

  return {
    // ✨ Updated with mode parameter
    useGetAll: (search?: MaybeRef<string>, mode?: MaybeRef<'contain' | 'exact'>) => {
      return useFetch('/api/dictionary', {
        query: computed(() => ({ 
          search: unref(search), 
          mode: unref(mode) || 'contain' 
        })),
        key: computed(() => `dictionary-${unref(search) || 'all'}-${unref(mode) || 'contain'}`)
      })
    },

    useGetOne: (id: MaybeRef<number>) => {
      return useFetch(() => `/api/dictionary/${unref(id)}`, {
        key: `dictionary-${unref(id)}`
      })
    },

    // Mutations still use $fetch
    create: async (data: { teks_ind: string; pegon: string }) => {
      try {
        const result = await $fetch('/api/dictionary', {
          method: 'POST',
          body: data
        })

        toast.add({
          title: 'Berhasil',
          description: 'Entri baru berhasil ditambahkan',
          color: 'success',
          icon: 'lucide:check-circle'
        })

        return result
      } catch (error: any) {
        toast.add({
          title: 'Gagal',
          description: error.data?.message || 'Gagal menambahkan entri',
          color: 'error',
          icon: 'lucide:circle-x'
        })
        throw error
      }
    },

    update: async (id: number, data: { teks_ind: string; pegon: string }) => {
      try {
        const result = await $fetch(`/api/dictionary/${id}`, {
          method: 'PATCH',
          body: data
        })

        toast.add({
          title: 'Berhasil',
          description: 'Entri berhasil diperbarui',
          color: 'success',
          icon: 'lucide:check-circle'
        })

        return result
      } catch (error: any) {
        toast.add({
          title: 'Gagal',
          description: error.data?.message || 'Gagal memperbarui entri',
          color: 'error',
          icon: 'lucide:circle-x'
        })
        throw error
      }
    },

    remove: async (id: number) => {
      try {
        const result = await $fetch(`/api/dictionary/${id}`, {
          method: 'DELETE'
        })

        toast.add({
          title: 'Berhasil',
          description: 'Entri berhasil dihapus',
          color: 'success',
          icon: 'lucide:check-circle'
        })

        return result
      } catch (error: any) {
        toast.add({
          title: 'Gagal',
          description: error.data?.message || 'Gagal menghapus entri',
          color: 'error',
          icon: 'lucide:circle-x'
        })
        throw error
      }
    }
  }
}
