const BR_PROCEDIMENTO_REALIZADO =
  'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRProcedimentoRealizado-1.0';

const SYSTEMS = {
  TIPO_IDENTIFICADOR:
    'http://www.saude.gov.br/fhir/r4/CodeSystem/BRTipoIdentificador',
};

const FORBIDDEN_FIELDS = [
  'instantiatesCanonical',
  'instantiatesUri',
  'basedOn',
  'partOf',
  'statusReason',
  'category',
  'encounter',
  'recorder',
  'asserter',
  'location',
  'reasonCode',
  'reasonReference',
  'bodySite',
  'outcome',
  'report',
  'complication',
  'complicationDetail',
  'followUp',
  'usedReference',
  'usedCode',
];

class BRProcedimentoRealizadoValidator {
  validate(procedure) {
    const errors = [];

    this.validateResourceType(procedure, errors);
    this.validateExtension(procedure, errors);
    this.validateIdentifier(procedure, errors);
    this.validateStatus(procedure, errors);
    this.validateCode(procedure, errors);
    this.validateSubject(procedure, errors);
    this.validatePerformed(procedure, errors);
    this.validatePerformer(procedure, errors);
    this.validateNote(procedure, errors);
    this.validateFocalDevice(procedure, errors);
    this.validateForbiddenFields(procedure, errors);

    if (errors.length > 0) {
      const error = new Error(
        `Recurso inválido para BRProcedimentoRealizado: ${errors.join('; ')}`
      );

      error.statusCode = 400;
      error.validationErrors = errors;

      throw error;
    }

    return true;
  }

  validateResourceType(procedure, errors) {
    if (procedure.resourceType !== 'Procedure') {
      errors.push('resourceType deve ser "Procedure"');
    }
  }

  validateExtension(procedure, errors) {
    const extensions = procedure.extension;

    if (!extensions || !Array.isArray(extensions)) {
      errors.push('extension é obrigatório para BRProcedimentoRealizado');
      return;
    }

    const quantityExtensions = extensions.filter(
      (extension) =>
        extension.url ===
        'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRQuantidade-1.0'
    );

    if (quantityExtensions.length === 0) {
      errors.push(
        'extension[quantity] é obrigatório para BRProcedimentoRealizado'
      );
      return;
    }

    if (quantityExtensions.length > 1) {
      errors.push('extension[quantity] permite no máximo um elemento');
    }

    quantityExtensions.forEach((extension) => {
      if (extension.valuePositiveInt === undefined) {
        errors.push('extension[quantity].valuePositiveInt é obrigatório');
        return;
      }

      if (
        !Number.isInteger(extension.valuePositiveInt) ||
        extension.valuePositiveInt <= 0
      ) {
        errors.push(
          'extension[quantity].valuePositiveInt deve ser um inteiro positivo'
        );
      }
    });
  }

  validateIdentifier(procedure, errors) {
    if (!procedure.identifier) {
      return;
    }

    if (!Array.isArray(procedure.identifier)) {
      errors.push('identifier deve ser um array');
      return;
    }

    if (procedure.identifier.length > 1) {
      errors.push('identifier permite no máximo um elemento');
    }

    if (procedure.identifier.length === 0) {
      return;
    }

    const identifier = procedure.identifier[0];

    if (identifier.use !== undefined) {
      errors.push(
        'identifier.use não é permitido para BRProcedimentoRealizado'
      );
    }

    if (!identifier.type) {
      errors.push('identifier.type é obrigatório');
    } else {
      this.validateIdentifierType(identifier.type, errors);
    }

    if (identifier.system !== undefined) {
      errors.push(
        'identifier.system não é permitido para BRProcedimentoRealizado'
      );
    }

    if (!identifier.value) {
      errors.push('identifier.value é obrigatório');
    }

    if (identifier.period !== undefined) {
      errors.push(
        'identifier.period não é permitido para BRProcedimentoRealizado'
      );
    }

    if (identifier.assigner !== undefined) {
      errors.push(
        'identifier.assigner não é permitido para BRProcedimentoRealizado'
      );
    }
  }

  validateIdentifierType(type, errors) {
    if (type.text !== undefined) {
      errors.push('identifier.type.text não é permitido');
    }

    if (!type.coding) {
      errors.push('identifier.type.coding é obrigatório');
      return;
    }

    if (!Array.isArray(type.coding)) {
      errors.push('identifier.type.coding deve ser um array');
      return;
    }

    if (type.coding.length !== 1) {
      errors.push('identifier.type.coding deve possuir exatamente um elemento');
      return;
    }

    const coding = type.coding[0];

    if (coding.system !== SYSTEMS.TIPO_IDENTIFICADOR) {
      errors.push(
        `identifier.type.coding.system deve ser ${SYSTEMS.TIPO_IDENTIFICADOR}`
      );
    }

    if (coding.code !== 'AUTH') {
      errors.push('identifier.type.coding.code deve ser "AUTH"');
    }

    if (coding.display !== undefined) {
      errors.push('identifier.type.coding.display não é permitido');
    }

    if (coding.userSelected !== undefined) {
      errors.push('identifier.type.coding.userSelected não é permitido');
    }
  }

