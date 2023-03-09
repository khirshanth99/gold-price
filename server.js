const express = require("express");
const fs = require('fs')
const app = express();
const path = require('path');
const { MongoClient } = require('mongodb');
const routes = require('./app/routes/index')
const mongoUrl = 'mongodb://gpgRoot:6XdiyoKjs@ec2-34-196-142-118.compute-1.amazonaws.com:27017/xrates?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false'
const db = require("./app/model");
var router = express();
var mongoConnection;
// require('./app/routes/auag_rate.router')(app);
// Connect to the db
// MongoClient.connect(mongoUrl, function(err, db) {
//     if(!err) {
//       console.log("We are connected to: " + mongoUrl);
//       mongoConnection = db;
//     //  console.log(mongoConnection);
//     //  writeFinalClosesFile();
//     //  updateNewCloseDb();
//     } else {
//       console.error("Error trying to connected to: " + mongoUrl);
//       console.error(err);
//     }
//   });
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});



// const directoryPath = path.join(__dirname, 'HistoricalData');

// function updateAlgorithm(){
//     fs.readdir(directoryPath, function (err, files) {
//         //handling error
//         if (err) {
//             return console.log('Unable to scan directory: ' + err);
//         } 
//         //listing all files using forEach
//         files.forEach(function (file ,err) {
//             // Do whatever you want to do with the file
//             console.log(file)
//             if (err) {
//                 return console.log('Unable to iterate files: ' + err);
//             }
//            fs.readFile(`HistoricalData/${file}`, 'utf8', function(err ,str){
//             if (err) {
//                 return console.log('Unable to scan file: ' + err);
//             } 
//             console.log(str.split(','))
//             const eleArr = str.split(',');
//             if(eleArr){
//                   const findEle = eleArr.map(item => item === "0" ? "1010" : item);
//                   const finalStr = findEle.join(',')
//                   fs.writeFile(`HistoricalData/${file}`, finalStr, 'utf8', function (err) {
//                     if (err) return console.log(err);
//                  });
//             }
//           });
        
//         });
//     });
   
// }

//  updateAlgorithm()

const tenSecPath = path.join(__dirname, 'Data10Seconds');
 console.log(tenSecPath)
function updateChunks(){
  fs.readdir(tenSecPath, function (err, files) {
      //handling error
      if (err) {
          return console.log('Unable to scan directory: ' + err);
      } 
      //listing all files using forEach
      files.forEach(function (file ,err) {
          // Do whatever you want to do with the file
          console.log(file)
          if (err) {
              return console.log('Unable to iterate files: ' + err);
          }
         fs.readFile(`Data10Seconds/${file}`, 'utf8', function(err ,str){
          if (err) {
              return console.log('Unable to scan file: ' + err);
          } 
          
          const eleArr = str.split(',');
          if(eleArr){
                let count = 0;
                const findEle = eleArr.map(item => {
                    count++
                    if(item === '1850.50'){
                       if(count < 12000 ){
                        return item = "1865.55"
                       }else{
                         return item = "1870.50"
                       }
                    }else{
                        return item
                    }
                });
                const finalStr = findEle.join(',')
                // console.log(finalStr)
                fs.writeFile(`Data10Seconds/${file}`, finalStr, 'utf8', function (err) {
                  if (err) return console.log(err);
               });
          }
        });
      
      });
  });
 
}
updateChunks()

// app.get('/GetData/:instruments/:timeStamp' , function(req,res){
//     console.log(req.params)
//        var file = req.params.instruments.substring(0, 7);
//        console.log(file)
//       var timeStamp = 0;
      
    
//       if(timeStamp == '0') {
    
      
    

    
//         fs.readFile(`Data10Seconds/${file}.txt`,"utf8", function(err, str){
//           if (err)
//           {
//            console.log(err)
          
//           } else {
       
//             res.setHeader('Cache-Control', 'public, max-age=10');
//             res.setHeader("Access-Control-Allow-Origin", "*");
//             res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//             res.contentType('application/json');
//             res.jsonp([str]);
//           }
    
//         });
    
    
//       }
// }
// )

router.get('/GetData/:instruments/:timeStamp', function (req, res) {


  var file = req.params.instruments.substring(0, 7);
  var timeStamp = 0;
  

  if(timeStamp == '0') {

  

    console.log('File Based /GetData/' + instruments + ' -> theFile : ' + theFile);

    fs.readFile(`Data10Seconds/${file}`,"utf8", function(err, str){
      if (err)
      {
        console.error("Error reading : " + '/GetData/' + instruments + ' -> theFile : ' + theFile);
      
      } else {
   
        res.setHeader('Cache-Control', 'public, max-age=10');
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.contentType('application/json');
        res.jsonp([str]);
      }

    });


  }

});
