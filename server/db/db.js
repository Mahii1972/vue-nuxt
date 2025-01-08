import pg from 'pg'
const { Pool } = pg

const config = {
  connectionString: process.env.DATABASE_URL,
  rejectUnauthorized: false
}


const db = new Pool(config)

// Test the connection
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err)
  } else {
    console.log('Database connected successfully')
  }
})

export default db 