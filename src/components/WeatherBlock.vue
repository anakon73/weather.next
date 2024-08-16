<script setup lang="ts">
import { computed, onMounted, ref, toRefs } from 'vue'
import { storeToRefs } from 'pinia'
import CitiesSelect from './CitiesSelect.vue'
import type { City, Weather } from '@/types'
import { useWeatherStore } from '@/store/WeatherStore'

const props = defineProps<{
  selectedCity: City
  fixed?: boolean
  removable?: boolean
}>()

const emits = defineEmits<{
  changeCity: [city: City]
  removeCity: [cityId: City['id']]
}>()

const { selectedCity } = toRefs(props)

const weatherStore = useWeatherStore()

const { favoriteCities } = storeToRefs(weatherStore)

const week = ref(false)

async function getWeather(): Promise<Weather> {
  const response = await fetch(`
  https://api.openweathermap.org/data/2.5/forecast?lat=${selectedCity.value.latitude}
&lon=${selectedCity.value.longitude}&appid=c8abda6ffa7d4702e44bb8eff83c6c55&units=metric`,
  )

  return response.json() as Promise<Weather>
}

const weatherData = ref<Weather | null>(null)

onMounted(async () => {
  weatherData.value = await getWeather()
})

const averageTempPerDay = computed(() => {
  if (!weatherData.value)
    return null

  const groupedData: Record<
    string,
    {
      tempSum: number
      count: number
      firstItem: Weather['list'][0]
    }
  > = {}

  weatherData.value.list.forEach((item) => {
    const date = item.dt_txt.split(' ')[0]

    if (groupedData[date]) {
      groupedData[date].tempSum += item.main.temp
      groupedData[date].count += 1
    }
    else {
      groupedData[date] = {
        tempSum: item.main.temp,
        count: 1,
        firstItem: item,
      }
    }
  })

  const newList = Object.keys(groupedData).slice(0, 5).map((date) => {
    const { tempSum, count, firstItem } = groupedData[date]

    return {
      ...firstItem,
      main: {
        ...firstItem.main,
        temp: tempSum / count,
      },
    }
  })

  return {
    ...weatherData.value,
    list: newList,
  }
})
</script>

<template>
  <div class="wrapper">
    <div class="container">
      <div v-if="!fixed" class="selects_container">
        <CitiesSelect
          :selected-city="selectedCity"
          @change-city="emits('changeCity', $event)"
        />
        <div class="buttons_container">
          <button
            class="to_favorite"
            :disabled="
              favoriteCities.length === 5
                || favoriteCities.some(city => city.name === selectedCity.name)
            "
            @click="weatherStore.addToFavorite(selectedCity)"
          >
            To Favorite
          </button>
          <button
            class="remove"
            :disabled="!removable"
            @click="emits('removeCity', selectedCity.id)"
          >
            Remove
          </button>
        </div>
      </div>
      <div v-else class="remove_container">
        <p class="city_name">
          {{ selectedCity.name }}
        </p>
        <button class="remove_favorite" @click="weatherStore.removeFromFavorite(selectedCity.id)">
          Remove
        </button>
      </div>
      <div class="card_container">
        <div class="buttons">
          <button :class="{ active: !week }" @click="week = false">
            Today
          </button>
          <button :class="{ active: week }" @click="week = true">
            5 Days
          </button>
        </div>
        <div v-if="!week && weatherData" class="item">
          <img :src="`https://openweathermap.org/img/wn/${weatherData.list[0].weather[0].icon}@2x.png`">
          <div class="temp">
            <p>Temp: {{ Math.trunc(weatherData.list[0].main.temp) }}</p>
            <p>Min temp: {{ Math.trunc(weatherData.list[0].main.temp_min) }}</p>
            <p>Max temp: {{ Math.trunc(weatherData.list[0].main.temp_max) }}</p>
          </div>
        </div>
        <div v-if="week" class="list">
          <div v-for="item in averageTempPerDay?.list" :key="item.dt" class="list_item">
            <h4>
              {{ new Date(item.dt_txt).toLocaleDateString('en-us', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              }) }}
            </h4>
            <img :src="`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`">
            <div class="temp">
              <p>Temp: {{ Math.trunc(item.main.temp) }}</p>
              <p>Min temp: {{ Math.trunc(item.main.temp_min) }}</p>
              <p>Max temp: {{ Math.trunc(item.main.temp_max) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  border-radius: 8px;
}

.container {
  padding: 10px;
}

.selects_container {
  margin-bottom: 20px;
  gap: 10px;
}

.buttons_container{
  margin-top: 10px;
}

.remove_container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.to_favorite {
  padding: 6px 12px;
  background: rgb(37 99 235);
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: .3s ease-in-out;
}

.to_favorite:disabled {
  opacity: 0.5;
  cursor: default;
}

.remove {
  padding: 6px 12px;
  background: red;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: .3s ease-in-out;
}

.remove_favorite {
  padding: 6px 12px;
  background: red;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: .3s ease-in-out;
}

.remove:disabled {
  opacity: 0.5;
  cursor: default;
}

.remove:hover:enabled {
  background: firebrick;
}

.remove_favorite:hover {
  background: firebrick;
}

.buttons_container {
  display: flex;
  gap: 10px;
}

.city_name {
  font-weight: 600;
  font-size: 16px;
}

.to_favorite:hover:enabled {
  background: rgb(29 78 216);
}

.card_container {
  border: 1px solid deepskyblue;
  border-radius: 10px;
  padding: 25px;
  position: relative;
  border-top-left-radius: 0;
}

.buttons {
  position: absolute;
  top: 0;
  left: 0;
  border-bottom: 1px solid deepskyblue;
  border-right: 1px solid deepskyblue;
}

.buttons button {
  background: transparent;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.buttons button:first-child {
  border-right: 1px solid deepskyblue;
}

.item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.temp {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 18px;
  font-weight: 500;
}

.list {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 10px 0;
  border-radius: 10px;
  justify-content: center;
}

.list_item {
  text-align: center;
}

.active {
  font-weight: 700 !important;
}

@media (min-width: 500px) {
  .selects_container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .buttons_container {
    margin-bottom: 0;
  }

  .item {
    gap: 40px;
    flex-direction: row;
  }
}
</style>
