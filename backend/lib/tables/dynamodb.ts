import * as cdk from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

type TablesProps = {
    appName: string
} 

export function createTables(scope: Construct, props: TablesProps){

    const usersTable = new Table(scope, `${props.appName}-UsersTable`, {
        partitionKey: { name: 'UserID', type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    usersTable.addGlobalSecondaryIndex({
        indexName: 'usernameIndex',
        partitionKey: {
            name: 'Username',
            type: AttributeType.STRING
        }
    })


    const flightsTable = new Table(scope, `${props.appName}-FlightsTable`, {
        partitionKey: { name: 'FlightID', type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
    })


    const seatsTable = new Table(scope, `${props.appName}-SeatsTable`, {
        partitionKey: {
            name: 'FlightID',
            type: AttributeType.STRING
        },
        sortKey: {
            name: 'SeatID',
            type: AttributeType.STRING
        },
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    seatsTable.addGlobalSecondaryIndex({
        indexName: 'IsBookedIndex',
        partitionKey: {
            name: 'IsBooked',
            type: AttributeType.STRING
        }
    })

    return {usersTable, flightsTable, seatsTable}

}