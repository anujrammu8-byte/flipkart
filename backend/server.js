const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

const pool = new Pool({
  connectionString: 'postgresql://postgres.drwbdniphkmodudjhbsp:2DoxM2DMV5PT6EuL@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

app.use(cors({
  origin: 'https://frontend-snowy-ten-28.vercel.app',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create tables if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS addresses (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    number TEXT NOT NULL,
    pin TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    flat TEXT NOT NULL,
    area TEXT NOT NULL
  )
`).then(() => console.log('Table ready'))
  .catch(err => console.error('Table init error:', err.message));

pool.query(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
`).then(async () => {
  await pool.query(`INSERT INTO settings (key, value) VALUES ('upi_id', 'yourname@upi') ON CONFLICT (key) DO NOTHING`);
  console.log('Settings table ready');
}).catch(err => console.error('Settings init error:', err.message));

pool.query(`
  CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    mrp INTEGER NOT NULL,
    selling_price INTEGER NOT NULL,
    wow_price INTEGER NOT NULL,
    discount INTEGER NOT NULL,
    slider_images TEXT DEFAULT '[]'
  )
`).then(async () => {
  await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS slider_images TEXT DEFAULT '[]'");
  await pool.query("UPDATE products SET slider_images = json_build_array(image_url)::text WHERE slider_images = '[]'");
  console.log('Products table ready');
}).catch(err => console.error('Products init error:', err.message));

// Public - get all dynamic products
app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json({ success: true, products: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Admin - add product
app.post('/admin/products', async (req, res) => {
  if (req.query.password !== 'pass') return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { name, image_url, mrp, selling_price, wow_price, discount, slider_images } = req.body;
  if (!name || !image_url || !mrp || !selling_price || !wow_price || !discount)
    return res.status(400).json({ success: false, message: 'All fields required' });
  try {
    const result = await pool.query(
      'INSERT INTO products (name, image_url, mrp, selling_price, wow_price, discount, slider_images) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [name, image_url, mrp, selling_price, wow_price, discount, JSON.stringify(slider_images || [image_url])]
    );
    res.json({ success: true, product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Admin - delete product
app.delete('/admin/products/:id', async (req, res) => {
  if (req.query.password !== 'pass') return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Public - get all dynamic products
app.get('/get-upi', async (req, res) => {
  try {
    const result = await pool.query(`SELECT value FROM settings WHERE key = 'upi_id'`);
    res.json({ success: true, upi_id: result.rows[0]?.value || '' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Admin - update UPI ID
app.post('/admin/update-upi', async (req, res) => {
  if (req.query.password !== 'pass') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const { upi_id } = req.body;
  if (!upi_id) return res.status(400).json({ success: false, message: 'UPI ID required' });
  try {
    await pool.query(`INSERT INTO settings (key, value) VALUES ('upi_id', $1) ON CONFLICT (key) DO UPDATE SET value = $1`, [upi_id]);
    res.json({ success: true, message: 'UPI ID updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Save address
app.post('/save-address', async (req, res) => {
  const { name, number, pin, city, state, flat, area } = req.body;

  if (!name || !number || !pin || !city || !state || !flat || !area) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    await pool.query(
      'INSERT INTO addresses (name, number, pin, city, state, flat, area) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [name, number, pin, city, state, flat, area]
    );
    res.json({ success: true, message: 'Address saved successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Admin - get all addresses
app.get('/admin/addresses', async (req, res) => {
  if (req.query.password !== 'pass') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const result = await pool.query('SELECT * FROM addresses ORDER BY created_at DESC');
    const addresses = result.rows.map(r => ({
      ...r,
      timestamp: new Date(r.created_at).toLocaleString('en-IN')
    }));
    res.json({ success: true, addresses });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Admin - delete address
app.delete('/admin/addresses/:id', async (req, res) => {
  if (req.query.password !== 'pass') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    await pool.query('DELETE FROM addresses WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
