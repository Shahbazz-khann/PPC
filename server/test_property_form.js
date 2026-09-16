require('dotenv').config();
const { getPropertyFormData } = require('./controller/Customer/ProfileReference/profileReference.controller');

async function test() {
  const req = {};
  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      console.log('Status:', this.statusCode);
      if (this.statusCode === 200) {
        const counts = {};
        for (const [k, v] of Object.entries(data.data)) {
          counts[k] = v.length;
        }
        console.log('Counts:', counts);
        
        console.log('\\nSample Response:');
        console.log('countries[0]:', data.data.countries[0]);
        console.log('provinces[0]:', data.data.provinces[0]);
        console.log('divisions[0]:', data.data.divisions[0]);
        console.log('districts[0]:', data.data.districts[0]);
        console.log('tehsils[0]:', data.data.tehsils[0]);
        console.log('propertyUses[0]:', data.data.propertyUses[0]);
        
        console.log('\\nEmpty arrays check:');
        console.log('propertyTypes empty?', Array.isArray(data.data.propertyTypes) && data.data.propertyTypes.length === 0);
        console.log('marlaSizes empty?', Array.isArray(data.data.marlaSizes) && data.data.marlaSizes.length === 0);
        console.log('amenities empty?', Array.isArray(data.data.amenities) && data.data.amenities.length === 0);
      } else {
        console.error('Failed:', data);
      }
    }
  };
  const next = (err) => {
    console.error('Next called with error:', err);
  };

  await getPropertyFormData(req, res, next);
  
  // Close pool so script exits
  const { pool } = require('./config/db');
  pool.end();
}

test();
