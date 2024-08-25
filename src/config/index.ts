import mqtt from 'mqtt';
import WebSocket from 'ws';
import https from 'https';
import fs from 'fs';
import { IncomingMessage } from 'http';
import logger from 'utils/logger';

let wss: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>;
let client: mqtt.MqttClient;

export async function configureMQTTServer(): Promise<void> {
  try{
  const mqttUrl = process.env.MQTTURL!;
  client = mqtt.connect(mqttUrl);

  client.on('connect', () => {
    console.log('MQTT client connected');
  });

  logger.info(client + "Client got connected");

  client.on('error', (err) => {
    console.error('MQTT Error:', err);
  });

  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'production') {
      const server = https.createServer({
        cert: fs.readFileSync(
          "/etc/letsencrypt/live/api.sensormagics.com/fullchain.pem"
        ),
        key: fs.readFileSync(
          "/etc/letsencrypt/live/api.sensormagics.com/privkey.pem"
        ),
      }).listen(51001, () => {
        console.log("HTTPS server listening on port 51001");
        wss = new WebSocket.Server({ server });
        console.log("WebSocket server listening on port 51001");
        resolve();
      });

    } else {
      wss = new WebSocket.Server({ port: 8080 });
      console.log("WebSocket server listening on port 8080");
      resolve();
    }
  });}
  catch(err){
    logger.error(err);
  }
}
export { wss, client };
