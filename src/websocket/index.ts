import WebSocket from "ws";
import https from "https";
import fs from "fs";
import { IncomingMessage } from "http";

let wss: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>;
if (process.env.NODE_ENV === "production") {
  const server = https
    .createServer({
      cert: fs.readFileSync(
        "/etc/letsencrypt/live/api.sensormagics.com/fullchain.pem"
      ),
      key: fs.readFileSync(
        "/etc/letsencrypt/live/api.sensormagics.com/privkey.pem"
      ),
    })
    .listen(51001);
  wss = new WebSocket.Server({ server });
} else {
  wss = new WebSocket.Server({ port: 8080 });
}

export { wss };
