import * as cdk from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as Cognito from "aws-cdk-lib/aws-cognito";
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { IdentityPool, UserPoolAuthenticationProvider } from '@aws-cdk/aws-cognito-identitypool-alpha';
// 

type CreateAuthProps = {
    appName: string;
    usersTable: Table;
    hasCognitoGroups?: boolean;
    groupNames?: string[];
    addUserPostConfirmation: NodejsFunction;
}


export function createAuth(scope: Construct, props: CreateAuthProps){

    const userPool = new Cognito.UserPool(scope, `${props.appName}-UserPool`, {
        userPoolName: `${props.appName}-UserPool`,
        selfSignUpEnabled: true,
        accountRecovery: Cognito.AccountRecovery.PHONE_AND_EMAIL,
        autoVerify: {
            email: true
        },
        passwordPolicy: {
            minLength: 8,
            requireLowercase: false,
            requireUppercase: false,
            requireDigits: false,
            requireSymbols: false
        },
        signInAliases: {
            email: true,
        },
        standardAttributes: {
            email: {
                required: true,
                mutable: false,
            }
        },
        customAttributes: {
            fullname: new Cognito.StringAttribute({ mutable: true, minLen: 3, maxLen: 20 }),
        },
        lambdaTriggers: {
            postConfirmation: props.addUserPostConfirmation,
        },
        removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    const userPoolClient = new Cognito.UserPoolClient(scope, `${props.appName}-UserPoolClient`, {
        userPoolClientName: `${props.appName}-UserPoolClient`,
        userPool: userPool,
        authFlows: {
            userPassword: true,
            userSrp: true,
        },
    })

    const identityPool = new IdentityPool(
        scope,
        `${props.appName}-IdentityPool`,
        {
            identityPoolName:  `${props.appName}-IdentityPool`,
            allowUnauthenticatedIdentities: true,
            authenticationProviders: {
                userPools: [
                    new UserPoolAuthenticationProvider({
                        userPool: userPool,
                        userPoolClient: userPoolClient
                    })
                ]
            },
            
        }
    )

    return { userPool, userPoolClient, identityPool}

}

