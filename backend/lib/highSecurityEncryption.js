const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const NodeRSA = require('node-rsa');

const config = {
    secretPassword: process.env.JWTEncryptionKey,
    keyLength: 4096,
    rsaKeyDir: path.join(__dirname, 'config', 'rsa_keys')
};

if (!fs.existsSync(config.rsaKeyDir)){
    fs.mkdirSync(config.rsaKeyDir, { recursive: true });
}

const privateKeyPath = path.join(config.rsaKeyDir, 'private.key');
const publicKeyPath = path.join(config.rsaKeyDir, 'public.key');

function generateRSAKeyPair() {
    const key = new NodeRSA({ b: config.keyLength });
    const privateKey = key.exportKey('private');
    const publicKey = key.exportKey('public');
    fs.writeFileSync(privateKeyPath, privateKey);
    fs.writeFileSync(publicKeyPath, publicKey);
}

if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
    generateRSAKeyPair();
}

const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

function generateJWT(payload) {
    return jwt.sign(payload, config.secretPassword, { algorithm: 'HS256' });
}

function verifyJWT(token) {
    try {
        return jwt.verify(token, config.secretPassword);
    } catch (e) {
        return null;  
    }
}

function rsaEncrypt(data) {
    const key = new NodeRSA(publicKey);
    return key.encrypt(data, 'base64');
}

function rsaDecrypt(encryptedData) {
    const key = new NodeRSA(privateKey);
    return key.decrypt(encryptedData, 'utf8');
}

function generateEncryptedJWT(payload) {
    const jwtToken = generateJWT(payload);
    return rsaEncrypt(jwtToken);
}

function decryptAndVerifyJWT(encryptedToken) {
    const decryptedToken = rsaDecrypt(encryptedToken);
    return verifyJWT(decryptedToken);
}

module.exports = {
    generateEncryptedJWT,
    decryptAndVerifyJWT,
    generateJWT,
    verifyJWT,
    rsaEncrypt,
    rsaDecrypt
};