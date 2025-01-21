import { PostConfirmationConfirmSignUpTriggerEvent } from "aws-lambda";
import { ulid } from "ulidx";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({
    region: "ap-south-1"
});

exports.handler = async(event: PostConfirmationConfirmSignUpTriggerEvent) => {

    console.log("====================================")
    console.log("Event...", JSON.stringify(event, null, 2))
    console.log("====================================")
    console.log("Environment...", JSON.stringify(process.env, null, 2))

    const userId = ulid();
    const date = new Date();
    const isoDate = new Date().toISOString();
    const username = event.userName;

    const command = new PutItemCommand({
        TableName: process.env.USERS_TABLE_NAME,
        Item: marshall({
            UserID: userId,
            createdAt: isoDate,
            updatedAt: isoDate,
            email: event.request.userAttributes.email,
            name: event.request.userAttributes.name,
            Username: username
        }),
        ConditionExpression: "attribute_not_exists(UserID) AND attribute_not_exists(email)"
    });

    try {
        await client.send(command)
        return event
    } catch (error) {
        throw error
    }

}