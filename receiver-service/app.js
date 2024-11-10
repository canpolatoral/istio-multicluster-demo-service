// account/app.js

const express = require('express');
const app = express();

const serviceName = process.env.SERVICE_NAME || 'receiver-service';
const version = process.env.VERSION || 'v1';

app.get('/', (req, res) => {
  res.json({ service: serviceName, version: version });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`${serviceName} service running on port ${port}`);
});
