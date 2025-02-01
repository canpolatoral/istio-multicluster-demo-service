// transfer/app.js

import express from 'express';
import axios from 'axios';
import * as AxiosLogger from 'axios-logger';
import morgan from 'morgan';

const app = express();

app.use(
  morgan('combined', {
    skip: (req, res) => req.url === '/health',
  })
);

const axiosInstance = axios.create();
axiosInstance.interceptors.request.use(AxiosLogger.requestLogger);
axiosInstance.interceptors.response.use(AxiosLogger.responseLogger);

AxiosLogger.setGlobalConfig({
  headers: true,
});

const serviceName = process.env.SERVICE_NAME || 'caller-service';
const version = process.env.VERSION || 'v1';

// Get target URLs from environment variables.
// TARGET_SERVICE_URLS is expected to be a comma-separated string.
const targetServiceUrl = process.env.TARGET_SERVICE_URL || null; // 'http://localhost:3000'
const targetServiceUrls = process.env.TARGET_SERVICE_URLS
  ? process.env.TARGET_SERVICE_URLS.split(',')
      .map((url) => url.trim())
      .filter((url) => url)
  : [];  // ['http://localhost:3000','http://localhost:3000']

// Error handling configuration
const errorEnabled = process.env.ERROR_ENABLED || false;
const errorCode = process.env.ERROR_CODE || 200;
const errorMessage = process.env.ERROR_MESSAGE || 'Error message';

// Client credentials authentication configuration
const clientCredentialsAuthEnabled = process.env.CLIENT_CREDENTIALS_AUTH_ENABLED || false;
const jwtAuthUrl = process.env.JWT_AUTH_URL;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

///// for test only
// const clientCredentialsAuthEnabled = true;
// const clientId = 'test-client-id';
// const clientSecret = 'test-secret';
// const jwtAuthUrl = 'http://172.18.0.10/realms/test/protocol/openid-connect/token';
//////////

app.get('/test', async (req, res) => {
  if (errorEnabled) {
    res.status(errorCode).json({
      error: { errorCode: errorCode, errorMessage: errorMessage },
      service: serviceName,
      version: version,
    });
    return;
  }

  let authResponse;
  if (clientCredentialsAuthEnabled) {
    try {
      const data = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      });

      authResponse = await axiosInstance.post(jwtAuthUrl, data.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    } catch (error) {
      res
        .status(200)
        .json({ error: `Authentication failed`, errorDetail: error });
      return;
    }
  }

  // Determine which target URL(s) to use.
  // Use the array if provided; otherwise fall back to the single URL.
  let targetUrls = [];
  if (targetServiceUrls && targetServiceUrls.length > 0) {
    targetUrls = targetServiceUrls;
  } else if (targetServiceUrl) {
    targetUrls = [targetServiceUrl];
  } else {
    res.status(400).json({ error: 'No target service URL provided.' });
    return;
  }

  const targetServiceResponses = [];

  try {
    // Iterate over the target URLs sequentially.
    for (const url of targetUrls) {
      // Ensure the endpoint URL ends with "/test"
      const endpoint = url.endsWith('/')
        ? `${url.slice(0, -1)}/test`
        : `${url}/test`;

      let targetServiceResponse;
      if (clientCredentialsAuthEnabled) {
        targetServiceResponse = await axiosInstance.get(endpoint, {
          headers: {
            Authorization: `Bearer ${authResponse.data.access_token}`,
          },
        });
      } else {
        targetServiceResponse = await axiosInstance.get(endpoint);
      }
      targetServiceResponses.push(targetServiceResponse.data);
    }

    res.json({
      service: serviceName,
      version: version,
      targetServiceResponses: targetServiceResponses,
    });
  } catch (error) {
    res
      .status(200)
      .json({ error: `Error connecting to target service`, errorDetail: error });
  }
});

app.get('/', (req, res) => {
  res.json({ service: serviceName, version: version });
});

app.get('/health', (req, res) => {
  res.json({ service: serviceName, version: version });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`${serviceName} service running on port ${port}`);
});
