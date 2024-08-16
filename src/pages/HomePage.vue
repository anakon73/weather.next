<script setup lang="ts">
import { ref, watch } from 'vue'
import WeatherBlock from '@/components/WeatherBlock.vue'
import type { City, RootCity, User } from '@/types'
import { idGenerator } from '@/utils'

const ipData = ref<User>()
const userCity = ref<RootCity | undefined>()
const cities = ref<City[]>([])

async function fetchIpData() {
  const response = await fetch('http://ip-api.com/json')
  ipData.value = await response.json() as User
}

async function fetchUserCity() {
  await fetchIpData()
  const response = await fetch(
    `https://api.thecompaniesapi.com/v1/locations/cities?search=${ipData.value?.city}`,
  )
  userCity.value = await response.json() as RootCity
}

function changeCity(e: City, prevCityId: number) {
  const prevCityIndex = cities.value.findIndex(city => city.id === prevCityId)
  cities.value[prevCityIndex] = { ...e, id: prevCityId }
}

function removeCity(e: number) {
  const cityIndex = cities.value.findIndex(city => city.id === e)
  cities.value.splice(cityIndex, 1)
}

function addNewBlock() {
  cities.value.push({
    ...userCity.value!.cities[0],
    id: idGenerator(),
  })
}

fetchUserCity()

watch(userCity, () => {
  if (userCity.value?.cities.length !== 0 && cities.value.length === 0) {
    cities.value.push({
      ...userCity.value!.cities[0],
      id: idGenerator(),
    })
  }
})
</script>

<template>
  <Suspense class="blocks_list">
    <WeatherBlock
      v-for="city in cities"
      :key="city.code"
      :selected-city="city"
      :removable="cities.length > 1"
      @change-city="changeCity($event, city.id)"
      @remove-city="removeCity($event)"
    />
  </Suspense>
  <button :disabled="cities.length === 5" class="plus_button" @click="addNewBlock">
    Add one more city
  </button>
</template>

<style scoped>
.blocks_list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.plus_button {
  width: 100%;
  background: rgb(29 78 216);
  border: none;
  color: white;
  border-radius: 10px;
  padding: 8px;
  cursor: pointer;
}

.plus_button:disabled {
  opacity: 0.7;
  cursor: default;
}
</style>
