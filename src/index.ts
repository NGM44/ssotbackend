import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import routes from "routes/routes";
import { errorHandler } from "utils/errorHandler";
import "./utils/response/customSuccess";
import logger from "utils/logger";
/* eslint-disable no-console */

dotenv.config();
const app = express();
const port = process.env.PORT;

axios.interceptors.request.use((request) => {
  console.log("Starting Request", JSON.stringify(request, null, 2));
  return request;
});

axios.interceptors.response.use((response) => {
  const simplifiedResponse = {
    data: response.data, // or a portion of it if it's too large
    status: response.status,
    headers: response.headers,
    // Add any other properties you are interested in
  };

  console.log("Response:", JSON.stringify(simplifiedResponse, null, 2));
  return response;
});
app.use(cors({ origin: "*" }));
app.use(express.json());
mongoose
  .connect(process.env.MONGO_DB_URL || "", {
    dbName: process.env.MONGO_DB_NAME || "vayuguna",
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));
app.listen(port, () => {
  app.use("/", routes);
  app.use(errorHandler);
  logger.info(`Listening on port: ${port}`);
  return console.log(`Listening on port: ${port}`);
});
