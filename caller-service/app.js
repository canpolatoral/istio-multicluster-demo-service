// transfer/app.js

const express = require('express');
const axios = require('axios');
const app = express();

const serviceName = process.env.SERVICE_NAME || 'caller-service';
const version = process.env.VERSION || 'v1';
const targetServiceUrl = process.env.TARGET_SERVICE_URL || 'http://localhost:3000';

app.get('/', async (req, res) => {
  try {
    const targetServiceResponse = await axios.get(targetServiceUrl);
    res.json({
      service: serviceName,
      version: version,
      accountResponse: targetServiceResponse.data
    });
  } catch (error) {
    res.status(500).json({ error: 'Error connecting to account service' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`${serviceName} service running on port ${port}`);
});
