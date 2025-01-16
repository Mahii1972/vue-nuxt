import db from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    const query = `
      SELECT
        index_name,
        "date" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata' as date,
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
    const indexData = {} // Store all data by index for cross-year analysis
    
    data.forEach(row => {
      // Convert UTC date to local timezone by explicitly constructing with date string
      const date = new Date(row.date.toLocaleString())
      const year = date.getFullYear()
      const key = `${row.index_name}_${year}`
      
      // Store in year-based groups
      if (!groupedData[key]) {
        groupedData[key] = {
          index_name: row.index_name,
          year,
          prices: [],
          dates: [],
          highs: []
        }
      }
      
      groupedData[key].prices.push(parseFloat(row.high))
      groupedData[key].dates.push(date)
      groupedData[key].highs.push(parseFloat(row.high))

      // Store in index-based groups for cross-year analysis
      if (!indexData[row.index_name]) {
        indexData[row.index_name] = {
          prices: [],
          dates: [],
          highs: []
        }
      }
      indexData[row.index_name].prices.push(parseFloat(row.high))
      indexData[row.index_name].dates.push(date)
      indexData[row.index_name].highs.push(parseFloat(row.high))
    })

    // Calculate stats for each group
    const analyzedData = Object.entries(groupedData).map(([key, group]) => {
      const [indexName, yearStr] = key.split('_')
      const year = parseInt(yearStr)
      
      // Find yearly high and its date
      const yearlyHigh = Math.max(...group.highs)
      const highIndex = group.highs.indexOf(yearlyHigh)
      const highDate = group.dates[highIndex]

      // Track all instances of 10% falls using cross-year data
      const threshold = yearlyHigh * 0.9
      let fallInstances = []
      let currentFall = null

      // Find the starting index in the full index data that matches our high date
      const fullIndexData = indexData[indexName]
      // Use getTime() for comparison after ensuring both dates are in local timezone
      const fullHighIndex = fullIndexData.dates.findIndex(d => 
        d.toLocaleString().split(',')[0] === highDate.toLocaleString().split(',')[0]
      )

      // Look for all instances of 10% falls after ATH in current and future years
      for (let i = fullHighIndex; i < fullIndexData.prices.length; i++) {
        const currentDate = fullIndexData.dates[i]
        if (fullIndexData.prices[i] <= threshold) {
          if (!currentFall) {
            // Start of a new fall
            currentFall = {
              startDate: new Date(highDate.toLocaleString()),
              endDate: new Date(currentDate.toLocaleString()),
              days: Math.round((currentDate - highDate) / (1000 * 60 * 60 * 24)),
              breachValue: fullIndexData.prices[i]
            }
            fallInstances.push(currentFall)
          }
        } else {
          currentFall = null
        }
      }

      // Use the first instance for the main metrics
      const firstFall = fallInstances[0] || { days: 0, startDate: null, endDate: null, breachValue: null }
      
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
          maxDrawdownDate = new Date(group.dates[i].toLocaleString())
        }
      }

      // If we found a drawdown, look for recovery
      if (maxDrawdownDate) {
        const maxDrawdownIndex = group.dates.findIndex(d => 
          d.toLocaleString().split(',')[0] === maxDrawdownDate.toLocaleString().split(',')[0]
        )
        
        // Look for recovery point (100% of yearly high)
        for (let i = maxDrawdownIndex; i < fullIndexData.prices.length; i++) {
          const currentDate = fullIndexData.dates[i]
          // Only look for recovery in current or future years AND after drawdown date
          if (currentDate > maxDrawdownDate && currentDate.getFullYear() >= year && fullIndexData.prices[i] >= yearlyHigh) {
            recoveryDays = Math.round((currentDate - maxDrawdownDate) / (1000 * 60 * 60 * 24))
            recoveryDate = currentDate
            break
          }
        }

        // If no recovery found, use last available date of the same or future years
        if (!recoveryDate) {
          const lastValidDate = fullIndexData.dates.find(d => d.getFullYear() >= year && d > maxDrawdownDate)
          if (lastValidDate) {
            recoveryDate = lastValidDate
            recoveryDays = Math.round((recoveryDate - maxDrawdownDate) / (1000 * 60 * 60 * 24))
          } else {
            recoveryDays = 0
            recoveryDate = null
          }
        }
      }

      // Calculate recovery from 10% breach
      let recovery10Days = 0
      let recovery10Date = null
      
      if (firstFall.endDate) {
        // Look for recovery point from 10% breach
        const breachIndex = fullIndexData.dates.findIndex(d => 
          d.toLocaleString().split(',')[0] === firstFall.endDate.toLocaleString().split(',')[0]
        )
        
        for (let i = breachIndex; i < fullIndexData.prices.length; i++) {
          const currentDate = fullIndexData.dates[i]
          // Only look for recovery in current or future years AND after breach date
          if (currentDate > firstFall.endDate && currentDate.getFullYear() >= year && fullIndexData.prices[i] >= yearlyHigh) {
            recovery10Days = Math.round((currentDate - firstFall.endDate) / (1000 * 60 * 60 * 24))
            recovery10Date = currentDate
            break
          }
        }

        // If no recovery found, use last available date of the same or future years
        if (!recovery10Date && breachIndex !== -1) {
          const lastValidDate = fullIndexData.dates.find(d => d.getFullYear() >= year && d > firstFall.endDate)
          if (lastValidDate) {
            recovery10Date = lastValidDate
            recovery10Days = Math.round((recovery10Date - firstFall.endDate) / (1000 * 60 * 60 * 24))
          } else {
            recovery10Days = 0
            recovery10Date = null
          }
        }
      }

      return {
        index_name: group.index_name,
        year: group.year,
        yearly_high: yearlyHigh,
        days_to_fall_10: firstFall.days,
        fall_start_date: firstFall.startDate,
        fall_end_date: firstFall.endDate,
        breach_value: firstFall.breachValue,
        fall_instances: fallInstances,
        max_drawdown: maxDrawdown.toFixed(2),
        recovery_days: recoveryDays || 0,
        drawdown_date: maxDrawdownDate,
        recovery_date: recoveryDate,
        recovery_10_days: recovery10Days,
        recovery_10_date: recovery10Date
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