  validateStatus(procedure, errors) {
    if (!procedure.status) {
      errors.push('status é obrigatório');
      return;
    }

    // Conforme o comentário da StructureDefinition:
    // somente "completed" é aceito nesta primeira fase.
    if (procedure.status !== 'completed') {
      errors.push('status deve ser "completed" para BRProcedimentoRealizado');
    }
  }

  validateCode(procedure, errors) {
    if (!procedure.code) {
      errors.push('code é obrigatório');
      return;
    }

    if (!procedure.code.coding) {
      errors.push('code.coding é obrigatório');
      return;
    }

    if (!Array.isArray(procedure.code.coding)) {
      errors.push('code.coding deve ser um array');
      return;
    }

    if (procedure.code.coding.length !== 1) {
      errors.push('code.coding deve possuir exatamente um elemento');
      return;
    }

    const coding = procedure.code.coding[0];

    if (!coding.system) {
      errors.push('code.coding.system é obrigatório');
    }

    if (!coding.code) {
      errors.push('code.coding.code é obrigatório');
    }

    if (coding.display !== undefined) {
      errors.push('code.coding.display não é permitido');
    }

    if (coding.userSelected !== undefined) {
      errors.push('code.coding.userSelected não é permitido');
    }

    if (procedure.code.text !== undefined) {
      errors.push('code.text não é permitido');
    }
  }

  validateSubject(procedure, errors) {
    // subject não possui min explícito no diferencial informado.
    if (!procedure.subject) {
      return;
    }

    const subject = procedure.subject;

    // O perfil utiliza identificação do indivíduo,
    // não referência FHIR.
    if (subject.reference !== undefined) {
      errors.push('subject.reference não é permitido');
    }

    if (subject.type !== undefined) {
      errors.push('subject.type não é permitido');
    }

    if (subject.display !== undefined) {
      errors.push('subject.display não é permitido');
    }

    if (!subject.identifier) {
      errors.push(
        'subject.identifier é obrigatório quando subject é informado'
      );
      return;
    }

    const identifier = subject.identifier;

    if (!identifier.system) {
      errors.push('subject.identifier.system é obrigatório');
    }

    if (!identifier.value) {
      errors.push('subject.identifier.value é obrigatório');
    }

    if (identifier.use !== undefined) {
      errors.push('subject.identifier.use não é permitido');
    }

    if (identifier.type !== undefined) {
      errors.push('subject.identifier.type não é permitido');
    }

    if (identifier.period !== undefined) {
      errors.push('subject.identifier.period não é permitido');
    }

    if (identifier.assigner !== undefined) {
      errors.push('subject.identifier.assigner não é permitido');
    }
  }

  validatePerformed(procedure, errors) {
    if (!procedure.performedDateTime) {
      errors.push('performedDateTime é obrigatório');
    }

    if (procedure.performedPeriod !== undefined) {
      errors.push('performedPeriod não é permitido');
    }

    if (procedure.performedString !== undefined) {
      errors.push('performedString não é permitido');
    }

    if (procedure.performedAge !== undefined) {
      errors.push('performedAge não é permitido');
    }

    if (procedure.performedRange !== undefined) {
      errors.push('performedRange não é permitido');
    }
  }

  validatePerformer(procedure, errors) {
    if (!procedure.performer) {
      return;
    }

    if (!Array.isArray(procedure.performer)) {
      errors.push('performer deve ser um array');
      return;
    }

    procedure.performer.forEach((performer, index) => {
      const prefix = `performer[${index}]`;

      if (!performer) {
        errors.push(`${prefix} é inválido`);
        return;
      }

      this.validatePerformerFunction(performer.function, prefix, errors);

      this.validatePerformerActor(performer.actor, prefix, errors);

      this.validatePerformerOnBehalfOf(performer.onBehalfOf, prefix, errors);

      this.validatePerformerExtension(performer.extension, prefix, errors);
    });
  }

