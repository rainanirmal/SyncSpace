import express from "express";
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import projectRouter from "./routes/project.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended : true}));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/healthcheck" , healthCheckRouter);
app.use("/api/v1/auth" , authRouter);
app.use("/api/v1/projects", projectRouter); 

app.get("/" , (req, res) => {
    res.send("Hello from raina !");
});

export default app;