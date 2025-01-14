import db from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    const query = `
      WITH combined_dates AS (
        SELECT DISTINCT date_captured::date as date_captured 
        FROM bse500_distribution
        UNION
        SELECT DISTINCT date_captured::date as date_captured 
        FROM sectoral_performance
      )
      SELECT date_captured 
      FROM combined_dates 
      ORDER BY date_captured DESC
    `
    
    const result = await db.query(query)
    console.log('Available dates:', result.rows)
    return { success: true, data: result.rows }
  } catch (error) {
    console.error('Error fetching dates:', error)
    return { success: false, error: 'Failed to fetch dates' }
  }
}) 