const express = require("express");
const router = express.Router();
const uuid = require("uuid");
let events = require("../Events");
var axios = require('axios');
const apiKey = process.env['REACT_APP_GOOGLE_API_KEY']

function getGeoAnaNameByPlaceId(placeId)
{  
  const url ='https://maps.googleapis.com/maps/api/place/details/json?fields=name,geometry&place_id=' + placeId + '&key=' + apiKey
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
    console.log("getGeoByPlaceId: " + JSON.stringify(data));
    console.log("getGeoByPlaceId: " + data.result.geometry.location);
    return data.result
  })
  .catch(function (error) 
  {
    console.log(error);
    return null;    
  });
}

router.get("/", (req, res) => 
{
  res.json(events);
});

// Get event
router.get("/:event_id", (req, res) => 
{
  const id_to_look_for = req.params.event_id
  const found = events.some(event => event.event_id === id_to_look_for);
  if (found) 
  {
    res.json(events.filter(event => event.event_id === id_to_look_for));
  }
  else
  {
    res.sendStatus(400);
  }
});


router.post("/", (req, res) => 
{    
  const placeId = req.body.place_id
  if (placeId === "")
  {
    console.log("post: recieved empty place ID, can't add the event")
    res.json(events);
  }
  else
  {
    console.log(req.body.place_id)

    getGeoAnaNameByPlaceId(placeId)
      .then(data => 
        {
          console.log(data)
          const newevent = 
          {
            event_id: uuid.v4(),
            // locaion_id should be according to the publisher's business location we should alreayd have from his authentication
            game_id: req.body.game_id,
            place_id: placeId,
            place_name: data.name,
            // Approved event should be according to who created the event
            approved_event: false,
            team_a: req.body.team_a,
            team_b: req.body.team_b,
            competition: req.body.competition,
            event_date: req.body.event_date,
            event_time: req.body.event_time,
            // Geometry should be acording to the publihser's business location we should alreayd have from his authentication
            lat: data.geometry.location.lat,
            lng: data.geometry.location.lng
          };

          console.log(newevent)

          // TODO: Check if the event already exists

          if (!newevent.place_name || !newevent.place_id) 
          {
            return res.sendStatus(400);
          }

          events.push(newevent);

          res.json(events);
          console.log("added new event: " + newevent.event_id)

        })    
  }  
});


//Update event
router.put("/:event_id", (req, res) => 
{
  const found = events.some(event => event.event_id === req.params.event_id);
  if (found) 
  {
    const updateevent = req.body;
    events.forEach(event => 
    {
      if (event.event_id === req.params.event_id) 
      {
        // update the event here
        res.json({ msg: "event updated", event });
      }
    });
  } 
  else 
  {
    res.sendStatus(400);
  }
});

 
//Delete event
router.delete("/:event_id", (req, res) => 
{
  const found = events.some(event => event.event_id === req.params.event_id)
  if (found) 
  {
    events = events.filter(event => event.event_id !== req.params.event_id)
    res.json({
      msg: "event deleted",
      events
    });
  } 
  else
  {
    res.sendStatus(400);
  }
});

module.exports = router;