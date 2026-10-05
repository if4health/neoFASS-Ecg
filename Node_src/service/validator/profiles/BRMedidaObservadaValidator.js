const BR_MEDIDA_OBSERVADA =
  'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRMedidaObservada';

const SYSTEMS = {
  TIPO_OBSERVACAO:
    'http://www.saude.gov.br/fhir/r4/CodeSystem/BRTipoObservacao',

  TABELA_SUS: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRTabelaSUS',

  LOINC: 'http://loinc.org',

  LOCAL_AFERICAO: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRLocalAfericao',
};

const TIPO_OBSERVACAO_CODES = new Set([
  'DSIA',
  'RECIDI',
  'DF',
  'IAC',
  'P',
  'A',
  'PC',
  'CA',
  'PA',
]);

const TABELA_SUS_CODES = new Set(['0301100039', '0214010015']);

const LOINC_CODES = new Set([
  '8665-2',
  '56832-9',
  '11996-6',
  '63895-7',
  '29463-7',
  '8480-6',
  '8462-4',
  '8280-0',
  '9843-4',
  '8302-2',
  '11885-1',
  '11612-9',
  '48767-8',
  '18842-5',
]);

const LOCAL_AFERICAO_CODES = new Set([
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
]);

const FORBIDDEN_FIELDS = [
  'identifier',
  'basedOn',
  'partOf',
  'category',
  'focus',
  'encounter',
  'issued',
  'performer',
  'dataAbsentReason',
  'interpretation',
  'specimen',
  'device',
  'referenceRange',
  'hasMember',
  'derivedFrom',
];

class BRMedidaObservadaValidator {
  validate(observation) {
    const errors = [];

    this.validateResourceType(observation, errors);
    this.validateStatus(observation, errors);
    this.validateCode(observation, errors);
    this.validateSubject(observation, errors);
    this.validateForbiddenFields(observation, errors);
    this.validateCardinality(observation, errors);
    this.validateBodySite(observation, errors);
    this.validateMethod(observation, errors);

    if (errors.length > 0) {
      const error = new Error(
        `Recurso inválido para BRMedidaObservada: ${errors.join('; ')}`
      );

      error.statusCode = 400;
      error.validationErrors = errors;

      throw error;
    }

    return true;
  }

  validateResourceType(observation, errors) {
    if (observation.resourceType !== 'Observation') {
      errors.push('resourceType deve ser "Observation"');
    }
  }

  validateStatus(observation, errors) {
    if (!observation.status) {
      errors.push('status é obrigatório');
    }
  }

  validateCode(observation, errors) {
    if (!observation.code) {
      errors.push('code é obrigatório');
      return;
    }

    if (!observation.code.coding) {
      errors.push('code.coding é obrigatório');
      return;
    }

    if (!Array.isArray(observation.code.coding)) {
      errors.push('code.coding deve ser um array');
      return;
    }

    if (observation.code.coding.length === 0) {
      errors.push('code.coding deve possuir pelo menos um elemento');
      return;
    }

    if (observation.code.coding.length > 1) {
      errors.push('code.coding deve possuir no máximo um elemento');
      return;
    }

    const coding = observation.code.coding[0];

    if (!coding.system) {
      errors.push('code.coding.system é obrigatório');
    }

    if (!coding.code) {
      errors.push('code.coding.code é obrigatório');
    }

    if (coding.system && coding.code) {
      const valid = this.isValidObservationCode(coding.system, coding.code);

      if (!valid) {
        errors.push(
          `Código de observação inválido para BRTipoObservacao/BRTabelaSUS/LOINC: ${coding.system}|${coding.code}`
        );
      }
    }
  }

  isValidObservationCode(system, code) {
    if (system === SYSTEMS.TIPO_OBSERVACAO && TIPO_OBSERVACAO_CODES.has(code)) {
      return true;
    }

    if (system === SYSTEMS.TABELA_SUS && TABELA_SUS_CODES.has(code)) {
      return true;
    }

    if (system === SYSTEMS.LOINC && LOINC_CODES.has(code)) {
      return true;
    }

    return false;
  }

