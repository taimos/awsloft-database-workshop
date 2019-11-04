const { Client } = require('pg');
const { SecretsManager } = require('aws-sdk');

let client;

async function initClient(context) {
    context.callbackWaitsForEmptyEventLoop = false;
    if (!client) {
        // TODO
    }
}

async function getData() {
    const res = await client.query('SELECT * FROM data')
    return {
        statusCode: 200,
        body: JSON.stringify(res.rows),
    };
}

async function addData(id, element) {
    await client.query('CREATE TABLE IF NOT EXISTS data (id VARCHAR(255), foo VARCHAR(255))');
    await client.query('INSERT INTO data (id, foo) VALUES ($1, $2)', [id, element.foo]);
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