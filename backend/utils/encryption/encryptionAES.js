const crypto = require('crypto');
const getSecret = require('../../config/getSecret');

async function encrypt(text) {
    const masterkey = await getSecret(2);
    const iv = crypto.randomBytes(16);
    const salt = crypto.randomBytes(64);
    const key = crypto.pbkdf2Sync(masterkey, salt, 2145, 32, 'sha512');
    
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

async function decrypt(encdata) {
    const masterkey = await getSecret(2);
    const bData = Buffer.from(encdata, 'base64');
    
    const salt = bData.slice(0, 64);
    const iv = bData.slice(64, 80);
    const tag = bData.slice(80, 96);
    const text = bData.slice(96);

    const key = crypto.pbkdf2Sync(masterkey, salt , 2145, 32, 'sha512');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);

    const decrypted = decipher.update(text, 'binary', 'utf8') + decipher.final('utf8');

    return decrypted;
}

module.exports = { encrypt, decrypt };
