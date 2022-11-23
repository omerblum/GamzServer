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


async function GetNumberOfPlaces()
{
    console.log(`GetNumberOfPlaces: Getting number of places`)
    var places = await db(c_placesTableName).select('*')
                   
    return places.length
}

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

async function GetAllPlaces()
{
    console.log(`GetAllPlaces: Returning all places`)
    var allPlaces = await db(c_placesTableName).select('*')

    return allPlaces;  
}

async function GetAllUnauthorizedPlaces()
{
    console.log(`GetAllUnauthorizedPlaces: Returning all unauthorized places`)
    var allUnauthPlaces = await db(c_placesTableName)
    .select('*')
    .where({is_authorized: 0})

    return allUnauthPlaces;  
}

async function GetAllauthorizedPlaces()
{
    console.log(`GetAllauthorizedPlaces: Returning all unauthorized places`)
    var allauthPlaces = await db(c_placesTableName)
    .select('*')
    .where({is_authorized: 1})

    return allauthPlaces;  
}

async function GetPlaceInfo(placeId)
{
    console.log(`GetPlaceInfo: Getting place ${placeId} info from db`)
    var placeInfo = await db(c_placesTableName).select('*')
        .where({place_id: placeId})

    return placeInfo;   
}

async function ApprovePlace(placeId)
{
    const wasUpdated = true;

    await db(c_placesTableName)
        .update("is_authorized", 1)
        .where({place_id: placeId})
        .catch(error =>
        { 
            console.log(error);
            wasUpdated = false
        })
    
    return wasUpdated
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

async function AddNewPlace(place)
{
    console.log("Adding new place: ", place)
    var wasInserted = true;

    await db(c_placesTableName)
    .insert(place)
    .then(console.log(`AddNewPlace: Successfully added place`))
    .catch(error =>
        { 
        console.log(`AddNewPlace: Failed adding place due to error: ${error}`);
        wasInserted = false
    })
    
    return wasInserted;   
}


async function GetOwnerIdFromPlaceId(placeID)
{
    console.log("GetOwnerIdFromPlaceId: finding owner of place ", placeID)
    
    
    var userID = await db(c_placesTableName)
    .select('owner_id')
    .where({place_id: placeID})

    return userID;

}


/* Exporting all functions */
exports.GetPlacesIdsUserOwn = GetPlacesIdsUserOwn;
exports.GetPlaceInfo = GetPlaceInfo;
exports.AddPlaceIfNotAlready = AddPlaceIfNotAlready;
exports.GetAllPlaces = GetAllPlaces;
exports.GetAllUnauthorizedPlaces = GetAllUnauthorizedPlaces;
exports.GetAllauthorizedPlaces = GetAllauthorizedPlaces;
exports.ApprovePlace = ApprovePlace;
exports.GetNumberOfPlaces = GetNumberOfPlaces;
exports.AddNewPlace = AddNewPlace;
exports.GetOwnerIdFromPlaceId = GetOwnerIdFromPlaceId;

