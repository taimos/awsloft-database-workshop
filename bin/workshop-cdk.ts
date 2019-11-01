#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { WorkshopCdkStack } from '../lib/workshop-cdk-stack';

const app = new cdk.App();
new WorkshopCdkStack(app, 'WorkshopCdkStack');
