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

    console.log('Raw date received by BSE500 endpoint:', date)
    const query = `
      SELECT * FROM bse500_distribution 
      WHERE date_captured::date = $1::date
    `
    
    const result = await db.query(query, [date])
    console.log('BSE500 query params:', date)
    console.log('BSE500 query result count:', result.rows.length)
    return { success: true, data: result.rows }
  } catch (error) {
    console.error('Error fetching BSE 500 distribution:', error)
    return { success: false, error: 'Failed to fetch BSE 500 distribution' }
  }
}) 