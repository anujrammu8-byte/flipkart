const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.drwbdniphkmodudjhbsp:2DoxM2DMV5PT6EuL@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');
    console.log('✅ Database connected successfully!');
    console.log('🕐 Server time:', result.rows[0].current_time);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
