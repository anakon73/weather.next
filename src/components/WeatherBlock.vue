<script setup lang="ts">
import { computed, onMounted, ref, toRefs } from 'vue'
import { storeToRefs } from 'pinia'
import {
  CategoryScale,
  Chart,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
} from 'chart.js'
import CitiesSelect from './CitiesSelect.vue'
import Dialog from './Dialog.vue'
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

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale)

const { selectedCity } = toRefs(props)

const weatherStore = useWeatherStore()

const { favoriteCities } = storeToRefs(weatherStore)

const week = ref(false)
const isLoading = ref(false)
const showRemoveModal = ref(false)
const showFavoriteModal = ref(false)
const showRemoveFavoriteModal = ref(false)

function removeCity() {
  emits('removeCity', selectedCity.value.id)
  showRemoveModal.value = false
}

function toFavorite() {
  if (favoriteCities.value.length === 5) {
    showFavoriteModal.value = true
  }
  else {
    weatherStore.addToFavorite(selectedCity.value)
  }
}

function removeAndAddFavorite() {
  weatherStore.removeFromFavorite(favoriteCities.value[4].id)
  weatherStore.addToFavorite(selectedCity.value)
  showFavoriteModal.value = false
}

async function getWeather(): Promise<Weather> {
  isLoading.value = true

  const response = await fetch(`
  https://api.openweathermap.org/data/2.5/forecast?lat=${selectedCity.value.latitude}
&lon=${selectedCity.value.longitude}&appid=c8abda6ffa7d4702e44bb8eff83c6c55&units=metric`,
  )

  isLoading.value = false

  return response.json() as Promise<Weather>
}

const weatherData = ref<Weather | null>(null)
const chartRef = ref<HTMLCanvasElement | null>(null)

onMounted(async () => {
  weatherData.value = await getWeather()

  if (chartRef.value) {
    const ctx = chartRef.value.getContext('2d')

    if (ctx) {
      const labels = []
      const data = []

      for (let i = 0; i < 8; i++) {
        labels.push(
          new Date(weatherData.value!.list[i].dt_txt).toLocaleDateString('en-us', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
          }),
        )
        data.push(weatherData.value!.list[i].main.temp)
      }

      // eslint-disable-next-line no-new
      new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Temperature',
            data,
            borderWidth: 1,
            fill: false,
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.4,
          }],
        },
        options: {
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
            x: {
              ticks: {
                display: false,
              },
            },
          },
        },
      })
    }
  }
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
  <Dialog :show="showRemoveModal" @close="showRemoveModal = false">
    <div class="dialog_container">
      <p>Are you sure to delete block</p>
      <div class="dialog_buttons">
        <button class="approve_button" @click="removeCity">
          Yes
        </button>
        <button class="reject_button" @click="showRemoveModal = false">
          No
        </button>
      </div>
    </div>
  </Dialog>
  <Dialog :show="showFavoriteModal" @close="showFavoriteModal = false">
    <p>If you want to add new city remove {{ favoriteCities[4].name }} because max length of favorite cities is 5</p>
    <div class="dialog_fav_button">
      <button @click="removeAndAddFavorite">
        Remove
      </button>
      <button @click="showFavoriteModal = false">
        Don't remove
      </button>
    </div>
  </Dialog>
  <Dialog :show="showRemoveFavoriteModal" @close="showRemoveFavoriteModal = false">
    <div class="dialog_container">
      <p>Are you sure to delete block</p>
      <div class="dialog_buttons">
        <button class="approve_button" @click="weatherStore.removeFromFavorite(selectedCity.id)">
          Yes
        </button>
        <button class="reject_button" @click="showRemoveFavoriteModal = false">
          No
        </button>
      </div>
    </div>
  </Dialog>
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
            :disabled="favoriteCities.some(city => city.name === selectedCity.name)"
            @click="toFavorite"
          >
            To Favorite
          </button>
          <button
            class="remove"
            :disabled="!removable"
            @click="showRemoveModal = true"
          >
            Remove
          </button>
        </div>
      </div>
      <div v-else class="remove_container">
        <p class="city_name">
          {{ selectedCity.name }}
        </p>
        <button class="remove_favorite" @click="showRemoveFavoriteModal = true">
          Remove
        </button>
      </div>
      <h2 v-if="isLoading">
        Is Loading...
      </h2>
      <div v-else class="card_container">
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
      <canvas id="weatherChart" ref="chartRef" />
    </div>
  </div>
</template>

<style scoped>
canvas {
  height: 200px !important;
  border: 1px solid deepskyblue;
  width: 100% !important;
  margin-top: 10px;
  border-radius: 10px;
}

@media (min-width: 500px) {
  canvas {
    height: 400px !important;
  }
}

.dialog_container{
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog_container button {
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.dialog_buttons {
  display: flex;
  gap: 10px;
}

.dialog_fav_button {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.dialog_fav_button button {
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.dialog_fav_button button:first-child {
  background: red;
}

.dialog_fav_button button:last-child {
  background: rgb(37 99 235);
}

.approve_button {
  background: rgb(37 99 235);
}

.reject_button {
  background-color: red;
}

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
