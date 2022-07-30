const express = require("express");

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use("/api/events", require("./API/events"));

app.listen(3000, () => console.log('Server started'));