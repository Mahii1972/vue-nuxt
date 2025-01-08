import db from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    const query = `
      SELECT * FROM bse500_distribution 
      ORDER BY date_captured DESC
    `
    
    const result = await db.query(query)
    return { success: true, data: result.rows }
  } catch (error) {
    console.error('Error fetching BSE 500 distribution:', error)
    return { success: false, error: 'Failed to fetch BSE 500 distribution' }
  }
}) 