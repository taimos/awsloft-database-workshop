import { Stack, Construct, RemovalPolicy } from '@aws-cdk/core';
import { Table, BillingMode, AttributeType } from '@aws-cdk/aws-dynamodb';
import { DatabaseInstance, DatabaseInstanceEngine } from '@aws-cdk/aws-rds';
import { CfnDBInstance, CfnDBCluster, CfnDBSubnetGroup } from '@aws-cdk/aws-docdb';
import { env } from 'process';
import { InstanceType, InstanceClass, InstanceSize, Vpc, IVpc, SecurityGroup } from '@aws-cdk/aws-ec2';

export class DatabasesStack extends Stack {

  public readonly dynamoDbTable: Table;
  public readonly vpc: IVpc;
  public readonly postgres: DatabaseInstance;
  public readonly docSG: SecurityGroup;
  public readonly docCluster: CfnDBCluster;

  constructor(scope: Construct, id: string) {
    super(scope, id, { env: { account: env.CDK_DEFAULT_ACCOUNT, region: env.CDK_DEFAULT_REGION } });

    this.vpc = new Vpc(this, 'VPC', {
      natGateways: 1,
    });

    this.dynamoDbTable = new Table(this, 'DynamoDB', {
      // TODO
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.postgres = new DatabaseInstance(this, 'Postgres', {
      // TODO
      removalPolicy: RemovalPolicy.DESTROY,
    });

    if (!this.postgres.secret) {
      throw 'invalid config';
    }

    this.docSG = new SecurityGroup(this, 'DocSG', {
      vpc: this.vpc,
      allowAllOutbound: true,
      description: 'DocumentDB',
    });

    const subnets = new CfnDBSubnetGroup(this, 'DocDBSubnets', {
      dbSubnetGroupDescription: 'Subnet group for DocumentDB',
      subnetIds: // TODO
    });

    this.docCluster = new CfnDBCluster(this, 'DocDBCluster', {
      // TODO
    });

    new CfnDBInstance(this, 'Instance', {
      // TODO
    });

  }
}
