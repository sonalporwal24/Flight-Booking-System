// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as gitBranch from 'git-branch';
import cdkOutput from '../cdk-outputs.json';
import cdkContext from '../backend/cdk.context.json';

console.log(cdkContext); // globals->appName
// const currentBranch = process.env.AWS_BRANCH || gitBranch.sync();

const output = cdkOutput[`FBS-Dev-Stack`]

export const config = {
	Auth: {
		Cognito: {
			userPoolId: process.env.userPoolId || output.UserPoolId,
			userPoolClientId: process.env.userPoolClientId || output.UserPoolClientId,
		},
	}
}
