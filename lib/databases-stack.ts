import { Stack, Construct } from '@aws-cdk/core';
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
      instanceClass: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
      masterUsername: 'master',
      vpc: this.vpc,
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
      subnetIds: this.vpc.privateSubnets.map(subnet => subnet.subnetId),
    });

    this.docCluster = new CfnDBCluster(this, 'DocDBCluster', {
      vpcSecurityGroupIds: [this.docSG.securityGroupId],
      dbSubnetGroupName: subnets.ref,
      availabilityZones: this.vpc.availabilityZones,
      masterUsername: this.postgres.secret.secretValueFromJson('username').toString(),
      masterUserPassword: this.postgres.secret.secretValueFromJson('password').toString(),
    });

    new CfnDBInstance(this, 'Instance', {
      dbClusterIdentifier: this.docCluster.ref,
      availabilityZone: this.vpc.availabilityZones[0],
      dbInstanceClass: 'db.r5.large',
    });

  }
}
