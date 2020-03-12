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

const streamifier = require('streamifier');
const fs = require("fs");
const path = require("path");
const constants = require('../../../common/lib/v1/constants')
const twflog = require('../../../common/lib/v1/twflog').twflog

const logger = require('ptc-flow-sdk').getLogger('adls-upload-blob')

module.exports = function () {
  /*

  This function will receive an input that conforms to the schema specified in
  activity.json. The output is a callback function that follows node's error first
  convention. The first parameter is either null or an Error object. The second parameter
  of the output callback should be a JSON object that conforms to the schema specified
  in activity.json

 */
  this.execute = async function (input, output) {
    twflog('adls-upload-blob', 'Input: '+JSON.stringify(input), 'DEBUG', logger);
    //twflog('adls-upload-blob', 'Shared Key Credentials: account name = ' + input.connection.storageAccountName + ', key = ' + input.connection.storageAccountAccessKey, 'TRACE', logger);

    let outputData = {}

    const aborter = Aborter.timeout(1 * constants.ONE_MINUTE);
    const credentials = new SharedKeyCredential(input.connection.storageAccountName, input.connection.storageAccountAccessKey);
    const pipeline = StorageURL.newPipeline(credentials);
    const serviceURL = new ServiceURL(`https://${input.connection.storageAccountName}.blob.core.windows.net`, pipeline);
    const containerURL = ContainerURL.fromServiceURL(serviceURL, input.containerName);
    const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, input.blobName);
    //twflog('adls-upload-blob', 'Service URL: '+JSON.stringify(serviceURL), 'DEBUG', logger);
    //twflog('adls-upload-blob', 'Block Blob URL: '+JSON.stringify(blockBlobURL), 'DEBUG', logger);

    twflog('adls-upload-blob', 'Uploading Blob "' + input.blobName + '" to Container "' + input.containerName + '"...', 'DEBUG', logger);
    const buffer = Buffer.from(input.data, input.encoding);
    const stream = streamifier.createReadStream(buffer);
    const uploadOptions = {
        bufferSize: constants.ONE_MEGABYTE * 4,
        maxBuffers: 5,
    };
  
    await uploadStreamToBlockBlob(
        aborter, 
        stream, 
        blockBlobURL, 
        uploadOptions.bufferSize, 
        uploadOptions.maxBuffers)
      .then(() => {
				twflog('adls-upload-blob', 'Successfully uploaded Blob "' + input.blobName + '" to Container "' + input.containerName + '"', 'DEBUG', logger);
      })
      .catch((err) => {
        twflog('adls-upload-blob', 'Error uploading Blob "' + input.blobName + '" to Container "' + input.containerName + '": '+err.message, 'ERROR', logger);
  			return output(err, outputData);
      });
		outputData.name = input.blobName;
    twflog('adls-upload-blob','Output: '+JSON.stringify(outputData), 'DEBUG', logger);

    return output(null, outputData)
  }
}