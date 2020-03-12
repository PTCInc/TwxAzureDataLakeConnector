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

const logger = require('ptc-flow-sdk').getLogger('adls-list-containers')

module.exports = function () {
  /*

  This function will receive an input that conforms to the schema specified in
  activity.json. The output is a callback function that follows node's error first
  convention. The first parameter is either null or an Error object. The second parameter
  of the output callback should be a JSON object that conforms to the schema specified
  in activity.json

 */
  this.execute = async function (input, output) {
    twflog('adls-list-containers', 'Input: '+JSON.stringify(input), 'DEBUG', logger);
    //twflog('adls-list-containers', 'Shared Key Credentials: account name = ' + input.connection.storageAccountName + ', key = ' + input.connection.storageAccountAccessKey, 'TRACE', logger);

    let outputData = {}
		outputData.entries = new Array();

    const aborter = Aborter.timeout(1 * constants.ONE_MINUTE);
    const credentials = new SharedKeyCredential(input.connection.storageAccountName, input.connection.storageAccountAccessKey);
    const pipeline = StorageURL.newPipeline(credentials);
    const serviceURL = new ServiceURL(`https://${input.connection.storageAccountName}.blob.core.windows.net`, pipeline);
    //twflog('adls-list-containers', 'Service URL: '+JSON.stringify(serviceURL), 'DEBUG', logger);

    twflog('adls-list-containers', 'Containers Found:', 'DEBUG', logger);
    let marker = undefined;
    do {
      const listContainersResponse = await serviceURL.listContainersSegment(aborter, marker).catch((err) => {
					twflog('adls-list-containers', 'Error listing Containers: '+err.message, 'ERROR', logger);
					return output(err, outputData);
				});
      marker = listContainersResponse.nextMarker;
			let rowNum = 0;
      for(let container of listContainersResponse.containerItems) {
        outputData.entries[rowNum] = {};
        outputData.entries[rowNum].name = container.name;
        outputData.entries[rowNum].lastModified = container.properties.lastModified;
        outputData.entries[rowNum].etag = container.properties.etag;
        outputData.entries[rowNum].leaseStatus = container.properties.leaseStatus;
        outputData.entries[rowNum].leaseState = container.properties.leaseState;
        outputData.entries[rowNum].hasImmutabilityPolicy = container.properties.hasImmutabilityPolicy;
        outputData.entries[rowNum].hasLegalHold = container.properties.hasLegalHold;
        outputData.entries[rowNum].DefaultEncryptionScope = container.properties.DefaultEncryptionScope;
        outputData.entries[rowNum].DenyEncryptionScopeOverride = container.properties.DenyEncryptionScopeOverride;
				twflog('adls-list-containers', ` - ${ container.name }`, 'DEBUG', logger);
        rowNum++;
      }
    } while (marker);
		twflog('adls-list-containers','Output: '+JSON.stringify(outputData), 'DEBUG', logger);

    return output(null, outputData)
  }
}