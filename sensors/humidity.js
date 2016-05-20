var Promise = require('promise');
var logger=require('../log.js');


var SHT31_I2C_ADDRESS = 0x44;
var SHT31_MEAS_HIGHREP = [0x24, 0x00];

/**
 *
 *
 **/
var _readDataPromise = function() {
  var self = this;
    return new Promise(function(fulfill, reject) {
        var p = self.writeI2C(SHT31_MEAS_HIGHREP)
            .then(self.delay(500))
            .then(self.readI2C(1));

        return p;
    });
};

function readI2C(numBytes) {
    var self = this;
    return new Promise(function(fulfill, reject) {
        self.i2c.read(numBytes, function(err, data) {
            if (err) {
                return reject(err);
            }

            logger.debug('read from I2C: ' + data);
            fulfill(data);
        });
    });
}

function writeI2C(cmd) {
    var self = this;
    return new Promise(function(fulfill, reject) {
        self.i2c.send(Buffer.from(cmd), function(err, rx) {
            if (err) {
                reject(err);
            } else {
                fulfill(rx);
            }
        });
    });
}

/**
 * Returns a promise that resolves upon successful sensor init
 **/
var _initPromise = function() {
    var self = this;
    return new Promise(function(fulfill, reject) {

        logger.info('Initalize sensor \'%s\'',self.name);
        if (!self.tessel) {
            return reject('Sensor not attached to a tessel object');
        }

        self.port = self.tessel.port['A'];
        self.i2c = new self.port.I2C(SHT31_I2C_ADDRESS);

        fulfill(self);
    })
};




function Sensor(tesselObj, name, options) {
    this.tessel = tesselObj;
    this.name = name;
    this.options = options;
}

Sensor.prototype.readData = _readDataPromise;
Sensor.prototype.init = _initPromise;

module.exports = Sensor;
