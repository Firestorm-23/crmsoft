
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

var LDir;
if (process.env.NODE_ENV === 'development') {
    LDir = __dirname;
}
else {

    //Need to un comment this line for build mode
    LDir = (process && process.resourcesPath);
}

var FDbPath = path.resolve(LDir, 'db/data.db');

// open the database
var FDb = new sqlite3.Database(FDbPath);

module.exports = FDb;