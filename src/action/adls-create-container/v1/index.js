/* begin copyright text
 *
 * Copyright © 2019 PTC Inc., Its Subsidiary Companies, and/or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
const {
  Aborter,
  BlockBlobURL,
  ContainerURL,
  ServiceURL,
  SharedKeyCredential,
  StorageURL,
  uploadStreamToBlockBlob,
  uploadFileToBlockBlob
} = require('@azure/storage-blob');

const fs = require("fs");
const path = require("path");
const constants = require('../../../common/lib/v1/constants')
const twflog = require('../../../common/lib/v1/twflog').twflog

const logger = require('ptc-flow-sdk').getLogger('adls-create-container')

module.exports = function () {
  /*

  This function will receive an input that conforms to the schema specified in
  activity.json. The output is a callback function that follows node's error first
  convention. The first parameter is either null or an Error object. The second parameter
  of the output callback should be a JSON object that conforms to the schema specified
  in activity.json

 */
  this.execute = async function (input, output) {
    twflog('adls-create-container', 'Input: '+JSON.stringify(input), 'DEBUG', logger);
    //twflog('adls-create-container', 'Shared Key Credentials: account name = ' + input.connection.storageAccountName + ', key = ' + input.connection.storageAccountAccessKey, 'TRACE', logger);

    let outputData = {}

    const aborter = Aborter.timeout(1 * constants.ONE_MINUTE);
    const credentials = new SharedKeyCredential(input.connection.storageAccountName, input.connection.storageAccountAccessKey);
    const pipeline = StorageURL.newPipeline(credentials);
    const serviceURL = new ServiceURL(`https://${input.connection.storageAccountName}.blob.core.windows.net`, pipeline);
    const containerURL = ContainerURL.fromServiceURL(serviceURL, input.containerName);
    //twflog('adls-create-container', 'Service URL: '+JSON.stringify(serviceURL), 'DEBUG', logger);

    twflog('adls-create-container', 'Creating container "' + input.containerName + '"...', 'DEBUG', logger);
		await containerURL.create(aborter).catch((err) => {
			twflog('adls-create-container', 'Error creating Container "' + input.containerName + '": '+err.message, 'ERROR', logger);
			return output(err, outputData);
		});
		outputData.name = input.containerName;
 		twflog('adls-create-container','Output: '+JSON.stringify(outputData), 'DEBUG', logger);

    return output(null, outputData)
  }
}