import express from "express";
import healthCheckRouter from "./routes/healthcheck.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended : true}));
app.use(express.static("public"));

app.use("/api/v1/healthcheck" , healthCheckRouter);

app.get("/" , (req, res) => {
    res.send("Hello from raina !");
});

export default app;