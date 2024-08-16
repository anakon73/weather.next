<script setup lang="ts">
import { storeToRefs } from 'pinia'
import WeatherBlock from '@/components/WeatherBlock.vue'
import { useWeatherStore } from '@/store/WeatherStore'

const weatherStore = useWeatherStore()

const { favoriteCities } = storeToRefs(weatherStore)
</script>

<template>
  <Suspense v-if="favoriteCities.length > 0">
    <WeatherBlock
      v-for="city in favoriteCities"
      :key="city.code"
      :selected-city="city"
      fixed
    />
  </Suspense>
  <h2 v-else>
    Favorite Weather List Is Empty
  </h2>
</template>
