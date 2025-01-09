<template>
  <div class="w-full bg-gray-900 text-white p-6 rounded-lg">
    <h1 class="text-2xl font-bold mb-6">Sectoral Performance</h1>
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="sticky left-0 bg-gray-800 p-3 border border-gray-700 w-48">Sector</th>
            <th v-for="duration in durations" :key="duration" class="p-3 border border-gray-700 text-center w-64">
              {{ durationLabels[duration] }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sector in uniqueSectors" :key="sector" class="hover:bg-gray-800">
            <td class="sticky left-0 bg-gray-900 p-3 border border-gray-700 font-medium">{{ sector }}</td>
            <td v-for="duration in durations" :key="duration" 
                class="p-3 border border-gray-700 relative"
                :class="getCellClass(sector, duration)">
              <div class="h-12 flex items-center justify-center">
                <Bar 
                  :data="getChartData(sector, duration)"
                  :options="chartOptions"
                  class="w-full"
                />
                <span 
                  class="absolute text-sm font-medium"
                  :class="getValuePosition(sector, duration)"
                >{{ getValue(sector, duration) }}%</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip
)

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const durations = ['1d', '5d', '1m', '3m', '1y']
const durationLabels = {
  '1d': '1 Day',
  '5d': '5 Days',
  '1m': '1 Month',
  '3m': '3 Months',
  '1y': '1 Year'
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: false
    }
  },
  scales: {
    x: {
      display: false,
      grid: {
        display: false
      },
      min: -15,
      max: 15,
      ticks: {
        stepSize: 5
      }
    },
    y: {
      display: false,
      grid: {
        display: false
      }
    }
  }
}

const uniqueSectors = computed(() => {
  return [...new Set(Object.keys(props.data))]
})

const getValue = (sector, duration) => {
  return parseFloat(props.data[sector][duration]).toFixed(2)
}

const getChartData = (sector, duration) => {
  const value = getValue(sector, duration)
  return {
    labels: [sector],
    datasets: [{
      data: [value],
      backgroundColor: value > 0 ? '#059669' : '#DC2626',
      barThickness: 8,
      base: 0
    }]
  }
}

const getCellClass = (sector, duration) => {
  const value = getValue(sector, duration)
  return {
    'text-green-400': value > 0,
    'text-red-400': value < 0,
    'text-gray-400': value === 0
  }
}

const getValuePosition = (sector, duration) => {
  const value = getValue(sector, duration)
  return {
    'left-2': value < 0,
    'right-2': value >= 0,
    'text-white': true
  }
}
</script>

<style scoped>
.sticky {
  position: sticky;
  z-index: 10;
}
</style>
