/* begin copyright text
 *
 * Copyright © 2019 PTC Inc., Its Subsidiary Companies, and/or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
const {
  Aborter,
  ServiceURL,
  SharedKeyCredential,
  StorageURL
} = require('@azure/storage-blob');

const constants = require('../../../../common/lib/v1/constants')
const twflog = require('../../../../common/lib/v1/twflog').twflog
const logger = require('ptc-flow-sdk').getLogger('adls-list-containers')

/*
  Implementation for a  non-oauth based connection
  The input passed in matches the input schema specifieed in connection.json
  The output argument is a callback that follows node's error first convention. The first paramter is either an
  error object or null. If the first argument is null the second should contain the json output data.
 */
module.exports = {
  connect: function (input, output) {
    return output(null, {
      handle: {
        storageAccountName: input.storageAccountName,
        storageAccountAccessKey: input.storageAccountAccessKey
      }
    })
  },

  /**
    Check if it is possible to connect to the system using the given connection
   */
  validate: async function (input, options, output) {
		twflog('adls-sharedkey', 'Attempting to validate shared key connection...', 'DEBUG', logger);
    // connect to the external system and validate connectivity
		const aborter = Aborter.timeout(1 * constants.ONE_MINUTE);
    const credentials = new SharedKeyCredential(input.storageAccountName, input.storageAccountAccessKey);
    const pipeline = StorageURL.newPipeline(credentials);
    const serviceURL = new ServiceURL(`https://${input.storageAccountName}.blob.core.windows.net`, pipeline);
		const props = await serviceURL.getProperties(aborter).then(res => output(null, {'result': 'account name = ' + input.storageAccountName + ', access key = ' + input.storageAccountAccessKey}, null)).catch((err) => {
			twflog('adls-sharedkey', 'Error validating shared key connection: '+err.message, 'ERROR', logger);
			return output(err);
		});
  }
}
