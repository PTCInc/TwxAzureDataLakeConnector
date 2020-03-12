# ThingWorx Flow Connector for Azure Data Lake Storage

This is a quick start guide to using the ThingWorx Flow Connector for Azure Data Lake Storage (ADLS).

## About

Azure Storage is a Microsoft-managed service providing cloud storage that is highly available, secure, durable, scalable, and redundant. This connector allows you to interact with and manipulate the unstructured data stored in Azure Data Lake Storage Gen2 including the listing of Containers and Blobs, the creation and deletion of Containers, the upload and download of Blobs, and the deletion of Blobs. The initial release only works with Containers for Blob Storage and do not yet work with File Shares, Tables, or Queues. Authentication is performed via a shared key.

The connector runs in ThingWorx Flow and is built on node.js and utilizes Microsoft’s Azure Storage libraries for JavaScript. The connector is intended to work similarly to other storage providers like Box, Dropbox, Google Drive, and OneDrive.

## Installation from ZIP file

1. Download the latest version of the connector from [dist/ptc-adls-connector-1-0-0.zip](dist/ptc-adls-connector-1-0-0.zip)
2. Open a shell or terminal window on the ThingWorx Flow server.
3. Copy the ptc-adls-connector-1-0-0.zip file to any directory.
4. Unzip the ptc-adls-connector-1-0-0.zip file:
```bash
unzip ptc-adls-connector-1-0-0.zip
```
5. Change into the ptc-adls-connector directory:
```bash
cd ptc-adls-connector
```
6. Run the following command to deploy the custom connector package to the ThingWorx Flow installation directory:
```bash
flow-deploy connector --sourceDir . --targetDir <ThingWorx_Flow_Install_Directory> --allow_schema_overwrite
```
7. Run the following command to load connector metadata into the ThingWorx Flow server:
```bash
flow-deploy migrate -u <Username_for_ThingWorx_Flow_Database> -p <Password_for_ThingWorx_Flow_Database> --sourceDir <ThingWorx_Flow_Install_Directory>
```

## Installation from Source

1. Download the latest version of the connector from [src](src)
2. Open a shell or terminal window on the ThingWorx Flow server.
3. Change into the ptc-adls-connector directory containing the source files:
```bash
cd ptc-adls-connector
```
4. Run the following command to install the node.js modules:
```bash
npm install
```
5. Run the following command to deploy the custom connector package to the ThingWorx Flow installation directory:
```bash
flow-deploy connector --sourceDir . --targetDir <ThingWorx_Flow_Install_Directory> --allow_schema_overwrite
```
6. Run the following command to load connector metadata into the ThingWorx Flow server:
```bash
flow-deploy migrate -u <Username_for_ThingWorx_Flow_Database> -p <Password_for_ThingWorx_Flow_Database> --sourceDir <ThingWorx_Flow_Install_Directory>
```

## Documentation

Detailed documentation is in the [ThingWorx Flow Connector for Azure Data Lake Storage User Guide](docs/ADLS%20Flow%20Connector%20User%20Guide%20v1.0.0.pdf)
