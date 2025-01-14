import db from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const date = body.date
    
    if (!date) {
      return { 
        success: false, 
        error: 'Date parameter is required' 
      }
    }

    console.log('Raw date received by sectoral endpoint:', date)
    const query = `
      SELECT duration, sector, market_cap_change 
      FROM sectoral_performance
      WHERE date_captured::date = $1::date
      ORDER BY sector, duration
    `
    
    const result = await db.query(query, [date])
    console.log('Sectoral query params:', date)
    console.log('Sectoral query result count:', result.rows.length)
    
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