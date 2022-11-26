const express = require("express");
const router = express.Router();
var axios = require('axios');

const apiKey = process.env.REACT_APP_GOOGLE_API_KEY

function getPlaceInfoByPlaceIdFromGoogle(placeId)
{  
  const url ='https://maps.googleapis.com/maps/api/place/details/json?place_id=' + placeId + '&key=' + apiKey + '&language=iw&fields=name,geometry,formatted_phone_number,formatted_address'
  var config = 
  {
    method: 'get',
    url: url,
    headers: { }
  };
  
  return axios(config)
  .then(function (response) 
  {
    const data = response.data
    console.log(`getPlaceInfoByPlaceIdFromGoogle: Successfuly got location for placeID ${placeId}`);
    return data.result
  })
  .catch(function (error) 
  {
    console.log(`getPlaceInfoByPlaceIdFromGoogle: Failed while getting ${placeID} geo details. Error: ${error}`);
    return null;    
  });
}

exports.getPlaceInfoByPlaceIdFromGoogle = getPlaceInfoByPlaceIdFromGoogle;