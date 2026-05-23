const pool = require('../config/db');

const Resource = {
  async findAll() {
    const { rows } = await pool.query('SELECT * FROM resources ORDER BY category, name');
    return rows;
  },
  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM resources WHERE id=$1', [id]);
    return rows[0] || null;
  },
  async create({ name, description, category, capacity, location, available=true }) {
    const { rows } = await pool.query(
      `INSERT INTO resources (name, description, category, capacity, location, available)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, description, category, capacity, location, available]
    );
    return rows[0];
  },
  async update(id, { name, description, category, capacity, location, available }) {
    const { rows } = await pool.query(
      `UPDATE resources SET name=$1, description=$2, category=$3, capacity=$4, location=$5, available=$6
       WHERE id=$7 RETURNING *`,
      [name, description, category, capacity, location, available, id]
    );
    return rows[0] || null;
  },
  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM resources WHERE id=$1', [id]);
    return rowCount > 0;
  },
  async isAvailableForSlot(resourceId, startTime, endTime, excludeId=null) {
    const q = excludeId
      ? `SELECT 1 FROM reservations WHERE resource_id=$1 AND status='confirmed'
         AND tstzrange(start_time,end_time) && tstzrange($2::timestamptz,$3::timestamptz)
         AND id!=$4`
      : `SELECT 1 FROM reservations WHERE resource_id=$1 AND status='confirmed'
         AND tstzrange(start_time,end_time) && tstzrange($2::timestamptz,$3::timestamptz)`;
    const params = excludeId ? [resourceId, startTime, endTime, excludeId] : [resourceId, startTime, endTime];
    const { rowCount } = await pool.query(q, params);
    return rowCount === 0;
  },
};

module.exports = Resource;
