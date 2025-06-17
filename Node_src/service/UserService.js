const mongoose = require('mongoose'); // Needed for ObjectId
const bcrypt = require('bcrypt');
const UserDatabase = require('../model/BusinessModels/Users');
const { linkFhirResource } = require('../utils/fhirUtils');

const saltRounds = 10;

const defaultScopesByRole = {
  patient: 'openid profile patient/*.rs launch/patient',
  practitioner: 'openid profile user/*.crudsh launch',
  admin: 'system/*.*',
};

class UserService {
  async create(User) {
    try {
      if (!User.username) {
        return { code: 400, message: 'Campo username Obrigatório!' };
      }

      const exists = await UserDatabase.findOne({ username: User.username });
      if (exists) {
        return { code: 400, message: 'Usuário já existe!' };
      }
      
      User.password = await bcrypt.hash(User.password, saltRounds);
      
      if (!User.role) User.role = 'patient';
      if (!User.scopes) User.scopes = defaultScopesByRole[User.role];

      User.fhirReference = User.fhirReference || (User.role === 'practitioner' ? 'Practitioner' : 'Patient');

      const user = await UserDatabase.create(User);
      
      const resourceType = user.fhirReference;

      let fhirResource = await linkFhirResource(resourceType, user);

      const fhirReference = `${resourceType}/${fhirResource._id}`;
      user.fhirReference = fhirReference;
      await user.save();

      return {
        user_id: user._id,
        fhirReference,
        identifier: {
          system: 'IF4Health',
          value: fhirResource._id.toString(),
        },
      };

    } catch (e) {
      console.error('Error creating user:', e);
      return { code: 500, message: 'Erro interno ao criar usuário.' };
    }
  }

  async find(query) {
    try {
      const result = await UserDatabase.find(query);
      return result;
    } catch (e) {
      return e;
    }
  }

  async findOne(query) {
    try {
      const result = await UserDatabase.findOne(query);
      return result;
    } catch (e) {
      return e;
    }
  }


  async findById(id) {
    try {
      const result = await UserDatabase.findOne({
        _id: new mongoose.Types.ObjectId(id),
      });
      return result;
    } catch (e) {
      return e;
    }
  }

  async remove(id) {
    try {
      const result = await UserDatabase.deleteOne(id);
      return result;
    } catch (e) {
      return e;
    }
  }
}

module.exports = new UserService();
