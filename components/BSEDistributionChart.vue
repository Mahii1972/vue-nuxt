<template>
  <div class="w-full">
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
      if (context.dataIndex <= 4) return 'rgba(239, 68, 68, 0.7)' // red for negative
      if (context.dataIndex === 5) return 'rgba(156, 163, 175, 0.7)' // gray for 0
      return 'rgba(34, 197, 94, 0.7)' // green for positive
    },
    borderColor: (context) => {
      const value = context.raw
      if (context.dataIndex <= 4) return 'rgb(239, 68, 68)' // red for negative
      if (context.dataIndex === 5) return 'rgb(156, 163, 175)' // gray for 0
      return 'rgb(34, 197, 94)' // green for positive
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
      display: true,
      text: 'Advances vs. Declines',
      padding: 20,
      font: {
        size: 16,
        weight: 'bold'
      }
    },
    subtitle: {
      display: true,
      text: 'The distribution of stocks in the given sector / index based on 1D price return',
      padding: {
        bottom: 20
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: false
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}
</script> 