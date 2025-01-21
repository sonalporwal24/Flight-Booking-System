import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import path = require('path');

type CreateFunctionsProps = {
    appName: string;
    usersTable: Table;
}

export function createFunctions(scope: Construct, props: CreateFunctionsProps){

    const addUserToTableFunc = new NodejsFunction(scope, `${props.appName}-AddUserToTableFunc`, {
        functionName: 'addUserFunc',
        runtime: Runtime.NODEJS_18_X,
        handler: "handler",
        entry: path.join(
            __dirname,
            './func/AddUserPostConfirmation/index.ts'
        ),
        environment: {
            USERS_TABLE_NAME: props.usersTable.tableName
        }
    });

    addUserToTableFunc.addToRolePolicy(new iam.PolicyStatement({
        actions: [
            'dynamodb:PutItem'
        ],
        resources: [
            props.usersTable.tableArn as string
        ]
    }))

    return { addUserToTableFunc }

}