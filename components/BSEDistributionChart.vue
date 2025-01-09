<template>
  <div class="w-full bg-gray-900 text-white p-6 rounded-lg">
    <h1 class="text-2xl font-bold mb-6">BSE 500 Distribution</h1>
    <div class="h-[300px]">
      <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
    </div>
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
  distribution: {
    type: Object,
    required: true
  }
})

const chartData = computed(() => ({
  labels: [
    '< -15%',
    '-15% to -10%',
    '-10% to -5%',
    '-5% to -2%',
    '-2% to 0%',
    '0%',
    '0% to 2%',
    '2% to 5%',
    '5% to 10%',
    '10% to 15%',
    '> 15%'
  ],
  datasets: [{
    label: 'Number of Stocks',
    data: [
      props.distribution.below_minus_15,
      props.distribution.minus_15_to_minus_10,
      props.distribution.minus_10_to_minus_5,
      props.distribution.minus_5_to_minus_2,
      props.distribution.minus_2_to_0,
      props.distribution.exact_0,
      props.distribution.plus_0_to_2,
      props.distribution.plus_2_to_5,
      props.distribution.plus_5_to_10,
      props.distribution.plus_10_to_15,
      props.distribution.above_15
    ],
    backgroundColor: (context) => {
      const value = context.raw
      if (context.dataIndex <= 4) return 'rgba(220, 38, 38, 0.7)' // red-600
      if (context.dataIndex === 5) return 'rgba(75, 85, 99, 0.7)' // gray-600  
      return 'rgba(5, 150, 105, 0.7)' // emerald-600
    },
    borderColor: (context) => {
      const value = context.raw
      if (context.dataIndex <= 4) return 'rgb(220, 38, 38)' // red-600
      if (context.dataIndex === 5) return 'rgb(75, 85, 99)' // gray-600
      return 'rgb(5, 150, 105)' // emerald-600
    },
    borderWidth: 1
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: false
    },
    tooltip: {
      backgroundColor: '#1F2937', // gray-800
      titleColor: '#F9FAFB', // gray-50
      bodyColor: '#F9FAFB', // gray-50
      padding: 12,
      cornerRadius: 4
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(75, 85, 99, 0.2)', // gray-600 with opacity
        drawBorder: false
      },
      ticks: {
        color: '#9CA3AF' // gray-400
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#9CA3AF' // gray-400
      }
    }
  }
}
</script>