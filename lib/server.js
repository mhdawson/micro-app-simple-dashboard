// Copyright 2015-2016 the project authors as listed in the AUTHORS file.
// All rights reserved. Use of this source code is governed by the
// license that can be found in the LICENSE file.

var fs = require('fs');
var mqtt = require('mqtt');
var socketio = require('socket.io');

const BORDERS = 55;
const HEIGHT_PER_ENTRY = 34;
const PAGE_WIDTH = 320;

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
       var value = latestData[key];
       if (value.trim().indexOf(" ") === -1) {
        value = Math.round(value * 100) / 100;
      }
      eventSocket.to(client.id).emit('data', key + ":" + value);
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
      if (value.trim().indexOf(" ") === -1) {
        value = Math.round(value * 100) / 100;
      }
      eventSocket.emit('data', topic + ':' + value );
    }
  });
}
  
if (require.main === module) {
  var path = require('path');
  var microAppFramework = require('micro-app-framework');
  microAppFramework(path.join(__dirname), Server);
}
