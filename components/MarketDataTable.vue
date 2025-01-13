<template>
  <div class="space-y-4">
    <!-- Index Filter -->
    <div class="flex items-center space-x-6 bg-gray-800 p-4 rounded-lg">
      <span class="text-sm font-medium">Filter by Index:</span>
      <div class="flex flex-wrap gap-4">
        <label v-for="index in uniqueIndices" :key="index" class="inline-flex items-center">
          <input
            type="radio"
            :value="index"
            v-model="selectedIndex"
            class="form-radio h-4 w-4 text-blue-600 bg-gray-700 border-gray-600"
          >
          <span class="ml-2 text-sm">{{ index }}</span>
        </label>
        <label class="inline-flex items-center">
          <input
            type="radio"
            value=""
            v-model="selectedIndex"
            class="form-radio h-4 w-4 text-blue-600 bg-gray-700 border-gray-600"
          >
          <span class="ml-2 text-sm">All</span>
        </label>
      </div>
    </div>

    <!-- Table -->
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
          <tr v-for="(row, index) in filteredData" :key="index" class="border-t border-gray-700 hover:bg-gray-800">
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  }
})

const selectedIndex = ref('')

const uniqueIndices = computed(() => {
  return [...new Set(props.data.map(item => item.index_name))].sort()
})

const filteredData = computed(() => {
  if (!selectedIndex.value) return props.data
  return props.data.filter(item => item.index_name === selectedIndex.value)
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

<style scoped>
.form-radio {
  appearance: none;
  padding: 0;
  print-color-adjust: exact;
  display: inline-block;
  vertical-align: middle;
  background-origin: border-box;
  user-select: none;
  flex-shrink: 0;
  border-radius: 100%;
  border-width: 2px;
}

.form-radio:checked {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e");
  border-color: transparent;
  background-color: currentColor;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.form-radio:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}
</style> 