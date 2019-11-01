#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { DatabasesStack } from '../lib/databases-stack';
import { ServerlessStack } from '../lib/serverless-stack';

const app = new cdk.App();

const databases = new DatabasesStack(app, 'loft-databases');

new ServerlessStack(app, 'loft-serverless', databases);