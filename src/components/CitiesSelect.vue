<script setup lang="ts">
import { ref, toRefs, watch } from 'vue'
import queryString from 'query-string'
import type { City, RootCity } from '@/types'

const props = defineProps<{
  selectedCity?: City
}>()

const emits = defineEmits<{
  changeCity: [city: City]
}>()

const { selectedCity } = toRefs(props)

const cities = ref<RootCity | null>(null)

async function fetchCities(query: string) {
  const queryParams = queryString.stringify({ search: query })
  const response = await fetch(
    `https://api.thecompaniesapi.com/v1/locations/cities?${queryParams}`,
  )
  cities.value = await response.json() as RootCity
}

const isFocus = ref(false)
const searchQuery = ref(selectedCity.value?.name || '')

function selectCity(city: City) {
  searchQuery.value = city.name
  emits('changeCity', city)
  isFocus.value = false
}

watch(searchQuery, (newQuery) => {
  if (newQuery) {
    fetchCities(newQuery)
  }
  else {
    cities.value = null
  }
})
</script>

<template>
  <div class="wrapper">
    <input
      v-model="searchQuery"
      placeholder="Enter city name"
      @focus="isFocus = true"
      @blur="isFocus = false"
    >
    <div v-if="cities">
      <div
        v-if="isFocus && cities.cities.length"
        class="list"
        @mousedown.prevent
      >
        <p
          v-for="city in cities.cities"
          :key="`${city.latitude}${city.longitude}`"
          @mousedown="selectCity(city)"
        >
          {{ city.name }} | {{ city.country.name }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
}

input {
  max-width: 360px;
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

.list {
  max-height: 200px;
  overflow-y: auto;
  position: absolute;
  top: 40px;
  max-width: 360px;
  width: 100%;
  background-color: white;
  border: 1px solid #ccc;
  z-index: 1000;
}

.list p {
  padding: 8px;
  margin: 0;
  cursor: pointer;
}

.list p:hover {
  background-color: #f0f0f0;
}
</style>
