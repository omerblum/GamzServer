const express = require("express");
const router = express.Router();
var axios = require('axios');

function getUserInfoFromGoogle(token) 
{  
    const URL = "https://www.googleapis.com/oauth2/v3/userinfo"
    return axios.get(URL, { headers: { Authorization: token } })
     .then(response => {
         console.log("getUserInfoFromGoogle: successfully got user info from google");
         return response.data;
      })
     .catch((error) => {
         console.log('getUserInfoFromGoogle: error ' + error);
      });
}

router.post("/", async (req, res) => 
{
    const email = req.body.email;
    const token = req.headers.authorization;

    getUserInfoFromGoogle(token)
        .then(async userInfo => 
        {
            console.log("PUT signin: successfully got user ", userInfo.name, "deatils from google. checking if email is correct")
            // check here the email is correct, and then check if the user exists, if not add it, if yes send all ok
            if (userInfo.email === email)
            {
                console.log("PUT signin: email match, allowing user to continue")
                res.status(200)
                res.send(true)
            }
            else
            {
                console.log("PUT signin: email don't match: given email is: ", email, " but email we got from google is ", userInfo.email, "returning unauth")
                res.status(401)
                res.send(false)
            }
        })


});

module.exports = router;