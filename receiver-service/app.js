// account/app.js
import express from 'express';
import morgan from 'morgan';

const app = express();

app.use(morgan('combined', {skip: (req, res) => req.url === '/health'}))

const serviceName = process.env.SERVICE_NAME || 'receiver-service';
const version = process.env.VERSION || 'v1';
const errorEnabled = process.env.ERROR_ENABLED || false;
const errorCode = process.env.ERROR_CODE || 200;
const errorMessage = process.env.ERROR_MESSAGE || 'Error message';

app.get('/test', (req, res) => {
  if (errorEnabled) {

    res.status(errorCode).json({ error: { errorCode: errorCode, errorMessage: errorMessage }, service: serviceName, version: version  });

  } else {

    res.json({ service: serviceName, version: version });

  }
});

app.get('/', (req, res) => {
  res.json({ service: serviceName, version: version });
});

app.get('/health', (req, res) => {
  res.json({ service: serviceName, version: version });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`${serviceName} service running on port ${port}`);
});
