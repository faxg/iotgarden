var tessel = require('tessel');
var Promise = require('promise');

function delay(time) {
    return new Promise(function(fulfill) {
        setTimeout(fulfill, time);
    });
}

function writePin(pin, value) {
    return new Promise(function(fulfill, reject) {
        pin.write(value, function(err, result) {
            if (result) {
                fulfill(result);
            } else {
                reject(err);
            };
        });
    });
};

function readPinAnalog(pin) {
    return new Promise(function(fulfill, reject) {
        pin.analogRead(function(err, result) {
            if (result) {
                console.log('read: ' + result);
                fulfill(result);
            } else {
                reject(err);
            };
        });
    });
};

var pin = tessel.port.B.pin[7]; // select pin 2 on port A
//Sensor DHT22

function toBytesInt32(num) {
    var arr = new ArrayBuffer(5); // an Int32 takes 4 bytes
    view = new DataView(arr);
    view.setUint32(0, num, false); // byteOffset = 0; litteEndian = false

    var int8View = new Int8Array(arr);
    console.log(int8View[0].toString(16) + ' ' + int8View[1].toString(16) + ' ' + int8View[2].toString(16) + ' ' + int8View[3].toString(16) + ' ')

    return int8View;
}


function getHumidity(value) {
    var bytes = toBytesInt32(value);
    var byte0 = bytes[0];
    var byte1 = bytes[1];

    var humidity = (((byte0 * 256) + byte1) * 0.1);
}

function getTemperature(value) {
    var bytes = toBytesInt32(value);

    var byte2 = bytes[2];
    var byte3 = bytes[3];

    var temperature = (((byte2 & 0x7F) * 256) + byte3) * 0.1;
    if (byte2 & 0x80) {
        temperature *= -1;
    }
    return (temperature - 32) * 0.55555; // F to °C
}

// https://github.com/adafruit/DHT-sensor-library/blob/master/DHT.cpp

setInterval(function() {
    var rawData = undefined;
    var p = Promise.resolve()
        .then(function() {
            console.log('starting')
        })
        .then(writePin(pin, 1))
        .then(delay(250))
        .then(writePin(pin, 0))
        .then(delay(20))
        .then(writePin(pin, 1))
        .then(delay(40))
        
        .then(readPinAnalog(pin)
            .then(function(value) {
                console.log(value);
                console.log('Temperature: ' + getTemperature(value) + ' Humidity: ' + getHumidity(value));
            }));


    // var p = Promise.resolve().then(
    //     delay(1000).then(
    //         writePin(pin, 1).then(
    //             delay(500).then(
    //                 writePin(pin, 0).then(
    //                     delay(20).then(
    //                         readPinAnalog(pin, function(value) {
    //                             rawData = value;
    //                             console.log('Temperature: ' + getTemperature(value) + ' Humidity: ' + getHumidity(value));
    //                         })
    //                     ))))));
}, 2000);
