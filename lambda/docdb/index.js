const { SecretsManager } = require('aws-sdk');
const { MongoClient } = require('mongodb');

let client;

async function initClient(context) {
    context.callbackWaitsForEmptyEventLoop = false;
    if (!client) {
        const secret = await new SecretsManager().getSecretValue({ SecretId: process.env.DB_SECRET }).promise();
        const values = JSON.parse(secret.SecretString);
        const url = `mongodb://${values.username}:${values.password}@${process.env.DB_HOST}:${process.env.DB_PORT}/?ssl=true&ssl_ca_certs=rds-combined-ca-bundle.pem&replicaSet=rs0`
        client = new MongoClient(url);
        await client.connect();
    }
}

async function getData() {
    const db = client.db(process.env.DB_NAME);
    const elements = await db.collection('workshop').find({}).toArray();
    return {
        statusCode: 200,
        body: JSON.stringify(elements),
    };
}

async function addData(id, element) {
    const doc = {...element, _id: id};
    
    const db = client.db(process.env.DB_NAME);
    await db.collection('workshop').insertOne(doc);
    return {
        statusCode: 200,
        body: id,
    };
}

exports.handler = async (event, context) => {
    await initClient(context);
    switch (event.httpMethod) {
        case 'GET':
            return getData();
        case 'POST':
            const element = JSON.parse(event.body);
            return addData(context.awsRequestId, element);
    }
}