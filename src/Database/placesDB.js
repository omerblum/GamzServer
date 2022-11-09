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


async function GetPlaceAbout(placeId)
{
    console.log(`GetPlaceAbout: Getting place ${placeId} about info from db`)
    var aboutPlace = await db(c_placesTableName).select('place_about')
        .where({place_id: placeId})
    console.log(`GetPlaceAbout: This is the info about place ${placeId}: ${aboutPlace}`)

    return aboutPlace;   
}





/* Exporting all functions */
exports.GetPlacesIdsUserOwn = GetPlacesIdsUserOwn;
exports.GetPlaceAbout = GetPlaceAbout;




