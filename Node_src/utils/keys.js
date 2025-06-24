const fs = require('fs');
const path = require('path');
const { exportJWK } = require('jose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

let _cachedPrivateKey = null;
let _cachedPublicKey = null;

const getPublicKey = async () => {
  try {
    if (!_cachedPublicKey) {
      const pubPath = path.join(__dirname, process.env.OAUTH_PUB);
      _cachedPublicKey = fs.readFileSync(pubPath, 'utf8');
    }
    return _cachedPublicKey;
  } catch (e) {
    console.error('Failed to load public key:', e.message);
    throw new Error('Public key not found or unreadable');
  }
};

const getPrivateKey = async () => {
  try {
    if (!_cachedPrivateKey) {
      const privPath = path.join(__dirname, process.env.OAUTH_PRIVATE);
      _cachedPrivateKey = fs.readFileSync(privPath, 'utf8');
    }
    return _cachedPrivateKey;
  } catch (e) {
    console.error('Failed to load private key:', e.message);
    throw new Error('Private key not found or unreadable');
  }
};

const signPayload = async (payload, expiresIn = 3600) => {
  try {
    const privateKey = await getPrivateKey();
    return jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn,
    });
  } catch (e) {
    console.error('Error signing payload (RS256):', e.message);
    throw new Error('Token signing failed');
  }
};

const verifyToken = async (token) => {
  try {
    const publicKey = await getPublicKey();
    return jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
    });
  } catch (e) {
    console.error('Invalid or expired RS256 token:', e.message);
    throw new Error('Token verification failed');
  }
};

const signDevice = async (payload, expiresIn = 3600) => {
  try {
    return jwt.sign(payload, process.env.OAUTH_SECRET, {
      algorithm: 'HS256',
      expiresIn,
    });
  } catch (e) {
    console.error('Error signing device token (HS256):', e.message);
    throw new Error('Device token signing failed');
  }
};

const exportPublicJWK = async () => {
  try {
    const publicKeyPem = await getPublicKey();
    const publicKeyObj = crypto.createPublicKey(publicKeyPem);
    return await exportJWK(publicKeyObj);
  } catch (e) {
    console.error('Failed to export public JWK:', e.message);
    throw new Error('Public JWK export failed');
  }
};

module.exports = {
  getPublicKey,
  getPrivateKey,
  signPayload,
  verifyToken,
  signDevice,
  exportJWK: exportPublicJWK,
};