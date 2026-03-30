const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

async function testParam() {
  const token = process.env.APYHUB_API_KEY;
  if (!token) throw new Error("No token");

  // Create a dummy resume text file
  fs.writeFileSync('dummy.txt', 'John Doe\njohn.doe@example.com\n+1 555 123 4567\nExperience:\n5 years at Google as Software Engineer\nEducation:\nBachelor of Science in Computer Science from MIT\nSkills: JavaScript, Node.js, Angular, TypeScript');

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream('dummy.txt'));

    console.log("Submitting job...");
    const submitRes = await axios.post('https://api.apyhub.com/sharpapi/api/v1/hr/parse_resume', formData, {
      headers: {
        ...formData.getHeaders(),
        'apy-token': token
      }
    });

    const statusUrl = submitRes.data.status_url;
    console.log("Status URL: ", statusUrl);
    
    const parts = statusUrl.split('/');
    const jobId = parts[parts.length - 1];
    const pollUrl = `https://api.apyhub.com/sharpapi/api/v1/hr/parse_resume/job/status/${jobId}`;

    let result = null;
    for(let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000));
        console.log("Polling...");
        const res = await axios.get(pollUrl, { headers: { 'apy-token': token } });
        if (res.data.data?.attributes?.status === 'success') {
            result = res.data.data.attributes.result;
            break;
        }
    }
    
    console.log("FINAL PARSED RESULT:");
    console.log(JSON.stringify(result, null, 2));

  } catch(err) {
    if (err.response) {
      console.error(err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

testParam();
