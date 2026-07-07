import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended : true}));
app.use(express.static("public"));

app.get('/' , (req, res) => {
    res.send("Hello from raina !");
});

export default app;