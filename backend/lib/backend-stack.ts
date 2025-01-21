import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CDKContext } from '../bin/backend';
import { createTables } from './tables/dynamodb';
import { createAuth } from './auth/cognito';
import { createFunctions } from './compute/functions';
import { createAmplifyHosting } from './hosting/amplify';

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

        console.log(JSON.stringify(context, null, 2))
		const amplifyHosting = createAmplifyHosting(this, {
			appName: appName,
			account: context.env.account,
			branch: context.branch,
			ghOwner: context.hosting.ghOwner,
			ghTokenName: context.hosting.ghTokenName,
			repo: context.hosting.repo,
			environmentVariables: {
				userPoolId: auth.userPool.userPoolId,
				userPoolClientId: auth.userPoolClient.userPoolClientId,
				identityPoolId: auth.identityPool.identityPoolId,
				region: this.region,
				apiUrl: "",
			},
		})


        // DynamoDB
        new cdk.CfnOutput(this, 'UsersTable', {value: DynamoDBTables.usersTable.tableName})
        new cdk.CfnOutput(this, 'FlightsTable', {value: DynamoDBTables.flightsTable.tableName})
        new cdk.CfnOutput(this, 'SeatsTable', {value: DynamoDBTables.seatsTable.tableName})
        // Cognito
        new cdk.CfnOutput(this, 'UserPoolId', {value: auth.userPool.userPoolId})
        new cdk.CfnOutput(this, 'UserPoolClientId', {value: auth.userPoolClient.userPoolClientId})
        // hosting
        new cdk.CfnOutput(this, 'AmplifyAppId', {value: amplifyHosting.appId})
        
    }
}