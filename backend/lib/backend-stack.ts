import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CDKContext } from '../bin/backend';
import { createTables } from './tables/dynamodb';
import { createAuth } from './auth/cognito';
import { createFunctions } from './compute/functions';

export class BackendStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: cdk.StackProps, context: CDKContext){
        super(scope, id, props);

        const appName = `${context.appName}-${context.stage}`;
        console.log(`AppName -> ${appName}`)

        // DynamoDB Setup
        const DynamoDBTables = createTables(this, {appName: appName});

        const computeStack = createFunctions(this, {
            appName: appName,
            usersTable: DynamoDBTables.usersTable,
        });

        // Cognito Setup
        const auth = createAuth(this, {
            appName: appName, 
            usersTable: DynamoDBTables.usersTable,
            // hasCognitoGroups: true,
            // groupNames: ['Admin', 'Management'],
            addUserPostConfirmation: computeStack.addUserToTableFunc
        });


        // DynamoDB
        new cdk.CfnOutput(this, 'UsersTable', {value: DynamoDBTables.usersTable.tableName})
        new cdk.CfnOutput(this, 'FlightsTable', {value: DynamoDBTables.flightsTable.tableName})
        new cdk.CfnOutput(this, 'SeatsTable', {value: DynamoDBTables.seatsTable.tableName})
        // Cognito
        new cdk.CfnOutput(this, 'UserPoolId', {value: auth.userPool.userPoolId})
        new cdk.CfnOutput(this, 'UserPoolClientId', {value: auth.userPoolClient.userPoolClientId})
        
    }
}