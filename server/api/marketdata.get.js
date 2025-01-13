import db from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    // Simple query to get all the data we need
    const query = `
      SELECT
        index_name,
        "date",
        high,
        "close"
      FROM
        public.market_data
      ORDER BY
        index_name,
        "date"
    `
    
    const result = await db.query(query)
    const data = result.rows

    // Group data by index and year
    const groupedData = {}
    data.forEach(row => {
      const date = new Date(row.date)
      const year = date.getFullYear()
      const key = `${row.index_name}_${year}`
      
      if (!groupedData[key]) {
        groupedData[key] = {
          index_name: row.index_name,
          year,
          prices: [],
          dates: [],
          highs: []
        }
      }
      
      groupedData[key].prices.push(parseFloat(row.close))
      groupedData[key].dates.push(date)
      groupedData[key].highs.push(parseFloat(row.high))
    })

    // Calculate stats for each group
    const analyzedData = Object.entries(groupedData).map(([key, group]) => {
      // Find yearly high and its date
      const yearlyHigh = Math.max(...group.highs)
      const peakIndex = group.highs.indexOf(yearlyHigh)
      const peakDate = group.dates[peakIndex]

      // Calculate days below 10% threshold
      const threshold = yearlyHigh * 0.9
      const daysBelow10 = group.prices.filter(price => price <= threshold).length

      // Calculate maximum drawdown and recovery days
      let maxDrawdown = 0
      let maxDrawdownDate = null
      let recoveryDays = null
      let recovered = false

      // Start from peak date
      for (let i = peakIndex; i < group.prices.length; i++) {
        const drawdown = ((yearlyHigh - group.prices[i]) / yearlyHigh) * 100
        
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown
          maxDrawdownDate = group.dates[i]
        }
      }

      // If we found a drawdown, look for recovery
      if (maxDrawdownDate) {
        const maxDrawdownIndex = group.dates.findIndex(d => d.getTime() === maxDrawdownDate.getTime())
        
        // Look for recovery point in same year
        for (let i = maxDrawdownIndex; i < group.prices.length; i++) {
          if (group.prices[i] >= yearlyHigh) {
            recoveryDays = Math.round((group.dates[i] - maxDrawdownDate) / (1000 * 60 * 60 * 24))
            recovered = true
            break
          }
        }

        // If not recovered in same year, look in next year
        if (!recovered) {
          const nextYearKey = `${group.index_name}_${group.year + 1}`
          const nextYearData = groupedData[nextYearKey]
          
          if (nextYearData) {
            for (let i = 0; i < nextYearData.prices.length; i++) {
              if (nextYearData.prices[i] >= yearlyHigh) {
                recoveryDays = Math.round((nextYearData.dates[i] - maxDrawdownDate) / (1000 * 60 * 60 * 24))
                recovered = true
                break
              }
            }
          }
        }

        // If still not recovered, calculate days till end of available data
        if (!recovered) {
          const nextYearKey = `${group.index_name}_${group.year + 1}`
          const nextYearData = groupedData[nextYearKey]
          
          if (nextYearData && nextYearData.dates.length > 0) {
            // If next year data exists, count days till last available date in next year
            recoveryDays = Math.round((nextYearData.dates[nextYearData.dates.length - 1] - maxDrawdownDate) / (1000 * 60 * 60 * 24))
          } else {
            // Otherwise count days till last date in current year
            recoveryDays = Math.round((group.dates[group.dates.length - 1] - maxDrawdownDate) / (1000 * 60 * 60 * 24))
          }
        }
      }

      return {
        index_name: group.index_name,
        year: group.year,
        yearly_high: yearlyHigh,
        days_below_10: daysBelow10,
        max_drawdown: maxDrawdown.toFixed(2),
        recovery_days: recoveryDays || maxDrawdown === 0 ? recoveryDays || 0 : Math.max(1, recoveryDays || 0) // Ensure at least 1 day if there was a drawdown
      }
    })

    // Sort by index name and year
    analyzedData.sort((a, b) => {
      if (a.index_name === b.index_name) {
        return a.year - b.year
      }
      return a.index_name.localeCompare(b.index_name)
    })

    return { success: true, data: analyzedData }
  } catch (error) {
    console.error('Error fetching market data analysis:', error)
    return { success: false, error: 'Failed to fetch market data analysis' }
  }
})


