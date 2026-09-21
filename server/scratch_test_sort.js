const { Client } = require('pg');

async function test() {
  const client = new Client({
    // Using fake connection just to parse local if needed, or I'll just rely on facts.
  });
  console.log("Postgres DESC puts NULLS FIRST by default. ASC puts NULLS LAST by default.");
}
test();
