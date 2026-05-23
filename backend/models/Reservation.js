const pool = require('../config/db');

const Reservation = {
  async findAll() {
    const { rows } = await pool.query(`
      SELECT r.*, u.username, u.email, u.first_name, u.last_name,
             res.name as resource_name, res.category, res.location
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN resources res ON r.resource_id = res.id
      ORDER BY r.start_time DESC
    `);
    return rows;
  },
  async findByUser(userId) {
    const { rows } = await pool.query(`
      SELECT r.*, res.name as resource_name, res.category, res.location, res.capacity
      FROM reservations r
      JOIN resources res ON r.resource_id = res.id
      WHERE r.user_id=$1
      ORDER BY r.start_time DESC
    `, [userId]);
    return rows;
  },
  async findById(id) {
    const { rows } = await pool.query(`
      SELECT r.*, u.username, u.email, u.first_name, u.last_name,
             res.name as resource_name, res.category, res.location
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN resources res ON r.resource_id = res.id
      WHERE r.id=$1
    `, [id]);
    return rows[0] || null;
  },
  async findByResource(resourceId) {
    const { rows } = await pool.query(`
      SELECT r.*, u.username, u.first_name, u.last_name
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      WHERE r.resource_id=$1 AND r.status='confirmed'
      ORDER BY r.start_time
    `, [resourceId]);
    return rows;
  },
  async create({ user_id, resource_id, start_time, end_time, notes='' }) {
    const { rows } = await pool.query(`
      INSERT INTO reservations (user_id, resource_id, start_time, end_time, notes)
      VALUES ($1,$2,$3,$4,$5) RETURNING *
    `, [user_id, resource_id, start_time, end_time, notes]);
    return rows[0];
  },
  async cancel(id) {
    const { rows } = await pool.query(
      `UPDATE reservations SET status='cancelled' WHERE id=$1 RETURNING *`, [id]
    );
    return rows[0] || null;
  },
  async updateStatus(id, status) {
    const { rows } = await pool.query(
      `UPDATE reservations SET status=$1 WHERE id=$2 RETURNING *`, [status, id]
    );
    return rows[0] || null;
  },
  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM reservations WHERE id=$1', [id]);
    return rowCount > 0;
  },
  async stats() {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status='confirmed') as confirmed,
        COUNT(*) FILTER (WHERE status='cancelled') as cancelled,
        COUNT(*) FILTER (WHERE status='pending') as pending,
        COUNT(*) as total
      FROM reservations
    `);
    return rows[0];
  },
};

module.exports = Reservation;
