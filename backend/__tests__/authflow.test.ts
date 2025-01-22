import * as cognito from "@aws-sdk/client-cognito-identity-provider";
import Chance from "chance";
import cdkOutput from '../../cdk-outputs.json';
import * as dotenv from "dotenv";
dotenv.config();

// npm i @aws-sdk/client-cognito-identity-provider

const cognitoClient = new cognito.CognitoIdentityProviderClient({
    region: "ap-south-1"
});

const change = new Chance();

let firstName: string | undefined;

const loadEnvironmentVariables = () => {
    
    console.log(cdkOutput); 

    const output = cdkOutput[`FBS-Dev-Stack`]

    const config = {
        Auth: {
            Cognito: {
                UserPoolId: process.env.UserPoolId || output.UserPoolId,
                UserPoolClientId: process.env.UserPoolClientId || output.UserPoolClientId,
            },
        }
    }

    return config
}

const createUser = () => {
    const firstName = change.first({nationality: "en"});
    const lastName = change.last({nationality: "en"});
    const suffix = change.string({length: 4, pool: "abcdefghijklmnopqrstuvwxyz"});
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${suffix}@firststeppublicschool.com`;
    const password = change.string({length: 10, pool: "abcdefghijklmnopqrstuvwxyz"});
    return {
        email,
        password,
        fullname: `${firstName} ${lastName}`,
    }
}

describe("Auth Test Flow", () => {
    let email: string | undefined;
    let password: string | undefined;
    let fullname: string | undefined;
    let userPoolId: string | undefined;
    let clientId: string | undefined;

    beforeAll(async () => {
        const config = loadEnvironmentVariables();
        const user = createUser();
        email = user.email;
        password = user.password;
        fullname = user.fullname;
        userPoolId = config.Auth.Cognito.UserPoolId;
        clientId = config.Auth.Cognito.UserPoolClientId;
    });

    it("User exist in User Pool and user's tool", async() => {
        console.log("email signing up -> ", email, fullname);
        const signUpCommand = new cognito.SignUpCommand({
            ClientId: clientId,
            Username: email,
            Password: password,
            UserAttributes: [
                {
                    Name: "name",
                    Value: fullname
                }
            ]
        })

        const signUpResponse = await cognitoClient.send(signUpCommand);

        const userSub = signUpResponse.UserSub;

        console.log("User Sub ", userSub)

        const adminCommand: cognito.AdminConfirmSignUpCommandInput = {
            UserPoolId: userPoolId as string,
            Username: userSub as string
        }

        try {
            await cognitoClient.send(
                new cognito.AdminConfirmSignUpCommand(adminCommand)
            )
        } catch (error) {
            console.log("Error confirming user sign up", error);
        }

    })

    

})
