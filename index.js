import express from 'express';
import fetch from 'node-fetch';
import https from 'https';

const app = express();
const PORT = 8080;

app.use(express.json());

const agent = new https.Agent({
  rejectUnauthorized: false
});

app.all('*', async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    res.status(400).send('No target URL specified');
    return;
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: { ...req.headers, host: new URL(targetUrl).host },
      body: req.method === 'GET' ? null : JSON.stringify(req.body),
      agent: targetUrl.startsWith('https') ? agent : undefined
    });

    const data = await response.json() ?? await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    console.error('Error proxying request:', error);
    res.status(500).send('Error proxying request');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});