import WebSocket from "ws";
import https from "https";
import fs from "fs";
import { IncomingMessage } from "http";

let wss: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>;
if (process.env.NODE_ENV === "production") {
  try {
    const server = https
      .createServer({
        cert: fs.readFileSync("/etc/letsencrypt/live/api.sensormagics.com/fullchain.pem"),
        key: fs.readFileSync("/etc/letsencrypt/live/api.sensormagics.com/privkey.pem"),
      })
      .listen(51001, () => {
        console.log("HTTPS server listening on port 51001");
      });
    wss = new WebSocket.Server({ server });
  } catch (error) {
    console.error("Failed to start HTTPS server:", error);
  }
} else {
  try {
    wss = new WebSocket.Server({ port: 8080 });
    console.log("WebSocket server listening on port 8080");
  } catch (error) {
    console.error("Failed to start WebSocket server:", error);
  }
}

export { wss };
