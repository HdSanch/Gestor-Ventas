const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMODB_TABLE;

exports.addSale = async (sale) => {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      id: Date.now().toString(),
      ...sale,
    },
  };
  return docClient.put(params).promise();
};

exports.getAllSales = async () => {
  const params = {
    TableName: TABLE_NAME,
  };
  const data = await docClient.scan(params).promise();
  return data.Items;
};
