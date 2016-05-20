var winston = require('winston');
// var Loggly = require('winston-loggly').Loggly;
// var loggly_options={ subdomain: "mysubdomain", inputToken: "efake000-000d-000e-a000-xfakee000a00" }
// logger.add(Loggly, loggly_options);
//logger.add(logger.transports.File, { filename: "./development.log" });
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
      level: 'debug',
      colorize: true,
      humanReadableUnhandledException: true,

    })
  ]
});

module.exports=logger;
