require('dotenv').config();
const {pool} = require('../config/db');
pool.query("DELETE FROM tehsils WHERE tehsil_english LIKE '__Test%' OR tehsil_english LIKE '__Stable%' OR tehsil_english LIKE '__Reg%' OR tehsil_english LIKE '__Ov%' OR tehsil_english LIKE 'Ghost' OR tehsil_english LIKE '__FKTest%'")
  .then(res => { console.log('Cleaned up', res.rowCount); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
