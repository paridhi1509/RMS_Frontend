const https = require('https');
const data = new URLSearchParams({
    client_id: '859f92c6-d14e-474e-acde-6cc435ffd4c3',
    client_secret: process.env.CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
}).toString();

const options = {
    hostname: 'login.microsoftonline.com',
    port: 443,
    path: '/1ed9671a-0823-49e9-8048-a3bf29e5053e/oauth2/v2.0/token',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (d) => body += d);
    res.on('end', () => {
        try {
            const token = JSON.parse(body).access_token;
            if (!token) return;
            const payload = token.split('.')[1];
            // Fix base64 decoding in node
            const decoded = Buffer.from(payload, 'base64').toString();
            console.log('Payload:', decoded);
        } catch (e) { console.error(e) }
    });
});
req.write(data);
req.end();
