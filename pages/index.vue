<template>
  <div class="container mx-auto p-4 space-y-8 text-white">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Market Overview</h1>
      <div class="flex items-center gap-4">
        <select 
          v-model="selectedDate" 
          class="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @change="fetchAllData"
        >
          <option value="">Select Date</option>
          <option v-for="date in availableDates" :key="date.date_captured" :value="date.date_captured">
            {{ formatDate(date.date_captured) }}
          </option>
        </select>
      </div>
    </div>
    
    <!-- BSE 500 Distribution Chart -->
    <div class="rounded-lg shadow-sm">
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

    <!-- Market Data Analysis -->
    <div class="bg-gray-900 rounded-lg p-4">
      <h2 class="text-xl font-semibold mb-4">Market Data Analysis</h2>
      <div v-if="marketData.length">
        <MarketDataTable :data="marketData" />
      </div>
      <p v-else class="text-gray-500 text-center py-8">No market data available</p>
    </div>
  </div>
</template>

<script setup>
const sectoralData = ref({})
const bseData = ref([])
const marketData = ref([])
const availableDates = ref([])
const selectedDate = ref('')

// Format date for display
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  // Add 5 hours and 30 minutes for IST
  date.setHours(date.getHours() + 5)
  date.setMinutes(date.getMinutes() + 30)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format date for API
const formatDateForAPI = (dateStr) => {
  const date = new Date(dateStr)
  // Add 5 hours and 30 minutes for IST
  date.setHours(date.getHours() + 5)
  date.setMinutes(date.getMinutes() + 30)
  return date.toISOString().split('T')[0]
}

// Fetch available dates
const fetchDates = async () => {
  try {
    const response = await fetch('/api/dates')
    const result = await response.json()
    if (result.success) {
      console.log('Raw dates from API:', result.data)
      availableDates.value = result.data
      if (result.data.length > 0) {
        selectedDate.value = result.data[0].date_captured
        console.log('Initial selected date:', selectedDate.value)
        fetchAllData()
      }
    }
  } catch (error) {
    console.error('Error fetching dates:', error)
  }
}

// Watch selectedDate changes
watch(selectedDate, (newDate) => {
  console.log('selectedDate changed to:', newDate)
})

// Fetch sectoral data
const fetchSectoralData = async () => {
  if (!selectedDate.value) return
  try {
    console.log('Raw selected date before API call:', selectedDate.value)
    const formattedDate = formatDateForAPI(selectedDate.value)
    console.log('Final formatted date for API:', formattedDate)
    const response = await fetch('/api/sectoral', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date: formattedDate })
    })
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
  if (!selectedDate.value) return
  try {
    const formattedDate = formatDateForAPI(selectedDate.value)
    console.log('Fetching BSE data for date:', formattedDate)
    const response = await fetch('/api/bse500', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date: formattedDate })
    })
    const result = await response.json()
    console.log('BSE API response:', result)
    if (result.success) {
      bseData.value = result.data
    }
  } catch (error) {
    console.error('Error fetching BSE 500 data:', error)
  }
}

// Fetch market data analysis
const fetchMarketData = async () => {
  if (!selectedDate.value) return
  try {
    const formattedDate = formatDateForAPI(selectedDate.value)
    console.log('Fetching market data for date:', formattedDate)
    const response = await fetch('/api/marketdata')
    const result = await response.json()
    console.log('Market data API response:', result)
    if (result.success) {
      marketData.value = result.data
    }
  } catch (error) {
    console.error('Error fetching market data:', error)
  }
}

// Fetch all data
const fetchAllData = () => {
  fetchSectoralData()
  fetchBSEData()
  fetchMarketData()
}

// Initial data fetch
onMounted(() => {
  fetchDates()
})
</script>

<style scoped>
.container {
  max-width: 1400px;
}
</style> 