  validateSubject(observation, errors) {
    // subject é opcional no perfil BRMedidaObservada
    if (!observation.subject) {
      return;
    }

    // subject.reference é proibido pelo perfil
    if (observation.subject.reference) {
      errors.push('subject.reference não é permitido para BRMedidaObservada');
    }

    // Se subject existir, identifier deve existir
    if (!observation.subject.identifier) {
      errors.push(
        'subject.identifier é obrigatório quando subject é informado'
      );
      return;
    }

    // identifier.value é obrigatório
    if (!observation.subject.identifier.value) {
      errors.push(
        'subject.identifier.value é obrigatório quando subject é informado'
      );
    }

    // Campos proibidos dentro de subject
    if (observation.subject.type !== undefined) {
      errors.push('subject.type não é permitido para BRMedidaObservada');
    }

    if (observation.subject.display !== undefined) {
      errors.push('subject.display não é permitido para BRMedidaObservada');
    }

    if (observation.subject.identifier.use !== undefined) {
      errors.push(
        'subject.identifier.use não é permitido para BRMedidaObservada'
      );
    }

    if (observation.subject.identifier.period !== undefined) {
      errors.push(
        'subject.identifier.period não é permitido para BRMedidaObservada'
      );
    }

    if (observation.subject.identifier.assigner !== undefined) {
      errors.push(
        'subject.identifier.assigner não é permitido para BRMedidaObservada'
      );
    }
  }
  validateForbiddenFields(observation, errors) {
    FORBIDDEN_FIELDS.forEach((field) => {
      if (observation[field] !== undefined && observation[field] !== null) {
        errors.push(
          `O campo ${field} não é permitido pelo perfil BRMedidaObservada`
        );
      }
    });
  }

  validateCardinality(observation, errors) {
    if (
      observation.note &&
      Array.isArray(observation.note) &&
      observation.note.length > 1
    ) {
      errors.push('note permite no máximo um elemento');
    }

    if (
      observation.component &&
      Array.isArray(observation.component) &&
      observation.component.length > 1
    ) {
      errors.push('component permite no máximo um elemento');
    }
  }

  validateBodySite(observation, errors) {
    // bodySite é opcional.
    if (!observation.bodySite) {
      return;
    }

    if (!observation.bodySite.coding) {
      errors.push('bodySite.coding deve ser informado quando bodySite existir');
      return;
    }

    if (!Array.isArray(observation.bodySite.coding)) {
      errors.push('bodySite.coding deve ser um array');
      return;
    }

    if (observation.bodySite.coding.length === 0) {
      errors.push('bodySite.coding deve possuir pelo menos um elemento');
      return;
    }

    const coding = observation.bodySite.coding[0];

    if (coding.system !== SYSTEMS.LOCAL_AFERICAO) {
      errors.push(
        `bodySite deve utilizar o CodeSystem ${SYSTEMS.LOCAL_AFERICAO}`
      );
    }

    if (coding.code && !LOCAL_AFERICAO_CODES.has(coding.code)) {
      errors.push(`Código inválido para BRLocalAfericao: ${coding.code}`);
    }
  }
  validateMethod(observation, errors) {
    // method é opcional.
    if (!observation.method) {
      return;
    }

    if (!observation.method.coding) {
      errors.push('method.coding deve ser informado quando method existir');
      return;
    }

    if (!Array.isArray(observation.method.coding)) {
      errors.push('method.coding deve ser um array');
      return;
    }

    if (observation.method.coding.length === 0) {
      errors.push('method.coding deve possuir pelo menos um elemento');
      return;
    }

    if (observation.method.coding.length > 1) {
      errors.push('method.coding deve possuir no máximo um elemento');
    }
  }
}

module.exports = new BRMedidaObservadaValidator();
