var osc = require('node-osc');
var fs = require('fs');
const electron = require('electron');
const path = require('path');
const url = require('url')

const userDataPath = (electron.app || electron.remote.app).getPath('userData');
var resultFilename = this.path = path.join(userDataPath, 'result.json');


var exports = module.exports = {};


exports.getObjById = function(input_obj, cue){
    result = input_obj.filter(function( obj ) {
      return obj.number == cue;
    });
    return result[0]
}
exports.getListByNumber = function(input_obj, cue){
    result = input_obj.filter(function( obj ) {
      return obj["$"].number == cue;
    });
    return result[0]
}

exports.parseHogExport = function(exportFile, callback){
  // Load XML File
  fs.readFile(exportFile, 'utf8', function(err, rawXML) {  
    if (err){
      console.log("Error: "+err);
       $(".logWindow").html("Error: "+err);
    }else{

      // Parse XML cuelist
      var parseString = require('xml2js').parseString;
      parseString(rawXML, function (err, result) {
        callback(err, result);
      });
    } 
  });
}


exports.handleOSCMsg = function(oscServer, recordedListNr, {onCueIncoming, onPing}={}){
  // Handle OSC Message
  oscServer.on("message", function (msg, rinfo) {

    // Extract payload from msg
    msgPayload = msg[2][2]
    
    // Check is go button is pushed
    if(msgPayload[0].includes("/hog/playback/go/0")){
      var recvCueArray = []

      // Extract cue nr from incoming msg
      cueInfo = msgPayload[0].split("/")[5]
      recvCueArray["list"] = cueInfo.split(".")[0]
      recvCueArray["cue"] = parseFloat(cueInfo.split(".")[1]+"."+cueInfo.split(".")[2])

      // Filter of gekozen cuelijst
      if(recvCueArray["list"] == recordedListNr){
        
        // Check of er een xml cuelijst is geopend
        if (cueList.length != 0){
          // Get cue info from cueList
          var currentCue = exports.getObjById(cueList, recvCueArray["cue"])
        }else{
          var currentCue = {};
          currentCue["name"] = "";
          currentCue["comment"] = "";
          currentCue["trigger"] = "";
        }

        // Check if cue exists in xml file
        if(currentCue !== undefined){

          if(currentCue.comment === undefined){ currentCue.comment = "" }
          //console.log(timestampFrom + " Cue " + String(recvCueArray["cue"]) + ": " + currentCue.name + " (" + currentCue.comment + ")");

          resultData = {
            number: recvCueArray["cue"],
            name: currentCue.name,
            comment: currentCue.comment,
            trigger: currentCue.trigger,
          }
          onCueIncoming(resultData);
        }else{
          console.log("Kan cue niet vinden in cuelijst, wel de goede export geladen?")

          resultData = {
            number: recvCueArray["cue"],
            name: "",
            comment: "",
            trigger: "",
          }
          onCueIncoming(resultData);
        }
      }
    }else if(msgPayload[0].includes("/hog/status/time")){
      onPing();
    }
  });
}



exports.helpWindow =  function() {
    // Create the browser window.
    const BrowserWindow = remote.BrowserWindow;
    win = new BrowserWindow({width: 700, height: 500})
  
    // and load the index.html of the app.
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'help.html'),
      protocol: 'file:',
      slashes: true,
      icon: path.join(__dirname, 'icons/64x64.png')
    }))
    //win.webContents.openDevTools()
  }