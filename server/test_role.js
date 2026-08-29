require('dotenv').config(); const { findRoleByName } = require('./models/roles/role.model.js'); findRoleByName('User').then(r => { console.log('Role:', r); process.exit(0); }).catch(console.error);
