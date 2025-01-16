<template>
  <div class="container mx-auto p-4 space-y-8 text-white">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Market Overview</h1>
      <div class="flex items-center gap-4">
        <div class="relative">
          <div 
            class="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-700 focus:outline-none cursor-pointer"
            @click="toggleDatePicker"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ selectedDate ? formatDate(selectedDate) : 'Select Date' }}
          </div>
          <div v-show="showDatePicker" class="absolute top-12 left-0 z-50">
            <DatePicker
              v-model="selectedDate"
              :masks="{ input: 'MMM D, YYYY' }"
              :min-date="minDate"
              :max-date="maxDate"
              :available-dates="availableDatesArray"
              class="date-picker"
              @update:model-value="onDateSelect"
              :model-config="{
                type: 'string',
                mask: 'YYYY-MM-DD',
              }"
            />
          </div>
        </div>
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
import { DatePicker } from 'v-calendar'
import 'v-calendar/style.css'

const sectoralData = ref({})
const bseData = ref([])
const marketData = ref([])
const availableDates = ref([])
const selectedDate = ref('')
const showDatePicker = ref(false)

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
  document.addEventListener('click', (e) => {
    const picker = document.querySelector('.date-picker')
    const button = document.querySelector('.cursor-pointer')
    if (picker && !picker.contains(e.target) && !button.contains(e.target)) {
      showDatePicker.value = false
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', () => {})
})

// Computed property for date picker attributes
const datePickerAttributes = computed(() => {
  return availableDates.value.map(date => ({
    dates: new Date(date.date_captured),
    highlight: true
  }))
})

// Computed properties for date picker
const minDate = computed(() => {
  if (availableDates.value.length === 0) return null
  return new Date(Math.min(...availableDates.value.map(d => new Date(d.date_captured))))
})

const maxDate = computed(() => {
  if (availableDates.value.length === 0) return null
  return new Date(Math.max(...availableDates.value.map(d => new Date(d.date_captured))))
})

// Computed property for available dates array
const availableDatesArray = computed(() => {
  return availableDates.value.map(d => new Date(d.date_captured))
})

// Toggle date picker visibility
const toggleDatePicker = () => {
  showDatePicker.value = !showDatePicker.value
}

// Handle date selection
const onDateSelect = (date) => {
  selectedDate.value = date
  showDatePicker.value = false
  fetchAllData()
}
</script>

<style scoped>
.container {
  max-width: 1400px;
}

:deep(.date-picker) {
  --vc-bg-light: #1f2937;
  --vc-bg-dark: #111827;
  --vc-border: #374151;
  --vc-text-light: #ffffff;
  --vc-text-dark: #9ca3af;
  --vc-accent: #3b82f6;
  --vc-accent-dark: #2563eb;
  --vc-highlight: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-radius: 0.5rem;
  border: 1px solid var(--vc-border);
  background-color: var(--vc-bg-light);
}

:deep(.date-picker .vc-disabled) {
  opacity: 0.3;
  cursor: not-allowed;
}

:deep(.date-picker .vc-pane) {
  background-color: var(--vc-bg-light);
  border-color: var(--vc-border);
}

:deep(.date-picker .vc-header) {
  color: var(--vc-text-light);
}

:deep(.date-picker .vc-weekday) {
  color: var(--vc-text-dark);
}

:deep(.date-picker .vc-day) {
  color: var(--vc-text-light);
}

:deep(.date-picker .vc-day-content) {
  color: var(--vc-text-light);
}

:deep(.date-picker .vc-highlights) {
  background-color: var(--vc-highlight);
  opacity: 0.2;
}

:deep(.date-picker input) {
  background-color: var(--vc-bg-light);
  color: var(--vc-text-light);
  border-color: var(--vc-border);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}
</style> 