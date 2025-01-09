import db from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    const query = `
      WITH latest_date AS (
        SELECT MAX(date_captured) as date_captured 
        FROM sectoral_performance
      )
      SELECT duration, sector, market_cap_change 
      FROM sectoral_performance sp
      JOIN latest_date ld ON sp.date_captured = ld.date_captured
      ORDER BY sector, duration
    `
    
    const result = await db.query(query)
    
    // Transform data to group by sector with durations as properties
    const sectorData = result.rows.reduce((acc, row) => {
      if (!acc[row.sector]) {
        acc[row.sector] = {}
      }
      acc[row.sector][row.duration] = row.market_cap_change
      return acc
    }, {})
    
    return { success: true, data: sectorData }
  } catch (error) {
    console.error('Error fetching sectoral data:', error)
    return { success: false, error: 'Failed to fetch sectoral data' }
  }
})