const http = require('http');

const adminEmail = '2412473@szabist-isb.pk';
const adminPass = 'Admin123@';

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
}

async function run() {
  try {
    const loginData = { email: adminEmail, password: adminPass };
    const loginOpts = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    const loginRes = await makeRequest(loginOpts, loginData);
    const report = {
      loginTestResult: loginRes.status === 200 ? "Success" : "Failed",
    };

    if (loginRes.status === 200 && loginRes.data.token) {
      const decodedJwt = parseJwt(loginRes.data.token);
      report.authenticatedUserType = decodedJwt.user_type || null;
      report.authenticatedRoles = decodedJwt.roles || null;

      const meOpts = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/auth/me',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + loginRes.data.token
        }
      };

      const meRes = await makeRequest(meOpts);
      if (meRes.status === 200 && meRes.data.success) {
        report.authMeResultSummary = {
          user_first_name: meRes.data.data.user_first_name,
          user_last_name: meRes.data.data.user_last_name,
          email: meRes.data.data.email,
          user_type_english: meRes.data.data.user_type_english
        };
      } else {
        report.authMeResultSummary = "Failed";
      }
    }

    const fs = require('fs');
    fs.writeFileSync('login_report.json', JSON.stringify(report, null, 2));
    console.log("Wrote login_report.json");

  } catch (err) {
    console.error("Test failed:", err);
  }
}

run();
