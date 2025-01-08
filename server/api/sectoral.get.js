import db from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    const query = `
      SELECT date_captured, duration, sector, market_cap_change 
      FROM sectoral_performance 
      ORDER BY date_captured DESC, duration, sector
    `
    
    const result = await db.query(query)
    
    // Group data by duration
    const groupedData = result.rows.reduce((acc, row) => {
      if (!acc[row.duration]) {
        acc[row.duration] = []
      }
      acc[row.duration].push(row)
      return acc
    }, {})
    
    return { success: true, data: groupedData }
  } catch (error) {
    console.error('Error fetching sectoral data:', error)
    return { success: false, error: 'Failed to fetch sectoral data' }
  }
}) 