// transfer/app.js

const express = require('express');
const axios = require('axios');
const app = express();

const serviceName = process.env.SERVICE_NAME || 'caller-service';
const version = process.env.VERSION || 'v1';
const targetServiceUrl = process.env.TARGET_SERVICE_URL || 'http://localhost:3000';
const errorEnabled = process.env.ERROR_ENABLED || false;
const errorCode = process.env.ERROR_CODE || 200;
const errorMessage = process.env.ERROR_MESSAGE || 'Error message';


app.get('/test', async (req, res) => {

  if (errorEnabled) {

    res.status(errorCode).json({ error: errorMessage, service: serviceName, version: version  });

  } else {

    try {
      const targetServiceResponse = await axios.get(targetServiceUrl + '/test');
      res.json({
        service: serviceName,
        version: version,
        accountResponse: targetServiceResponse.data
      });
    } catch (error) {
      res.status(200).json({ error: `Error connecting to ${serviceName}` });
    }

  }
  
});

app.get('/', (req, res) => {
  res.json({ service: serviceName, version: version });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`${serviceName} service running on port ${port}`);
});
