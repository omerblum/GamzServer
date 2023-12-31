const express = require("express");
const cors=require("cors");
require('dotenv').config();


const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cors(corsOptions)) // Use this after the variable declaration
// app.use(cors()) 

app.use("/api/events", require("./API/events"));
app.use("/api/games", require("./API/games"));
app.use("/api/sports", require("./API/sports"));
app.use("/api/competition", require("./API/competition"));
app.use("/api/teamA", require("./API/teamA"));
app.use("/api/teamB", require("./API/teamB"));
app.use("/api/places", require("./API/places"));
app.use("/api/admin", require("./API/admin"));

app.use("/signin", require("./Security/SignIn"));
var port = 3006
if (process.env.PORT)
{
   port = process.env.PORT
}


app.listen(process.env.PORT || 3006, () => console.log('Server started and running on port ', port));

app.get('/', (req, res) => {
   res.send("Hey Omer, relax, your app is working")
});
