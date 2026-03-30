const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

(async () => {
    try {
        const params = new URLSearchParams();
        params.append('client_id', process.env.CLIENT_ID);
        params.append('client_secret', process.env.CLIENT_SECRET);
        params.append('scope', 'https://graph.microsoft.com/.default');
        params.append('grant_type', 'client_credentials');

        const tokenUrl = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`;
        const { data: tokenData } = await axios.post(tokenUrl, params);
        const token = tokenData.access_token;
        
        console.log("Token acquired successfully!");

        const userId = process.env.USER_ID;
        console.log(`Testing Graph API for user: ${userId}`);
        
        const graphUrl = `https://graph.microsoft.com/v1.0/users/${userId}/events`;
        
        const payload = {
            subject: "Test API Meeting",
            start: { dateTime: new Date().toISOString(), timeZone: "UTC" },
            end: { dateTime: new Date(Date.now() + 3600000).toISOString(), timeZone: "UTC" },
            isOnlineMeeting: true,
            onlineMeetingProvider: "teamsForBusiness"
        };

        const { data: meetingData } = await axios.post(graphUrl, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Meeting created successfully:", meetingData.id);
    } catch (error) {
        console.log("Graph API Error:");
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.log(error.message);
        }
    }
})();
