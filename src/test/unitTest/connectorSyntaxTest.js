/* eslint-env mocha */
const ConnectorSyntaxTestHelperClass = require('ptc-flow-test-helper').ConnectorSyntaxTestHelper
const connector = require('../../index')
const ConnectorSyntaxTestHelper = new ConnectorSyntaxTestHelperClass(connector)

describe('connectorSyntaxTest', ConnectorSyntaxTestHelper.tests())
