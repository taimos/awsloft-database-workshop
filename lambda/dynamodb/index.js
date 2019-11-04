const AWS = require('aws-sdk');

const tableName = process.env.TABLE_NAME;
const dynamoClient = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION });

async function getData() {
    const elements = [];

    // TODO

    return {
        statusCode: 200,
        body: JSON.stringify(elements),
    };
}

async function addData(id, element) {
    await dynamoClient.put({
        TableName: tableName,
        Item: { ...element, id },
    }).promise();
    return {
        statusCode: 200,
        body: id,
    };
}

exports.handler = async (event, context) => {
    switch (event.httpMethod) {
        case 'GET':
            return getData();
        case 'POST':
            const element = JSON.parse(event.body);
            return addData(context.awsRequestId, element);
    }
}