<template>
  <div class="container mx-auto p-4 space-y-8">
    <h1 class="text-2xl font-bold">Market Overview</h1>
    
    <!-- BSE 500 Distribution Chart -->
    <div class="bg-white rounded-lg shadow-sm">
      <div v-if="bseData.length" class="p-4">
        <div class="h-[400px]">
          <BSEDistributionChart :distribution="bseData[0]" />
        </div>
      </div>
    </div>

    <!-- Sectoral Performance -->
    <div>
      <div class="flex gap-2 mb-4">
        <button 
          v-for="duration in availableDurations" 
          :key="duration"
          @click="selectedDuration = duration"
          :class="[
            'px-4 py-2 rounded-lg transition-colors duration-200',
            selectedDuration === duration 
              ? 'bg-blue-500 text-white shadow-sm' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          ]"
        >
          {{ duration }}
        </button>
      </div>
      
      <div v-if="currentSectoralData.length">
        <SectoralPerformanceChart 
          :sectoral-data="currentSectoralData" 
          :duration="selectedDuration"
        />
      </div>
      <p v-else class="text-gray-500 text-center py-8">No sectoral data available</p>
    </div>
  </div>
</template>

<script setup>
const selectedDuration = ref('1d')
const sectoralData = ref({})
const bseData = ref([])

// Computed property for available durations
const availableDurations = computed(() => {
  return Object.keys(sectoralData.value).sort()
})

// Computed property for current sectoral data based on selected duration
const currentSectoralData = computed(() => {
  return sectoralData.value[selectedDuration.value] || []
})

// Fetch sectoral data
const fetchSectoralData = async () => {
  try {
    const response = await fetch('/api/sectoral')
    const result = await response.json()
    if (result.success) {
      sectoralData.value = result.data
      // Set initial duration if not already in available durations
      if (!result.data[selectedDuration.value]) {
        selectedDuration.value = Object.keys(result.data)[0]
      }
    }
  } catch (error) {
    console.error('Error fetching sectoral data:', error)
  }
}

// Fetch BSE 500 distribution
const fetchBSEData = async () => {
  try {
    const response = await fetch('/api/bse500')
    const result = await response.json()
    if (result.success) {
      bseData.value = result.data
    }
  } catch (error) {
    console.error('Error fetching BSE 500 data:', error)
  }
}

// Initial data fetch
onMounted(() => {
  fetchSectoralData()
  fetchBSEData()
})
</script>

<style scoped>
.container {
  max-width: 1400px; /* Larger max-width for better use of space */
}
</style> 