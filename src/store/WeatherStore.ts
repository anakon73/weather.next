import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import type { City } from '@/types'

export const useWeatherStore = defineStore('weather', () => {
  const favoriteCities = useLocalStorage<City[]>(
    'weather',
    [],
    {
      serializer: {
        read: (v: any) => v ? JSON.parse(v) : null,
        write: (v: any) => JSON.stringify(v),
      },
    },
  )

  function addToFavorite(city: City) {
    favoriteCities.value.push(city)
  }

  function removeFromFavorite(cityId: number) {
    const cityIndex = favoriteCities.value.findIndex(city => city.id === cityId)
    favoriteCities.value.splice(cityIndex, 1)
  }

  return { favoriteCities, addToFavorite, removeFromFavorite }
})
