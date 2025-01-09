<template>
  <div class="w-full">
    <h1 class="text-2xl font-bold mb-6">Sectoral Performance</h1>
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="sticky left-0 bg-gray-100 p-3 border">Sector</th>
            <th v-for="duration in durations" :key="duration" class="p-3 border text-center">
              {{ durationLabels[duration] }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sector in uniqueSectors" :key="sector" class="hover:bg-gray-50">
            <td class="sticky left-0 bg-white p-3 border font-medium">{{ sector }}</td>
            <td v-for="duration in durations" :key="duration" 
                class="p-3 border text-center"
                :class="getCellClass(sector, duration)">
              <div class="flex items-center justify-center gap-1">
                <span v-if="getValue(sector, duration) > 0">▲</span>
                <span v-else-if="getValue(sector, duration) < 0">▼</span>
                {{ getValue(sector, duration) }}%
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

const uniqueSectors = computed(() => {
  return [...new Set(Object.keys(props.data))]
})

const getValue = (sector, duration) => {
  return parseFloat(props.data[sector][duration]).toFixed(2)
}

const getCellClass = (sector, duration) => {
  const value = getValue(sector, duration)
  return {
    'text-green-600': value > 0,
    'text-red-600': value < 0,
    'text-gray-600': value === 0
  }
}
</script>

<style scoped>
.sticky {
  position: sticky;
  z-index: 10;
}
</style>
