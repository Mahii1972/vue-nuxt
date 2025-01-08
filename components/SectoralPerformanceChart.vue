<template>
  <div class="w-full chart-container">
    <div class="text-gray-600 text-sm mb-2">
      Date: {{ formatDate(sectoralData[0].date_captured) }}
    </div>
    <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
)

const props = defineProps({
  sectoralData: {
    type: Array,
    required: true
  },
  duration: {
    type: String,
    required: true
  }
})

// Format date helper function
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const chartData = computed(() => {
  // Sort sectors by market cap change
  const sortedData = [...props.sectoralData].sort((a, b) => b.market_cap_change - a.market_cap_change)
  
  return {
    labels: sortedData.map(item => item.sector),
    datasets: [{
      label: 'Market Cap Change (%)',
      data: sortedData.map(item => item.market_cap_change),
      backgroundColor: sortedData.map(item => 
        item.market_cap_change > 0 
          ? 'rgba(34, 197, 94, 0.7)'  // green for positive
          : 'rgba(239, 68, 68, 0.7)'  // red for negative
      ),
      borderColor: sortedData.map(item => 
        item.market_cap_change > 0 
          ? 'rgb(34, 197, 94)'  // green for positive
          : 'rgb(239, 68, 68)'  // red for negative
      ),
      borderWidth: 1,
      barThickness: 24  // Make bars thicker
    }]
  }
})

const chartOptions = computed(() => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      right: 20  // Add some padding on the right for values
    }
  },
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: true,
      text: `Sectoral Performance (${props.duration})`,
      padding: 20,
      font: {
        size: 16,
        weight: 'bold'
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => `${context.raw}%`
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        callback: (value) => `${value}%`,
        font: {
          size: 12
        }
      }
    },
    y: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 13,
          weight: '500'
        }
      }
    }
  }
}))
</script>

<style scoped>
.chart-container {
  min-height: 600px;
  height: calc(100vh - 300px); /* Responsive height based on viewport */
  max-height: 800px;
  @apply bg-white rounded-lg shadow-sm p-4;
}

/* Make the chart text sharper */
:deep(.chart-container canvas) {
  image-rendering: crisp-edges;
}

/* Ensure tooltip is above other elements */
:deep(.chartjs-tooltip) {
  @apply z-50;
}
</style> 