var Promise = require('promise');
var logger=require('../log.js');

var _readDataPromise = function() {
    var self = this;
    return new Promise (function(fulfill, reject){
      // Fake: random temperature
      var result = Math.floor(Math.random() * 33) + 10;
      fulfill(result);
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
