var express = require("express");

function callGC() {
    try {global.gc();} catch (e) {}
}
setInterval(callGC, 1000)       // call GC every second

getRSSMemoryInKB = function() {
    return Math.round( process.memoryUsage().rss / 1024 );              // RSS = Resident Set Size = total memory size
}

var startupMem = getRSSMemoryInKB()*1, lastMem = getRSSMemoryInKB()*1;
var displayInterval = 60;       // in seconds

function displayMem() {
    try {
        global.gc();
        if (process.uptime() < 30) console.log( "thisAppID=" + thisAppID)
    } catch (err) {
        console.log("You must run program with 'node --expose-gc server.js'; not measuring memory usage on this thread.");
        console.log(JSON.stringify(err))
        //return
        //process.exit();
    }
    var mem = getRSSMemoryInKB()*1
    console.log( "***  heapUsed=" + (process.memoryUsage().heapUsed / 1024 / 1024).toLocaleString() + "M, memoryUsage (rss): " + mem.toLocaleString() + "k, diff from beg=" + (mem-startupMem).toLocaleString() + ", diff with last=" + (mem-lastMem).toLocaleString() + "          ***")

    lastMem = mem;
    setTimeout(function() { displayMem() }, (process.uptime()>120 ? 1000*displayInterval : 10000))         // run it every 10 seconds at beg., then every 5 minutes after 2 minutes
}

displayMem()                                            // run it once at beginning


// sort of hack
var uristring = "unset";
var uristringLocalhost = 'mongodb://localhost/dishly3';        // removed / at the end in May 2016 for mongo v3 and driver update
if (process.argv.indexOf("--dbHeroku")>0 || process.argv.indexOf("--dbheroku")>0) {     // this way, we can access the prod db from localhost
    console.log( "WARNING: PRODUCTION DATABASE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    uristring= "mongodb://heroku_brtl4f8d:1tnu32khnh0rtl25gagjqmaa3m@ds043153-a0.mongolab.com:43153,ds043153-a1.mongolab.com:43153/heroku_brtl4f8d?replicaSet=rs-ds043153";
    //uristring= "mongodb://heroku_brtl4f8d:2NlcqAiektznbx9SxN3s@ds043153-a0.mongolab.com:43153,ds043153-a1.mongolab.com:43153/heroku_brtl4f8d?replicaSet=rs-ds043153";
    //uristring= "mongodb://dishly_mongolab:cwnqpabXv06RpW807o6b@ds043153-a0.mongolab.com:43153,ds043153-a1.mongolab.com:43153/heroku_brtl4f8d?replicaSet=rs-ds043153";
} else {
    uristring =
        process.env.MONGOLAB_URI ||
        process.env.MONGOHQ_URL ||
        uristringLocalhost;
}

//commented out May 2016:
if (uristring.indexOf("?")>=0) uristring += "&connectTimeoutMS=990000"; else uristring +="?connectTimeoutMS=990000";
uristring +="&socketTimeoutMS=990000";

db_url=  uristring;      //  "mongodb://localhost/nicomac"


var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(db_url, function dbConnected(err, MongoDB) {
    if (err) return console.log(JSON.stringify(err))

    global.db = MongoDB;

    console.log("Trying to listen to port 8989");
    var app = express();
    var server = app.listen(8989, function (err) {
        if (err) {
            return console.log(JSON.stringify(err))
        } else {
            console.log("Listening");
        }
    });
});
