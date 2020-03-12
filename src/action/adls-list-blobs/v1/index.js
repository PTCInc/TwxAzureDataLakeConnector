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
const constants = require('./../../../common/lib/v1/constants')
const twflog = require('../../../common/lib/v1/twflog').twflog

const logger = require('ptc-flow-sdk').getLogger('adls-list-blobs');

module.exports = function () {
  /*

  This function will receive an input that conforms to the schema specified in
  activity.json. The output is a callback function that follows node's error first
  convention. The first parameter is either null or an Error object. The second parameter
  of the output callback should be a JSON object that conforms to the schema specified
  in activity.json

 */
  this.execute = async function (input, output) {
    twflog('adls-list-blobs', 'Input: '+JSON.stringify(input), 'DEBUG', logger);
    //twflog('adls-list-blobs', 'Shared Key Credentials: account name = ' + input.connection.storageAccountName + ', key = ' + input.connection.storageAccountAccessKey, 'TRACE', logger);

    let outputData = {}
		outputData.entries = new Array();

    if (input && input.containerName && input.containerName.length > 0) {
      const aborter = Aborter.timeout(1 * constants.ONE_MINUTE);
      const credentials = new SharedKeyCredential(input.connection.storageAccountName, input.connection.storageAccountAccessKey);
      const pipeline = StorageURL.newPipeline(credentials);
      const serviceURL = new ServiceURL(`https://${input.connection.storageAccountName}.blob.core.windows.net`, pipeline);
      const containerURL = ContainerURL.fromServiceURL(serviceURL, input.containerName);
			//twflog('adls-list-blobs', 'Service URL: '+JSON.stringify(serviceURL), 'DEBUG', logger);
			//twflog('adls-list-blobs', 'Container URL: '+JSON.stringify(containerURL), 'DEBUG', logger);

			twflog('adls-list-blobs', 'Blobs found in Container: "' + input.containerName + '":', 'DEBUG', logger);
      let marker = undefined;
      do {
        const listBlobsResponse = await containerURL.listBlobFlatSegment(Aborter.none, marker).catch((err) => {
					twflog('adls-list-blobs', 'Error listing Blobs in Container "' + input.containerName + '": '+err.message, 'ERROR', logger);
					return output(err, outputData);
				});
        marker = listBlobsResponse.nextMarker;
        let rowNum = 0;
        for (const blob of listBlobsResponse.segment.blobItems) {
          outputData.entries[rowNum] = {};
          outputData.entries[rowNum].name = blob.name;
          outputData.entries[rowNum].creationTime = blob.properties.creationTime;
          outputData.entries[rowNum].lastModified = blob.properties.lastModified;
          outputData.entries[rowNum].etag = blob.properties.etag;
          outputData.entries[rowNum].contentLength = blob.properties.contentLength;
          outputData.entries[rowNum].contentType = blob.properties.contentType;
          outputData.entries[rowNum].contentEncoding = blob.properties.contentEncoding;
          outputData.entries[rowNum].contentLanguage = blob.properties.contentLanguage;
          outputData.entries[rowNum].contentDisposition = blob.properties.contentDisposition;
          outputData.entries[rowNum].cacheControl = blob.properties.cacheControl;
          outputData.entries[rowNum].blobType = blob.properties.blobType;
          outputData.entries[rowNum].leaseStatus = blob.properties.leaseStatus;
          outputData.entries[rowNum].leaseState = blob.properties.leaseState;
          outputData.entries[rowNum].serverEncrypted = blob.properties.serverEncrypted;
          outputData.entries[rowNum].accessTier = blob.properties.accessTier;
          outputData.entries[rowNum].accessTierChangeTime = blob.properties.accessTierChangeTime;
          outputData.entries[rowNum].lastModified = blob.properties.lastModified;
          outputData.entries[rowNum].lastModified = blob.properties.lastModified;
          outputData.entries[rowNum].Content_CRC6 = blob.properties.Content_CRC6;
          outputData.entries[rowNum].contentMD5_type = blob.properties.contentMD5.type;
          outputData.entries[rowNum].contentMD5_data = blob.properties.contentMD5.data;
					twflog('adls-list-blobs', ` - ${ blob.name }`, 'DEBUG', logger);
          rowNum++;
        }
      } while (marker);
    } else {
			twflog('adls-list-blobs', 'Input must contain a containerName', 'ERROR', logger);
			return output('Input must contain a containerName', null);
    }
		twflog('adls-list-blobs','Output: '+JSON.stringify(outputData), 'DEBUG', logger);

    return output(null, outputData);
  }
}