var CronJob = require('cron').CronJob;
var fs = require('fs');
var router = require("express").Router();
// const fetch = require('node-fetch');
// import fetch from "node-fetch";

const db = require("../model");
const ratedetails = db.ratedetails;

// const moment= require('moment') 
const moment = require('moment-timezone');
// const { create } = require('../models/user.model');



var url = 'http://www.apilayer.net/api/historical?access_key=a2a792920678c44290afec093991c390&format=1&currencies=usd&date=2022-10-27&source=XAG';


module.exports = app => {

    function writeFinalClosesFile() {


        function writeFinalClosesFileInner() {
            console.log('writeFinalClosesFile');
            //console.log(data);


            var exchangeClose = fs.readFileSync('comex-exchange-closes.txt', "utf8");
            var exchangeCloseJson = JSON.parse(exchangeClose);

            // console.log(exchangeCloseJson);

            // Comex closes
            var xauObj = exchangeCloseJson.metals.find(x => x.metal === 'XAU');
            var xagObj = exchangeCloseJson.metals.find(x => x.metal === 'XAG');

            var cmeCloseXAU = xauObj.price;
            var cmeCloseXAG = xagObj.price;

            // console.log(cmeCloseXAU);
            // console.log(cmeCloseXAG);

            // These are the snapshot xrates files
            // closes-special-v3-XAG.json
            // closes-special-v3-XAU.json

            // Temp vars for Closes files reading results
            // These files are produced at 13:25 and 13:30 by the scraper

            var xauCloses = fs.readFileSync('silver-price-json.json', "utf8");
            var xagCloses = fs.readFileSync('gold-price-json.json', "utf8");

            // Temp JSON object from those files
            var xauClosesJson = JSON.parse(xauCloses);
            var xagClosesJson = JSON.parse(xagCloses);
            //  var xbtClosesJson = JSON.parse(xbtCloses);

            // Reset array for the final values
            closeArrs = {};

            closeArrs.ts = Date.now();
            closeArrs.xauDate = xauClosesJson.xrateDate;
            closeArrs.xagDate = xagClosesJson.xrateDate;
            closeArrs.closeDate = moment(closeArrs.ts).tz('America/New_York').format('MMM Do YYYY, hh:mm:ss A [NY]');
            closeArrs.Date = moment(closeArrs.ts).tz('America/New_York').format('MMM Do YYYY, hh:mm:ss A [NY]');

            // the 'metals'
            closeArrs.xauClose = cmeCloseXAU;
            closeArrs.xagClose = cmeCloseXAG;

            //closeArrs.xauMSClose = xauClosesJson.xauMSClose;
            //closeArrs.xagMSClose = xagClosesJson.xagMSClose;

            closeArrs.items = [];

            var items = xauClosesJson.items;
            var itemsXag = xagClosesJson.items;

            // Push all the items in to the result
            // Typical record below for ms and xe data
            /*
            {
              "xrate" : 1.346022,
              "curr" : "AUD",
              "src" : "ms",
              "xauXrate" : 1.346022,
              "xagClose" : 22.776708,
              "xagXrate" : 1.346575,
              "xauClose" : 1694.150186
            },
            {
              "xauClose" : 2252.95665,
              "xagClose" : 30.289485,
              "xagXrate" : 1.79,
              "xauXrate" : 1.79,
              "src" : "xe",
              "xrate" : 1.79,
              "curr" : "AWG"
            },
          
            */

            for (var x in items) {
                var cItem = {};
                cItem.curr = items[x].curr;
                cItem.src = items[x].src;
                cItem.xrate = parseFloat(items[x].xrate.toFixed(6));
                cItem.xauXrate = parseFloat(items[x].xrate.toFixed(6));
                cItem.xagXrate = parseFloat(itemsXag[x].xrate.toFixed(6));

                // Calc into temp vars
                // Multiply the xrate at closetime * the price at that time
                var xauCloseTmp = items[x].xrate * xauClosesJson.price;
                var xagCloseTmp = itemsXag[x].xrate * xagClosesJson.price;

                // insert into return json
                if (cItem.curr == 'USD') {
                    cItem.xauClose = parseFloat(cmeCloseXAU.toFixed(6));
                    cItem.xagClose = parseFloat(cmeCloseXAG.toFixed(6));
                } else {
                    cItem.xauClose = parseFloat(xauCloseTmp.toFixed(6));
                    cItem.xagClose = parseFloat(xagCloseTmp.toFixed(6));
                }

                // Push it to the results array items list
                closeArrs.items.push(cItem);
                // console.log('closeArrs@@@@@@@');

                // console.log(x)
                // console.log(cItem);
                fs.appendFile('./Data1Hour/' + cItem.curr + '_XAU.txt', cItem.xauClose + ',' + closeArrs.ts + ',', function (err) {
                    if (err) throw err;
                    console.log('Saved!');
                });

                fs.appendFile('./Data1Hour/' + cItem.curr + '_XAG.txt', cItem.xagClose + ',' + closeArrs.ts + ',', function (err) {
                    if (err) throw err;
                    // console.log('Saved!'); 
                });
            }

            var jsonStr = JSON.stringify(closeArrs);
            // console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
            // console.log(closeArrs);
            // console.log(jsonStr)

            // fs.appendFile('mynewfile1.txt', 'Hello content!'+"\n", function (err) {


            // write new skool
            var fileName = 'closes-v3-combined.txt';
            fs.writeFileSync(fileName, jsonStr);

            // write old skool
            var fileName2 = 'closes-combined.txt';
            fs.writeFileSync(fileName2, jsonStr);

            // write mongoDB
            writeXratesDataToMongo('finalClosesCollection' + 'test', closeArrs);

            writeXratesDataToMongo('finalXeClose', closeArrs);

        }

        function writeXratesDataToMongo(collectionName, data) {

            var dbData = data;
            var dbCollName = collectionName;
            const mongoUrl = 'mongodb+srv://sivasankar:47AFjPG10zpeokpn@cluster0.r4tj7hm.mongodb.net/?retryWrites=true&w=majority';
            console.log('###############################');
            console.log(data.items[0])
            const saveDatadb = new ratedetails({
                ts: data.ts,
                xauClose: data.xauClose,
                xagClose: data.xagClose,
                items: data.items
            });

            saveDatadb.save(saveDatadb).then(data => {
                // res.send(data)
                // console.log('data**********************************');
                // console.log(saveDatadb)
            }).catch(err => {
                console.log('err', err)
                // res.status(500).send({
                //     message:
                //       err.message || "Some error occurred while creating the Tutorial."
                //   });
            })


        }

        writeFinalClosesFileInner();






    }

    var job = new CronJob(
        '* * * * *',
        function () {
            writeFinalClosesFile();
            console.log('You will see this message every second');
        },
        null,
        true,
        'America/Los_Angeles'
    );

    // writeFinalClosesFile();
}  