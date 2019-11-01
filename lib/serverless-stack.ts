import { Stack, Construct } from '@aws-cdk/core';
import { RestApi, LambdaIntegration } from '@aws-cdk/aws-apigateway';
import { env } from 'process';
import { Function, Code, Runtime } from '@aws-cdk/aws-lambda';
import { DatabasesStack } from './databases-stack';
import { Port } from '@aws-cdk/aws-ec2';

export class ServerlessStack extends Stack {

  constructor(scope: Construct, id: string, dbStack: DatabasesStack) {
    super(scope, id, { env: { account: env.CDK_DEFAULT_ACCOUNT, region: env.CDK_DEFAULT_REGION } });

    if (!dbStack.postgres.secret) {
      throw 'missing secret';
    }

    const dynamodbFunction = new Function(this, 'DynamoFunction', {
      code: Code.fromAsset(__dirname + '/../lambda/dynamodb'),
      runtime: Runtime.NODEJS_10_X,
      handler: 'index.handler',
      environment: {
        TABLE_NAME: dbStack.dynamoDbTable.tableName,
      },
    });
    dbStack.dynamoDbTable.grantReadWriteData(dynamodbFunction);
    const dynamodbIntegration = new LambdaIntegration(dynamodbFunction);

    const rdsFunction = new Function(this, 'RDSFunction', {
      code: Code.fromAsset(__dirname + '/../lambda/rds'),
      runtime: Runtime.NODEJS_10_X,
      handler: 'index.handler',
      environment: {
        DB_HOST: dbStack.postgres.dbInstanceEndpointAddress,
        DB_PORT: dbStack.postgres.dbInstanceEndpointPort,
        DB_SECRET: dbStack.postgres.secret.secretArn,
        DB_NAME: 'workshop',
      },
      vpc: dbStack.vpc,
    });
    dbStack.postgres.secret.grantRead(rdsFunction);
    rdsFunction.connections.allowTo(dbStack.postgres, Port.tcp(5432));
    const rdsIntegration = new LambdaIntegration(rdsFunction);

    const api = new RestApi(this, 'API');
    api.root.resourceForPath('/dynamodb').addMethod('GET', dynamodbIntegration);
    api.root.resourceForPath('/dynamodb').addMethod('POST', dynamodbIntegration);

    api.root.resourceForPath('/rds').addMethod('GET', rdsIntegration);
    api.root.resourceForPath('/rds').addMethod('POST', rdsIntegration);

  }
}
