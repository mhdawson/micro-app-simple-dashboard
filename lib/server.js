var fs = require('fs');
var mqtt = require('mqtt');
var socketio = require('socket.io');

const BORDERS = 35;
const HEIGHT_PER_ENTRY = 36;
const PAGE_WIDTH = 305;

var eventSocket = null;
var latestData = {};

var Server = function() {
}

Server.getDefaults = function() {
  return { 'title': 'House Data' };
}

var replacements;
Server.getTemplateReplacments = function() {
  if (replacements === undefined) {
    var config = Server.config;
    var height = BORDERS;
    var dashBoardEntriesHTML = new Array();

    for (i = 0; i < config.dashboardEntries.length; i++) {
      dashBoardEntriesHTML[i] = '<tr><td>' + config.dashboardEntries[i].name + ':</td><td id="' +
                                config.dashboardEntries[i].topic + '">pending</td></tr>';
      height = height + HEIGHT_PER_ENTRY;
    }

    replacements = [{ 'key': '<TITLE>', 'value': Server.config.title },
                    { 'key': '<UNIQUE_WINDOW_ID>', 'value': Server.config.title },
                    { 'key': '<DASHBOARD_ENTRIES>', 'value': dashBoardEntriesHTML.join("") },
                    { 'key': '<PAGE_WIDTH>', 'value': PAGE_WIDTH },
                    { 'key': '<PAGE_HEIGHT>', 'value': height }];

  }
  return replacements;
}


Server.startServer = function(server) {
  var topicsArray = new Array();
  var config = Server.config;
  for (i = 0; i < config.dashboardEntries.length; i++) {
    topicsArray.push(config.dashboardEntries[i].topic);
  }

  var mqttOptions;
  if (Server.config.mqttServerUrl.indexOf('mqtts') > -1) { 
    mqttOptions = { key: fs.readFileSync(path.join(__dirname, 'mqttclient', '/client.key')),
                    cert: fs.readFileSync(path.join(__dirname, 'mqttclient', '/client.cert')),
                    ca: fs.readFileSync(path.join(__dirname, 'mqttclient', '/ca.cert')),
                    checkServerIdentity: function() { return undefined }
   }
 }

  var mqttClient = mqtt.connect(Server.config.mqttServerUrl, mqttOptions);
  eventSocket = socketio.listen(server);

  eventSocket.on('connection', function(client) {
    for (var key in latestData) {
      eventSocket.to(client.id).emit('data', key + ":" + latestData[key]);
    } 
  });

  mqttClient.on('connect',function() {
    for(nextTopic in topicsArray) {
      mqttClient.subscribe(topicsArray[nextTopic]);
    }
  });

  mqttClient.on('message', function(topic, message) {
    var timestamp = message.toString().split(",")[0];
    var parts = message.toString().split(":");
    if (1 < parts.length) {
      var value = parts[1].trim();
      latestData[topic] = value;
      eventSocket.emit('data', topic + ':' + value);
    }
  });
}
  
if (require.main === module) {
  var path = require('path');
  var microAppFramework = require('micro-app-framework');
  microAppFramework(path.join(__dirname), Server);
}
