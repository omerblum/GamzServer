// const mySqlPassword = process.env['REACT_APP_MYSQL_PASSWORD']
const mySqlPassword = "c626a9bd"
const knex = require('knex');
var moment = require('moment');
const placesDB = require('./placesDB');


// Connecting to the DB
// const db = knex({
//     client: 'mysql',
//     connection: {
//         host : 'localhost',
//         user : 'root',
//         password : mySqlPassword,
//         database : 'livedbdev',
//         typeCast: function (field, next) {
//             if (field.type == 'DATE') {
//               return moment(field.string()).format('YYYY-MM-DD');
//             }
//             return next();
//           }                
//     }
// });
const db = knex({
    client: 'mysql',
    connection: {
        host : 'eu-cdbr-west-03.cleardb.net',
        user : 'b1f969e16b070a',
        password : '16e932a8',
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
async function getTodayEvents()
{
    var result = await db.select('*').from(c_eventsTableName);

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

/* Add new event */
async function addEvent(newEvent)
{
    var wasInserted = true;
    //inserting to table 'events' the new event
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

async function updateIsVerifiedEvent(event_id, is_verified)
{
    console.log(`updating the following event ID: ${event_id} with the following is_verified state: ${is_verified}`)
    var wasUpdated = true;
    //inserting to table 'events' the new event
    await db(c_eventsTableName)
        .update({is_verified})
        .where({event_id})
        .catch(error =>
        { 
            console.log(error);
            wasUpdated = false
        })
    
    return wasUpdated;
}


/* Exporting all functions */
exports.getTodayEvents = getTodayEvents;
exports.addEvent = addEvent;
exports.eventExists = eventExists;
exports.updateIsVerifiedEvent = updateIsVerifiedEvent;
exports.getMyEvents = getMyEvents;
exports.DeleteEvents = DeleteEvents

