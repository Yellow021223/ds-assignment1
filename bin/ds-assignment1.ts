#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DsAssignment1Stack } from '../lib/ds-assignment1-stack';

const app = new cdk.App();
new DsAssignment1Stack(app, 'DsAssignment1Stack', {env: {region: 'eu-west-1'}});