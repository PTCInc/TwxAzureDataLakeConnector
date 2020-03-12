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

const logger = require('ptc-flow-sdk').getLogger('adls-download-blob')

module.exports = function () {
  /*

  This function will receive an input that conforms to the schema specified in
  activity.json. The output is a callback function that follows node's error first
  convention. The first parameter is either null or an Error object. The second parameter
  of the output callback should be a JSON object that conforms to the schema specified
  in activity.json

 */
  this.execute = async function (input, output) {
    twflog('adls-download-blob', 'Input: '+JSON.stringify(input), 'DEBUG', logger);
    //twflog('adls-download-blob', 'Shared Key Credentials: account name = ' + input.connection.storageAccountName + ', key = ' + input.connection.storageAccountAccessKey, 'TRACE', logger);

    let outputData = {}
    let that = this
    let prefixPath = that.$getPath()

    const aborter = Aborter.timeout(1 * constants.ONE_MINUTE);
    const credentials = new SharedKeyCredential(input.connection.storageAccountName, input.connection.storageAccountAccessKey);
    const pipeline = StorageURL.newPipeline(credentials);
    const serviceURL = new ServiceURL(`https://${input.connection.storageAccountName}.blob.core.windows.net`, pipeline);
    const containerURL = ContainerURL.fromServiceURL(serviceURL, input.containerName);
    const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, input.blobName);
    const filename = that.$getPath(input.blobName);
    //twflog('adls-download-blob', 'Service URL: '+JSON.stringify(serviceURL), 'DEBUG', logger);
    //twflog('adls-download-blob', 'Block Blob URL: '+JSON.stringify(blockBlobURL), 'DEBUG', logger);

    async function streamToString(readableStream) {
      return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
          chunks.push(data.toString());
        });
        readableStream.on("end", () => {
          resolve(chunks.join(""));
        });
        readableStream.on("error", reject);
      });
    }

    twflog('adls-download-blob', 'Downloading Blob "' + input.blobName + '" from Container "' + input.containerName + '"...', 'DEBUG', logger);
    const downloadResponse = await blockBlobURL.download(aborter, 0);
    try {
      let writeableStream = fs.createWriteStream(filename);
      downloadResponse.readableStreamBody.pipe(writeableStream);
      writeableStream.on('finish', function (err) {
        if (err) {
					twflog('adls-download-blob','Error: '+err.message, 'ERROR', logger);
          return output(err);
        } else {
          let filename_nw = filename.replace(prefixPath, '')
          // Remove path separator from the start of filename
          if(filename_nw.charAt(0) === path.sep){
            filename_nw = filename_nw.slice(1, filename_nw.length);
          }
					twflog('adls-download-blob','file name: '+filename_nw, 'DEBUG', logger);
					twflog('adls-download-blob','file path: '+that.$getRelativePath(filename), 'DEBUG', logger);
          return output(null, {
            filename: filename_nw,
            filepath: that.$getRelativePath(filename)
          });
        }
      })
    } catch (e) {
			twflog('adls-download-blob','Error: '+e.message, 'ERROR', logger);
      return output('Error in Processing request please try again');
    }
  }
}