<template>
  <div class="overflow-x-auto">
    <table class="min-w-full table-auto border-collapse">
      <thead>
        <tr class="bg-gray-800">
          <th class="px-4 py-2 text-left">Index Name</th>
          <th class="px-4 py-2 text-left">Year</th>
          <th class="px-4 py-2 text-left">Yearly High</th>
          <th class="px-4 py-2 text-left">Days Below 10%</th>
          <th class="px-4 py-2 text-left">Max Drawdown (%)</th>
          <th class="px-4 py-2 text-left">Recovery Days</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in data" :key="index" class="border-t border-gray-700 hover:bg-gray-800">
          <td class="px-4 py-2">{{ row.index_name }}</td>
          <td class="px-4 py-2">{{ row.year }}</td>
          <td class="px-4 py-2">{{ formatNumber(row.yearly_high) }}</td>
          <td class="px-4 py-2">{{ row.days_below_10 }}</td>
          <td class="px-4 py-2" :class="getDrawdownClass(row.max_drawdown)">
            {{ row.max_drawdown }}%
          </td>
          <td class="px-4 py-2" :class="getRecoveryClass(row.recovery_days)">
            {{ formatRecoveryDays(row.recovery_days) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  }
})

const formatNumber = (value) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2
  }).format(value)
}

const getDrawdownClass = (drawdown) => {
  const dd = parseFloat(drawdown)
  if (dd >= 20) return 'text-red-500'
  if (dd >= 10) return 'text-yellow-500'
  return 'text-green-500'
}

const getRecoveryClass = (days) => {
  const recoveryDays = parseInt(days)
  if (recoveryDays > 180) return 'text-red-500'
  if (recoveryDays > 90) return 'text-yellow-500'
  return 'text-green-500'
}

const formatRecoveryDays = (days) => {
  return `${days} days`
}
</script> 