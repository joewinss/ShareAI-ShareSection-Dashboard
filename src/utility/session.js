const crypto = require('crypto');
const algorithm = 'aes-256-cbc';

function encrypt(key, iv, text) {
    key = crypto.createHash('sha256').update(key).digest('base64').substr(0, 32);
    iv = Buffer.from(crypto.createHash('sha256').update(iv).digest('base64').substr(0, 16));
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
}

function decrypt(key, iv, value) {
    key = crypto.createHash('sha256').update(key).digest('base64').substr(0, 32);
    iv = Buffer.from(crypto.createHash('sha256').update(iv).digest('base64').substr(0, 16));
    let encryptedText = Buffer.from(value, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

module.exports = {
    encrypt,
    decrypt,
};