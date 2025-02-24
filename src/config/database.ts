
import { Pool } from 'pg';

export const pool = new Pool({
  user: process.env.VITE_DB_USER,
  host: process.env.VITE_DB_HOST,
  database: process.env.VITE_DB_NAME,
  password: process.env.VITE_DB_PASSWORD,
  port: Number(process.env.VITE_DB_PORT) || 5432,
  ssl: process.env.VITE_DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : undefined
});

// Função helper para executar queries
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executada', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Erro na query', { text, error });
    throw error;
  }
}
