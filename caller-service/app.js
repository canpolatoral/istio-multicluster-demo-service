// transfer/app.js

import express from 'express';
import axios from 'axios';
import * as AxiosLogger from 'axios-logger';
import morgan from 'morgan';

const app = express();

app.use(morgan('combined', {skip: (req, res) => req.url === '/health'}))

const axiosInstance = axios.create();
axiosInstance.interceptors.request.use(AxiosLogger.requestLogger);
axiosInstance.interceptors.response.use(AxiosLogger.responseLogger);

AxiosLogger.setGlobalConfig({
  headers: true
});

// const requestResponseLogEnabled = process.env.REQUEST_RESPONSE_LOG_ENABLED || true;

const serviceName = process.env.SERVICE_NAME || 'caller-service';
const version = process.env.VERSION || 'v1';
const targetServiceUrl = process.env.TARGET_SERVICE_URL || 'http://localhost:3000';

const errorEnabled = process.env.ERROR_ENABLED || false;
const errorCode = process.env.ERROR_CODE || 200;
const errorMessage = process.env.ERROR_MESSAGE || 'Error message';

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

    res.status(errorCode).json({ error: { errorCode: errorCode, errorMessage: errorMessage }, service: serviceName, version: version  });

  } else {

    var authResponse;

    if (clientCredentialsAuthEnabled) {
  
      try {
        const data = new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        });
        
        authResponse = await axiosInstance
          .post(jwtAuthUrl, data.toString(), {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
      } catch (error) {
        res.status(200).json({ error: `Authentication failed`, errorDetail: error });
        return
      }
    }

    try {

      var targetServiceResponse;

      if (clientCredentialsAuthEnabled) {

        targetServiceResponse = await axiosInstance.get(targetServiceUrl + '/test', {
          headers: {
            Authorization: `Bearer ${authResponse.data.access_token}`,
          },
        });  
      } else {

        targetServiceResponse = await axiosInstance.get(targetServiceUrl + '/test');  
      }
      
      res.json({
        service: serviceName,
        version: version,
        accountResponse: targetServiceResponse.data
      });
    } catch (error) {
      res.status(200).json({ error: `Error connecting to ${serviceName}`, errorDetail: error });
    }

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