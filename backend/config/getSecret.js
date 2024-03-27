const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
  
const client = new SecretsManagerClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  }
});

async function getSecret(secretNumber) {
  let secret_name;
  if (secretNumber === 1) {
    secret_name = "newProjectChronos";
  } else if (secretNumber === 2) {
    secret_name = "EncryptionMasterKey";
  }
  try {
    const response = await client.send(
      new GetSecretValueCommand({
      SecretId: secret_name,
      VersionStage: "AWSCURRENT",
    }));
    
    return response.SecretString;
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw error;
  }
}

module.exports = getSecret;