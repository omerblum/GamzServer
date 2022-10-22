const mySqlPassword = process.env['REACT_APP_MYSQL_PASSWORD']
const knex = require('knex');
var moment = require('moment');

// Connecting to the DB
const db = knex({
    client: 'mysql',
    connection: {
        host : 'localhost',
        user : 'root',
        password : mySqlPassword,
        database : 'livedbdev',
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




/* Exporting all functions */
exports.GetPlacesIdsUserOwn = GetPlacesIdsUserOwn;




