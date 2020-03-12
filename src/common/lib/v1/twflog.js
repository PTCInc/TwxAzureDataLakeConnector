/* begin copyright text
 *
 * Copyright © 2019 PTC Inc., Its Subsidiary Companies, and/or its Partners. All Rights Reserved.
 *
 * end copyright text
 */

/**
 * Enhanced logging.  This will invoke the logger from the ptc-flow-sdk and it will
 * also log to the console for node.js.  The console log appears in the file
 * $FLOWINSTALLDIR/.pm2/logs/flow-engine-out-x.log.
 * Usage examples:
 *   const twflog = require('../../../common/lib/v1/twflog').twflog
 *   const logger = require('ptc-flow-sdk').getLogger('my-action')
 *   twflog('my-action', 'my debug message',   'DEBUG', logger); // prints "my debug message" at the DEBUG level
 *   twflog('my-action', 'my info message',    'INFO',  logger); // prints "my info message" at the INFO level
 *   twflog('my-action', 'my warning message', 'WARN',  logger); // prints "my warning message" at the WARN level
 *   twflog('my-action', 'my error message',   'ERROR', logger); // prints "my error message" at the ERROR level
 */
const twflog = function twflog(origin, content, logLevel, logger) {
	var now = new Date().toISOString();
    logLevel = typeof logLevel !== 'undefined' ? logLevel : "DEBUG";
    if (origin !== '') {
        origin = '[' + origin + '] ';
    } else {
			origin = '[unknown] ';
		}
    console.log('[' + now + '] [' + logLevel.toUpperCase().padEnd(5) + '] ' + origin + content);
    if (logger) {
        switch (logLevel.toUpperCase()) {
            case 'TRACE' :
                logger.debug(content); // no trace()
                break;
            case 'DEBUG' :
                logger.debug(content);
                break;
            case 'INFO' :
                logger.info(content);
                break;
            case 'WARN' :
                logger.warn(content);
                break;
            case 'ERROR' :
                logger.error(content);
                break;
            case 'FATAL' :
                logger.error(content); // no fatal()
                break;
        }
    }
}

 module.exports = {
    twflog: twflog
 }