  validatePerformerFunction(func, prefix, errors) {
    if (!func) {
      return;
    }

    if (!func.coding) {
      errors.push(`${prefix}.function.coding é obrigatório`);
      return;
    }

    if (!Array.isArray(func.coding)) {
      errors.push(`${prefix}.function.coding deve ser um array`);
      return;
    }

    if (func.coding.length !== 1) {
      errors.push(
        `${prefix}.function.coding deve possuir exatamente um elemento`
      );
      return;
    }

    const coding = func.coding[0];

    if (!coding.system) {
      errors.push(`${prefix}.function.coding.system é obrigatório`);
    }

    if (!coding.code) {
      errors.push(`${prefix}.function.coding.code é obrigatório`);
    }

    if (coding.userSelected !== undefined) {
      errors.push(`${prefix}.function.coding.userSelected não é permitido`);
    }

    if (func.text !== undefined) {
      errors.push(`${prefix}.function.text não é permitido`);
    }
  }

  validatePerformerActor(actor, prefix, errors) {
    if (!actor) {
      return;
    }

    if (actor.reference !== undefined) {
      errors.push(`${prefix}.actor.reference não é permitido`);
    }

    if (actor.type !== undefined) {
      errors.push(`${prefix}.actor.type não é permitido`);
    }

    if (actor.display !== undefined) {
      errors.push(`${prefix}.actor.display não é permitido`);
    }

    this.validateActorIdentifier(
      actor.identifier,
      `${prefix}.actor.identifier`,
      errors
    );
  }

  validatePerformerOnBehalfOf(onBehalfOf, prefix, errors) {
    if (!onBehalfOf) {
      return;
    }

    if (onBehalfOf.reference !== undefined) {
      errors.push(`${prefix}.onBehalfOf.reference não é permitido`);
    }

    if (onBehalfOf.type !== undefined) {
      errors.push(`${prefix}.onBehalfOf.type não é permitido`);
    }

    if (onBehalfOf.display !== undefined) {
      errors.push(`${prefix}.onBehalfOf.display não é permitido`);
    }

    this.validateActorIdentifier(
      onBehalfOf.identifier,
      `${prefix}.onBehalfOf.identifier`,
      errors
    );
  }

  validateActorIdentifier(identifier, prefix, errors) {
    if (!identifier) {
      return;
    }

    if (!identifier.system) {
      errors.push(`${prefix}.system é obrigatório`);
    }

    if (!identifier.value) {
      errors.push(`${prefix}.value é obrigatório`);
    }

    if (identifier.use !== undefined) {
      errors.push(`${prefix}.use não é permitido`);
    }

    if (identifier.type !== undefined) {
      errors.push(`${prefix}.type não é permitido`);
    }

    if (identifier.period !== undefined) {
      errors.push(`${prefix}.period não é permitido`);
    }

    if (identifier.assigner !== undefined) {
      errors.push(`${prefix}.assigner não é permitido`);
    }
  }

  validatePerformerExtension(extension, prefix, errors) {
    if (!extension) {
      return;
    }

    if (!Array.isArray(extension)) {
      errors.push(`${prefix}.extension deve ser um array`);
      return;
    }

    const healthcareTeamExtensions = extension.filter(
      (item) =>
        item.url ===
        'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRIdentificacaoEquipe-1.0'
    );

    if (healthcareTeamExtensions.length > 1) {
      errors.push(
        `${prefix}.extension[healthcareTeam] permite no máximo um elemento`
      );
    }

    healthcareTeamExtensions.forEach((item) => {
      if (item.valueInteger === undefined) {
        errors.push(
          `${prefix}.extension[healthcareTeam].valueInteger é obrigatório`
        );
      }
    });
  }

  validateNote(procedure, errors) {
    if (!procedure.note) {
      return;
    }

    if (!Array.isArray(procedure.note)) {
      errors.push('note deve ser um array');
      return;
    }

    procedure.note.forEach((note, index) => {
      if (note.authorString !== undefined) {
        errors.push(`note[${index}].authorString não é permitido`);
      }

      if (note.authorReference !== undefined) {
        errors.push(`note[${index}].authorReference não é permitido`);
      }

      if (note.time !== undefined) {
        errors.push(`note[${index}].time não é permitido`);
      }
    });
  }

  validateFocalDevice(procedure, errors) {
    if (!procedure.focalDevice) {
      return;
    }

    if (!Array.isArray(procedure.focalDevice)) {
      errors.push('focalDevice deve ser um array');
      return;
    }

    procedure.focalDevice.forEach((device, index) => {
      if (device.action !== undefined) {
        errors.push(`focalDevice[${index}].action não é permitido`);
      }
    });
  }

  validateForbiddenFields(procedure, errors) {
    FORBIDDEN_FIELDS.forEach((field) => {
      if (procedure[field] !== undefined && procedure[field] !== null) {
        errors.push(
          `O campo ${field} não é permitido pelo perfil BRProcedimentoRealizado`
        );
      }
    });
  }
}

module.exports = new BRProcedimentoRealizadoValidator();
