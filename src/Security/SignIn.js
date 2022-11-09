const express = require("express");
const router = express.Router();
var axios = require('axios');
const usersDB = require('../Database/usersDB');
const uuid = require("uuid");
var moment = require('moment');

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

// The method returns false if user already exist, and true if its the first time we add the user
async function addUserIfNotAlready(userInfo)
{
    const {name, given_name, email } = userInfo
    
    console.log(`addUserIfNotAlready: checking if user ${name} exists by checking his email ${email}`)
    var userId = await usersDB.GetUserIdByEmail(email, name);
    console.log(userId)
    if (userId)
    {
        console.log(`addUserIfNotAlready: User ${name} exists, and his user ID is ${userId}`)
        //User already exist
        return false
    }
    else
    {
        userId = uuid.v4();
        console.log(`addUserIfNotAlready: User ${name} doesn't exist, adding him to the DB with user ID ${userId}`)
        const user = 
        {
            user_id: userId,
            name: name,
            given_name: given_name,
            email: email,
            owns_business: false,
            joined_at:  moment().format('YYYY-MM-DD'),
        }
        successfullyAdded = await usersDB.AddUser(user)
        if (successfullyAdded)
        {
            // new user - returning true
            return true
        }
        else
        {
            console.log("failed adding user")
            return false
        }
    }
}

router.post("/", async (req, res) => 
{
    const email = req.body.email;
    const token = req.headers.authorization;

    var userInfo = await getUserInfoFromGoogle(token)
    if (userInfo == null)
    {
        console.log("failed getting info about user, blocking the request")
        res.status(403)
        return res.send("User isn't authenticated")
    }

    console.log("PUT signin: successfully got user ", userInfo.name, "deatils from google. checking if email is correct")
    // check here the email is correct, and then check if the user exists, if not add it, if yes send all ok
    if (userInfo.email === email)
    {
        console.log("PUT signin: email match, allowing user to continue")
        res.status(200)
    }
    else
    {
        console.log("PUT signin: email don't match: given email is: ", email, " but email we got from google is ", userInfo.email, "returning unauth")
        res.status(401)
        res.send(false)
    }


    const isItNewUser = await addUserIfNotAlready(userInfo)
    console.log("PUT signin: new user? ", isItNewUser)
    const userInfoFromDB = await usersDB.GetUserInfoByEmail(email)
    console.log("PUT signin: info about user from DB is", userInfoFromDB)
    if (userInfoFromDB == null)
    {
        return res.send("failed to add the user")
    }
    
    userInfoFromDB.isItNewUser= isItNewUser    
    res.send(userInfoFromDB)

});

module.exports = router;