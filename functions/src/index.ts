import cors from "cors";
import {onRequest} from "firebase-functions/v2/https";

import express from "express";
import webRouter from "./routes/web.routes";


const app = express();

app.use(cors({origin: true}));

app.get("/", (req, res) => {
  res.status(200).json({message: "works"});
});

app.use("/web", webRouter);

exports.api = onRequest(app);
