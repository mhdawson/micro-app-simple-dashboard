# micro-app-simple-dashboard - MQTT/Node base home dashsboard

Micro app to display a home dashboard showing temperature, power
usage and other data collected from local sensors. The dashboard is updated
in realtime using socket.io

The dashboards listens on a number of mqtt topics for updates and then
forwards the updates to clients using socket.io.  It provides a simple way
to display iot sensor data on a client.

This is an example display:

![picture of dashboard main window](pictures/dashboard_main_window.jpg?raw=true)

The following projects can be used to connect sensors temperature
sensors and power sensors

* [PI433WirelessRecvMananager](https://github.com/mhdawson/PI433WirelessRecvManager)

# Usage

After installation modify ../lib/config.json to match your configuration

The configuration entries that must be updated include:

* mqttServerUrl - url of the mqtt server to connect to.  This can either start
  with tcp:// or mqtts://. If it starts with mqtts://  there must be a subdirectory
  in the lib directory called mqttclient which contains ca.cert, client.cert,
  client.key which contain the key and associated certificates for a client
  which is authorized to connect to the mqtt server.
* dashboardEntries - array in which each entry  which contain a name and topic field.
  The name is what will be display as the label in the dashboard and the topic
  is the topic on which the dashboard will listen for updates.  Updates on the
  topic should be in the form of yyyyy,xxxx:value were yyyyy is generally a
  timestamp and the dasboard will extract the value after the ':' character and
  display it as the value for the corresponding label
* serverPort - port on which the dashboard listens for connectsion
* title - title for the dashbaord paged (optional)

As a micro-app the dashboard also supports other options like authentication and
tls for the dashboard connection.  See the documentation for the micro-app-framework
for additional details.

The following is an example of the configuration file:

<PRE>
{
  "title": "House Data",
  "serverPort": 3000,
  "mqttServerUrl": ""tcp://10.1.1.1:1883",
  "dashboardEntries": [ {"name": "Inside temp", "topic": "house/temp2"},
                        {"name": "Outside temp", "topic": "house/lacrossTX141/20/temp"},
                        {"name": "Timestamp", "topic": "house/time"} ]
}
</PRE>

# Installation

Simply run npm install micro-app-simple-dashboard

# Running

To run the simple-dashboard app, add node.js to your path (currently requires 4.x or better) and
then run:

<PRE>
npm start
</PRE>

from the directory in the micro-app-simple-dashboard was installed.

Once the server is started. Point your browser at the host/port for the server.
If you have configured your browser to allow javascript to close the current page
the original window will be closed and one with the correct size of the
simple-dashboard app page will be created.


# Example

The following is the page shown for a sample configuration:

![picture of dashboard main window](pictures/dashboard_main_window.jpg?raw=true)

# Key Depdencies

## micro-app-framework
As a micro-app the onetime password app depends on the micro-app-framework:

* [micro-app-framework npm](https://www.npmjs.com/package/micro-app-framework)
* [micro-app-framework github](https://github.com/mhdawson/micro-app-framework)

See the documentation on the micro-app-framework for more information on general
configurtion options that are availble (ex using tls, authentication, serverPort, etc)

# TODO
* option to support different skins
* better/more precise layout

