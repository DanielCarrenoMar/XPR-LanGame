import express from "express";
import http from "http";

import postAddressRouter from "#endpoints/postAddress.js";
import sendReset from "#endpoints/sendReset.js";
import webRouter from "#endpoints/web.js";

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.use("/", postAddressRouter)
app.use("/", sendReset)
app.use("/", webRouter)

export { app, server };
