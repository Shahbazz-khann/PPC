require('dotenv').config();
const { pool } = require('../config/db');

async function seedCurrencies() {
  try {
    console.log('Seeding currencies into PostgreSQL...');

    // 1. Update PKR
    await pool.query(`
      UPDATE currencies 
      SET currency_urdu = 'پاکستانی روپیہ', currency_symbol = 'Rs'
      WHERE currency_code = 'PKR';
    `);

    // 2. Insert standard currencies if not exists
    const list = [
      { en: 'US Dollar', ur: 'امریکی ڈالر', code: 'USD', symbol: '$' },
      { en: 'Euro', ur: 'یورو', code: 'EUR', symbol: '€' },
      { en: 'British Pound', ur: 'برطانوی پاؤنڈ', code: 'GBP', symbol: '£' },
      { en: 'UAE Dirham', ur: 'متحدہ عرب امارات درہم', code: 'AED', symbol: 'د.إ' },
      { en: 'Saudi Riyal', ur: 'سعودی ریال', code: 'SAR', symbol: '﷼' },
      { en: 'Canadian Dollar', ur: 'کینیڈین ڈالر', code: 'CAD', symbol: 'C$' },
      { en: 'Australian Dollar', ur: 'آسٹریلین ڈالر', code: 'AUD', symbol: 'A$' },
      { en: 'Omani Rial', ur: 'عمانی ریال', code: 'OMR', symbol: 'ر.ع.' },
      { en: 'Qatari Riyal', ur: 'قطری ریال', code: 'QAR', symbol: 'ر.ق' }
    ];

    for (const item of list) {
      await pool.query(`
        INSERT INTO currencies (currency_english, currency_urdu, currency_code, currency_symbol, is_active)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT DO NOTHING;
      `, [item.en, item.ur, item.code, item.symbol]);
    }

    const check = await pool.query(`SELECT currency_id, currency_english, currency_code, currency_symbol, is_active FROM currencies ORDER BY currency_id;`);
    console.log('Total currencies now in DB:', check.rows.length);
    console.log(check.rows);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding currencies:', err);
    process.exit(1);
  }
}

seedCurrencies();
