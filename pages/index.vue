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
      <div v-if="Object.keys(sectoralData).length">
        <SectoralPerformanceChart :data="sectoralData" />
      </div>
      <p v-else class="text-gray-500 text-center py-8">No sectoral data available</p>
    </div>
  </div>
</template>

<script setup>
const sectoralData = ref({})
const bseData = ref([])

// Fetch sectoral data
const fetchSectoralData = async () => {
  try {
    const response = await fetch('/api/sectoral')
    const result = await response.json()
    if (result.success) {
      sectoralData.value = result.data
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
  max-width: 1400px;
}
</style> 