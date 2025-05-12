const jwt = require('jsonwebtoken');
const { getPublicKey } = require('../utils/keys');

function convertV2(permissions) {
  if (['read', 'write', '*'].includes(permissions)) {
    const map = {
      read: 'rs',
      write: 'cudh',
      '*': 'crudsh',
    };
    return map[permissions];
  }
  return permissions;
}

function mapPermissions(permissions) {
  const arrayPermissions = permissions.split('');
  const map = {
    c: 'POST',
    r: 'GET',
    u: 'PUT',
    d: 'DELETE',
    h: 'PATCH', 
  };
  return arrayPermissions.map((permission) => {
    return {
      [map[permission]]: true,
    };
  });
}

function mapScopes(id, scope) {
  const map = {
    patient: () => resourcesScope(scope),
    user: () => resourcesScope(scope),
    system: () => resourcesScope(scope),
    all: () => resourcesScope(scope),
    openid: () => {},
    fhirUser: () => {},
    launch: () => {},
    online_access: () => {},
    offline_access: () => {},
    profile: () => {},
  };
  if (map[id] === undefined) return () => {};
  return map[id];
}

function resourcesScope(scope) {
  const parts = scope.split('/');
  const resource = parts[1];
  const resourceParts = resource.split('.');
  const resourceName = resourceParts[0];
  if (resourceName === '*') {
    return ['Patient', 'Observation', 'Bundle', 'Practitioner'].reduce((resources, resource) => {
      const permissions = resourceParts[1];
      const testVersion = convertV2(permissions);
      const arrayPermissions = mapPermissions(testVersion);
      return {
        ...resources,
        [resource]: arrayPermissions,
      };
    }, {});
  }
  const permissions = resourceParts[1];
  const testVersion = convertV2(permissions);
  const arrayPermissions = mapPermissions(testVersion);
  return {
    [resourceName]: arrayPermissions,
  };
}

function checkScope(scopes) {
  const arrayScopes = scopes.split(' ');
  let permissions = {};
  arrayScopes.forEach((scope) => {
    const scopeParts = scope.split('/');
    const scopeId = scopeParts[0];
    const permissionSelector = mapScopes(scopeId, scope);
    const permission = permissionSelector();
    permissions = {
      ...permissions,
      ...permission,
    };
  });
  return permissions;
}

module.exports.checkScope = checkScope;
module.exports.verifyJWT = async function verifyJWT(req, res, next) {
  if (process.env.ENV === 'unsafe') {
    next();
    return;
  }
  const token = req.headers['authorization'] || req.headers['Authorization'];
  if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

  try {
    const code = token.split(' ')[1]; 
    const key = await getPublicKey();
    const decoded = jwt.verify(code, key);
    if (!decoded.scope)
      return res.status(401).json({ auth: false, message: 'No scope' });

    const permissions = checkScope(decoded.scope);
    const resources = Object.keys(permissions);
    const matchResources = resources.find((resource) =>
      req.originalUrl.includes(resource)
    );
    if (!matchResources)
      return res
        .status(401)
        .json({ auth: false, message: 'Not allowed to this resource' });

    const matchMethod = permissions[matchResources].find(
      (permission) => !!permission[req.method]
    );
    if (!matchMethod)
      return res
        .status(401)
        .json({ auth: false, message: 'Not allowed to this method' });

    next();
  } catch (e) {
    console.log(e);
    return res
      .status(401)
      .json({ auth: false, message: 'Failed to authenticate token.' });
  }
};
