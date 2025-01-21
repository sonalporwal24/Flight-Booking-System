#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as gitBranch from 'git-branch';
import { BackendStack } from '../lib/backend-stack';
// import { CDKContext } from '../cdk';

export type CDKContext = {
  appName: string
  stage: string
  branch: string
  env: {
      account: string
      region: string
  }
  hosting: {
      ghTokenName: string
      ghOwner: string
      repo: string
  }
}

const app = new cdk.App();

const currentBranch = process.env.AWS_BRANCH || gitBranch.sync();
console.log(`Deploying on branch -> ${currentBranch}`);
const globals = app.node.tryGetContext('globals') || {}
console.log(`Globals -> ${JSON.stringify(globals)}`);
const branchConfig = app.node.tryGetContext(currentBranch);
console.log(`Branch config -> ${JSON.stringify(branchConfig)}`);


if(!branchConfig){
  throw new Error(`No configuration found for branch: ${currentBranch}`)
}

const context: CDKContext & cdk.StackProps = {
  branch: currentBranch,
  ...globals,
  ...branchConfig
}

console.log(`Context -> ${JSON.stringify(context)}`);

const appName = `${context.appName}-${context.stage}`
const stackName = `${appName}-Stack`

new BackendStack(app, stackName, { stackName, env: context.env }, context)
