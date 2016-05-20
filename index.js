/**
 * IoT Garden project: Use Tessel, PubNub and Freeboard for IoT Gardening
 **/

var DEFAULT_SENSOR_READ_TIMEOUT = 1000;
var DEFAULT_PUBLISH_INTERVAL = 2000;

var logger = require('./log.js');

var Promise = require('promise');
var tessel = require('tessel');
var pubnub = require("pubnub")({
    ssl: true, // <- enable TLS Tunneling over TCP
    publish_key: "pub-c-0c2d32c6-a911-44ad-b03b-d17254ca1b2c",
    subscribe_key: "sub-c-a45b739c-1dae-11e6-9a17-0619f8945a4f"
});
var utils = require('./utils.js');


var roomChannel = "myIotGarden-roomSensors";

// Load all types of available sensors
var TemperatureSensor = require('./sensors/temperature.js');
var HumiditySensor = require('./sensors/humidity.js');

// Configure room sensors
var roomTemperatureSensor = new TemperatureSensor(tessel, 'temperature', {});
var roomHumiditySensor = new HumiditySensor(tessel, 'humidity', {
    timeout: 3000
});
var roomLuminositySensor = new TemperatureSensor(tessel, 'luminosity', {});

var roomSensors = [roomTemperatureSensor, roomHumiditySensor, roomLuminositySensor];

// Configure plant sensors
// ...



logger.info('Starting IoT Garden: ' + roomChannel);
Promise.all(roomSensors.map(function(sensor) {
    return sensor.init()
})).then(function() {
    logger.info('All room sensors initalized');
});



function publishCallback(channel, messagePublished, response) {
    logger.debug(messagePublished);
}

/**
 * Returns a promise that automatically resolves after n milliseconds
 **/
function delay(time) {
    return new Promise(function(fulfill) {
        setTimeout(fulfill, time);
    });
}

/**
 * Wraps a promise to automatically resolve to a default value after a timeout.
 **/
function timeout(promise, time, defaultValue) {
    return Promise.race([promise, delay(time).then(function(fulfill, reject) {
        return reject('Timeout after ' + time + 'ms');
    })]);
}


/**
 * Main routine - reads all available sensor data and publishes data object to
 * messaging service.
 **/
var pollAndPublishAllSensors = function() {
    var roomSensorData = {};
    var plantsSensorData = {};


    // Ok, let's look at this:
    // 1. on every roomSensor, a promise is constructed that
    //   a.) calls readData() for measurement
    //   b.) may time out after DEFAULT_SENSOR_READ_TIMEOUT (or sensor.options.timeout if specified)
    //   c.) after successful sensor read, result is stored in roomSensorData object.
    //   d.) if the sensor timed out, the key/value os ommited from the data object
    var p = roomSensors.map(function(sensor) {
        return timeout(sensor.readData(), sensor.options.timeout || DEFAULT_SENSOR_READ_TIMEOUT)
            .then(function(result) {
              logger.debug('Sensor %s : %s', sensor.name, result);
                roomSensorData[sensor.name] = result;
            }, function(rejected) {
                logger.warn('Timeout reading sensor ' + sensor.name);
            })
    });

    // Wait until all promises have been resolved (in parallel),
    // then publish data to messaging service
    Promise.all(p).then(function() {
        // create message + publish
        var message = {
            name: roomChannel,
            time: null,
            roomSensorData: roomSensorData,
            plantsSensorData: plantsSensorData
        }

//        pubnub.time(function(time) {
            // message timestamp
            message.time = new Date();
            // publish message
            pubnub.publish({
                channel: roomChannel,
                message: message,
                callback: function(m) {
                    publishCallback(roomChannel, message, m);
                }
            })
        //});
    });


}

setInterval(pollAndPublishAllSensors, DEFAULT_PUBLISH_INTERVAL);
