// account/app.js

const express = require('express');
const app = express();

const serviceName = process.env.SERVICE_NAME || 'receiver-service';
const version = process.env.VERSION || 'v1';
const errorEnabled = process.env.ERROR_ENABLED || false;
const errorCode = process.env.ERROR_CODE || 200;
const errorMessage = process.env.ERROR_MESSAGE || 'Error message';

app.get('/test', (req, res) => {
  if (errorEnabled) {

    res.status(errorCode).json({ error: errorMessage, service: serviceName, version: version  });

  } else {

    res.json({ service: serviceName, version: version });

  }
});

app.get('/', (req, res) => {
  res.json({ service: serviceName, version: version });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`${serviceName} service running on port ${port}`);
});
