const express = require("express");
const router = express.Router();
var axios = require('axios');
const usersDB = require('../Database/usersDB');

function getUserInfoFromGoogle(token) 
{  
    const URL = "https://www.googleapis.com/oauth2/v3/userinfo"
    return axios.get(URL, { headers: { Authorization: token } })
     .then(response => {
         return response.data;
      })
     .catch((error) => {
         console.log('getUserInfoFromGoogle: error ' + error);
         return null;
      });
}

async function isUserAdmin(userInfo)
{
  if (userInfo == null)
  {
    return false
  }
  const email = userInfo.email
  const user = await usersDB.GetUserInfoByEmail(email)
  console.log("isUserAdmin: got user info and is he admin = ", user.is_admin)
  return user.is_admin
}

exports.getUserInfoFromGoogle = getUserInfoFromGoogle;
exports.isUserAdmin = isUserAdmin;