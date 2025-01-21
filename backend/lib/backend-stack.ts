import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CDKContext } from '../bin/backend';

export class BackendStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: cdk.StackProps, context: CDKContext){
        super(scope, id, props);

        const appName = `${context.appName}-${context.stage}`;
        console.log(`AppName -> ${appName}`)
        
    }
}