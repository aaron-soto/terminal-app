const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");

// Set the AWS region
AWS.config.update({ region: "us-west-1" });

const secretsManager = new AWS.SecretsManager();

secretsManager.getSecretValue(
  { SecretId: "terminal-app/firebase" },
  (err, data) => {
    if (err) {
      console.log(err);
      return;
    }

    let secrets;
    if ("SecretString" in data) {
      secrets = JSON.parse(data.SecretString);
    } else {
      let buff = new Buffer(data.SecretBinary, "base64");
      secrets = JSON.parse(buff.toString("ascii"));
    }

    const prodEnvPath = path.join(__dirname, "src/environments/environment.ts");

    // Create the content for the environment.ts file
    const content = `import { baseEnvironment } from './environment.base';

export const environment = {
  ...baseEnvironment,
  firebase: {
    apiKey: '${secrets.apiKey}',
    authDomain: '${secrets.authDomain}',
    projectId: '${secrets.projectId}',
    storageBucket: '${secrets.storageBucket}',
    messagingSenderId: '${secrets.messagingSenderId}',
    appId: '${secrets.appId}',
    measurementId: '${secrets.measurementId}',
  }
};`;
    fs.writeFileSync(prodEnvPath, content);
  }
);
