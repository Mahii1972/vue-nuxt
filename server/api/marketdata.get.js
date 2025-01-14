import db from '../db/db'

export default defineEventHandler(async (event) => {
  try {
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
      const highIndex = group.highs.indexOf(yearlyHigh)
      const highDate = group.dates[highIndex]

      // Calculate threshold and breach periods
      const threshold = yearlyHigh * 0.9
      let daysBelow10 = 0
      let breachStartDate = null
      let breachEndDate = null
      let consecutiveDays = 0
      let tempStartDate = null

      // Function to check if a date is a trading day
      const isConsecutiveDay = (date1, date2) => {
        const diffTime = Math.abs(date2 - date1)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 3 // Allow for weekends and single holidays
      }

      // Process data for current year
      for (let i = 0; i < group.prices.length; i++) {
        const price = group.prices[i]
        const date = group.dates[i]

        if (price <= threshold) {
          if (!tempStartDate) {
            tempStartDate = date
            consecutiveDays = 1
          } else if (isConsecutiveDay(group.dates[i-1], date)) {
            consecutiveDays++
          } else {
            // Reset if not consecutive
            tempStartDate = date
            consecutiveDays = 1
          }

          // If we have 5 consecutive days below threshold, consider it a breach
          if (consecutiveDays >= 5 && !breachStartDate) {
            breachStartDate = tempStartDate
          }
        } else {
          if (breachStartDate && !breachEndDate) {
            breachEndDate = date
            // Calculate days in breach period
            const breachDays = Math.round((breachEndDate - breachStartDate) / (1000 * 60 * 60 * 24))
            daysBelow10 = breachDays
          }
          tempStartDate = null
          consecutiveDays = 0
        }
      }

      // If breach started but didn't end, use last available date
      if (breachStartDate && !breachEndDate) {
        breachEndDate = group.dates[group.dates.length - 1]
        daysBelow10 = Math.round((breachEndDate - breachStartDate) / (1000 * 60 * 60 * 24))
      }

      // Calculate max drawdown and recovery
      let maxDrawdown = 0
      let maxDrawdownDate = null
      let recoveryDays = null
      let recoveryDate = null

      // Find maximum drawdown
      for (let i = 0; i < group.prices.length; i++) {
        const drawdown = ((yearlyHigh - group.prices[i]) / yearlyHigh) * 100
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown
          maxDrawdownDate = group.dates[i]
        }
      }

      // If we found a drawdown, look for recovery
      if (maxDrawdownDate) {
        const maxDrawdownIndex = group.dates.findIndex(d => d.getTime() === maxDrawdownDate.getTime())
        
        // Look for recovery point
        for (let i = maxDrawdownIndex; i < group.prices.length; i++) {
          if (group.prices[i] >= yearlyHigh * 0.95) { // Consider 95% of high as recovery
            recoveryDays = Math.round((group.dates[i] - maxDrawdownDate) / (1000 * 60 * 60 * 24))
            recoveryDate = group.dates[i]
            break
          }
        }

        // If no recovery found, use last available date
        if (!recoveryDate) {
          recoveryDate = group.dates[group.dates.length - 1]
          recoveryDays = Math.round((recoveryDate - maxDrawdownDate) / (1000 * 60 * 60 * 24))
        }
      }

      return {
        index_name: group.index_name,
        year: group.year,
        yearly_high: yearlyHigh,
        days_below_10: daysBelow10,
        breach_date: breachStartDate,
        breach_end_date: breachEndDate,
        max_drawdown: maxDrawdown.toFixed(2),
        recovery_days: recoveryDays || 0,
        drawdown_date: maxDrawdownDate,
        recovery_date: recoveryDate
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