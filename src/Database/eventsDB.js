const mySqlPassword = process.env.REACT_APP_MYSQL_PASSWORD
const mySqlUser = process.env.REACT_APP_MYSQL_USER
const mySqlUrl = process.env.REACT_APP_MYSQL_URL
const knex = require('knex');
var moment = require('moment');
const placesDB = require('./placesDB');



const db = knex({
    client: 'mysql',
    connection: {
        host : mySqlUrl,
        user : mySqlUser,
        password : mySqlPassword,
        database : 'heroku_4f3adb018c97aae',
        typeCast: function (field, next) {
            if (field.type == 'DATE') {
              return moment(field.string()).format('YYYY-MM-DD');
            }
            return next();
          }        
    }
});

const c_eventsTableName = "events"


async function DeleteEvents(eventIDsToDelete)
{
    console.log("DeleteEvents: Start with events IDs to delete: ", eventIDsToDelete)  
    try 
    {
        await db.raw('delete from events where event_id in (?)', [eventIDsToDelete])  
        console.log("DeleteEvents: completed")      
        
        return true;
    } 
    catch (error) 
    {
        console.log("DeleteEvents: Failed with error: ", error)      
        
        return false;   
    }  
}


/* Get today events */
// Need to add filter by day
async function getAllEvents()
{
    const now = moment().format('YYYY-MM-DD')
    var result = await db
        .select('*')    
        .where('event_date','>=', [now])
        .from(c_eventsTableName);

    return result;
}

/* Returns events that are in a place owned by given user id */
// TODO: return only events that didn't happen yet
async function getMyEvents(userID, selectOnlyEventIDs)
{
    console.log(`getMyEvents: Fetching events of place owned by user with ID ${userID}, and selecting just event IDs? ${selectOnlyEventIDs}`)
    const placesUserOwn = await placesDB.GetPlacesIdsUserOwn(userID)
    console.log("getMyEvents: user ", userID, " owns ", placesUserOwn.length, "places")
    
    if (placesUserOwn.length == 0)
    {
        return []
    }

    if (selectOnlyEventIDs)
    {
        var events = await db.raw('select event_id from events where place_id in (?)', [placesUserOwn])
    }
    else
    {
        var events = await db.raw('select * from events where place_id in (?)', [placesUserOwn])
    }

    return events[0];
}

/* Add new events */
async function addEvents(newEvent)
{
    var wasInserted = true;
    //inserting to table 'events' the new events
    await db(c_eventsTableName)
        .insert(newEvent)
        .catch(error =>
        { 
            console.log(error);
            wasInserted = false
        })
    
    return wasInserted;
}



async function eventExists(event)
{
    const { game_id , place_id, event_date, event_time} = event;
    console.log(`eventExists: Checking if an event exists with the following details: game_id: ${game_id}, place_id: ${place_id}, event_date: ${event_date}, event_time: ${event_time}`)
    var eventsFound = await db(c_eventsTableName).select()
                    .where({game_id: game_id, place_id: place_id, event_date: event_date, event_time: event_time})
    if (eventsFound.length === 0)
    {
        console.log("event doesn't exist")
        return false;
    }
    else
    {
        console.log("event exist")
        return true;
    }   
}

async function updateEventField(event_id, columnName, value)
{
    if (value === false) {
        value = 0
    } else if (value === true) {
        value = 1
    }
    console.log(`updating field ${columnName} to ${value} for the following event ID: ${event_id}`)
    var wasUpdated = true;
    //inserting to table 'events' the new event
    await db(c_eventsTableName)
        .update(columnName, value)
        .where({event_id})
        .catch(error =>
        { 
            console.log(error);
            wasUpdated = false
        })
    
    return wasUpdated;
}

async function GetNumberOfEvents()
{
    console.log(`GetNumberOfEvents: Getting number of events`)
    var events = await db(c_eventsTableName).select('*')
                   
    return events.length
}


/* Exporting all functions */
exports.addEvents = addEvents;
exports.eventExists = eventExists;
exports.updateEventField = updateEventField;
exports.getMyEvents = getMyEvents;
exports.DeleteEvents = DeleteEvents
exports.getAllEvents = getAllEvents;
exports.GetNumberOfEvents = GetNumberOfEvents;