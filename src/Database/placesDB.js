const mySqlPassword = process.env.REACT_APP_MYSQL_PASSWORD
const mySqlUser = process.env.REACT_APP_MYSQL_USER
const mySqlUrl = process.env.REACT_APP_MYSQL_URL
const knex = require('knex');
var moment = require('moment');

// Connecting to the DB
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


const c_placesTableName = "places"


// Returns array of places IDs that given user own
async function GetPlacesIdsUserOwn(userId)
{
    console.log(`GetPlacesIdsUserOwn: Getting all places user ${userId} own`)
    var ownedPlaces = await db(c_placesTableName).select('place_id')
        .where({owner_id: userId})
    const places = []
    ownedPlaces.forEach(item => {
        places.push(item.place_id)
    })

    return places;   
}


async function GetPlaceInfo(placeId)
{
    console.log(`GetPlaceInfo: Getting place ${placeId} info from db`)
    var placeInfo = await db(c_placesTableName).select('*')
        .where({place_id: placeId})
    console.log(`GetPlaceInfo: This is the info about place ${placeId}: ${placeInfo}`)

    return placeInfo;   
}

async function AddPlaceIfNotAlready(placeInfo, placeId)
{
    console.log(`AddPlaceIfNotAlready: Checking if place ${placeId} exists`)
    console.log(placeInfo)
    var placeInfoFromDB = await db(c_placesTableName).select('*')
        .where({place_id: placeId})
    if (placeInfoFromDB.Length > 0)
    {
        console.log(`AddPlaceIfNotAlready: Place with ID ${placeId} already exists`)
        return
    }

    

    const placeObject = {
        place_id: placeId,
        place_name: placeInfo?.name
    }

    await db(c_placesTableName)
    .insert(placeObject)
    .then(console.log(`AddPlaceIfNotAlready: Successfully added place ${placeInfo.name} with id ${placeId}`))
    .catch(error =>
        { 
        console.log(`AddPlaceIfNotAlready: Failed adding place ${placeInfo.name} with id ${placeId} due to error: ${error}`);
        wasInserted = false
    })
    
    return;   
}





/* Exporting all functions */
exports.GetPlacesIdsUserOwn = GetPlacesIdsUserOwn;
exports.GetPlaceInfo = GetPlaceInfo;
exports.AddPlaceIfNotAlready = AddPlaceIfNotAlready;




