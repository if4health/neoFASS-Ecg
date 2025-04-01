const fs = require('fs');
const path = require('path');
const { exportJWK } = require('jose');
const jwt = require('jsonwebtoken');

const getPublicKey = async function () {
  return fs.readFileSync(path.join(__dirname, process.env.OAUTH_PUB), 'utf8');
}

const getPrivateKey = async function () {
  return fs.readFileSync(path.join(__dirname, process.env.OAUTH_PRIVATE), 'utf8');
}

module.exports.getPublicKey = getPublicKey;
module.exports.getPrivateKey = getPrivateKey;
module.exports.exportJWK = function (publicKey) {
  return exportJWK(publicKey);
};

module.exports.signPayload = async function (payload, expiresIn) {
  return jwt.sign(payload, await getPrivateKey(), {
    algorithm: 'RS256',
    expiresIn,
  });
};

module.exports.verifyToken = async function (token) {
  return jwt.verify(token, await getPublicKey());
};

module.exports.verifySymmetricToken = function (token) {
  return jwt.verify(token, process.env.OAUTH_SECRET);
};
