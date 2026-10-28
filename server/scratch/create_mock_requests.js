const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./admin_requests_initial.json', 'utf8'));

const content = `/**
 * Mock & Initial Reference Data for Admin Customer Requests
 * Sourced directly from PostgreSQL database.
 */

export const REQUEST_STATUSES = [
  'Pending',
  'Under Review',
  'Assigned',
  'In Progress',
  'Completed',
  'Rejected',
  'Withdrawn',
];

export const INITIAL_REQUESTS = ${JSON.stringify(data, null, 2)};
`;

fs.writeFileSync('../client/src/Pages/Admin/requests/mockAdminRequests.js', content);
console.log('Successfully wrote mockAdminRequests.js with', data.length, 'records');
