import { Stack, Construct } from '@aws-cdk/core';
import { Table, BillingMode, AttributeType } from '@aws-cdk/aws-dynamodb';
import { DatabaseInstance, DatabaseInstanceEngine } from '@aws-cdk/aws-rds';
import { env } from 'process';
import { InstanceType, InstanceClass, InstanceSize, Vpc, IVpc } from '@aws-cdk/aws-ec2';

export class DatabasesStack extends Stack {
  
  public readonly dynamoDbTable: Table;
  public readonly vpc: IVpc;
  public readonly postgres: DatabaseInstance;

  constructor(scope: Construct, id: string) {
    super(scope, id, { env: { account: env.CDK_DEFAULT_ACCOUNT, region: env.CDK_DEFAULT_REGION } });

    this.vpc = new Vpc(this, 'VPC', {
      natGateways: 1,
    });

    this.dynamoDbTable = new Table(this, 'DynamoDB', {
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
    });

    this.postgres = new DatabaseInstance(this, 'Postgres', {
      allocatedStorage: 5,
      databaseName: 'workshop',
      engine: DatabaseInstanceEngine.POSTGRES,
      engineVersion: '11.5',
      instanceClass: InstanceType.of(InstanceClass.T3,InstanceSize.MICRO),
      masterUsername: 'master',
      vpc: this.vpc,
    });
  }
}
