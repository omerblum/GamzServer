const express = require("express");
const cors=require("cors");

const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cors(corsOptions)) // Use this after the variable declaration

app.use("/api/events", require("./API/events"));
app.use("/api/sports", require("./API/sports"));
app.use("/api/competition", require("./API/competition"));
app.use("/api/teamA", require("./API/teamA"));
app.use("/api/teamB", require("./API/teamB"));

app.listen(3006, () => console.log('Server started and running on port 3006'));