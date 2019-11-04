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
    
    // TODO

  }
}
