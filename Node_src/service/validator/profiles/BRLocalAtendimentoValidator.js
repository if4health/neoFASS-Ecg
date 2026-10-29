const PROFILE_URL =
  'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRLocalAtendimento-1.0';

const CODESYSTEM_URL =
  'http://www.saude.gov.br/fhir/r4/CodeSystem/BRLocalAtendimento';

const VALID_CODES = new Set([
  'domicilio',
  'instituicao',
  'prisional',
  'socioeducativa',
  'estabelecimento',
  'outros',
  'movel',
  'rua',
  'educacional',
  'academia-saude',
]);

class BRLocalAtendimentoValidator {
  validate(location) {
    const errors = [];

    if (!location || typeof location !== 'object') {
      throw new Error('Location inválido.');
    }

    if (location.resourceType !== 'Location') {
      errors.push('resourceType deve ser Location.');
    }

    if (!location.meta?.profile?.includes(PROFILE_URL)) {
      errors.push(`meta.profile deve conter ${PROFILE_URL}.`);
    }

    // Verifica códigos caso sejam informados em Location.type.
    for (const [index, type] of (location.type || []).entries()) {
      for (const coding of type.coding || []) {
        if (coding.system === CODESYSTEM_URL) {
          if (!VALID_CODES.has(coding.code)) {
            errors.push(
              `type[${index}] contém código BRLocalAtendimento inválido: ${coding.code}.`
            );
          }
        }
      }
    }

    if (errors.length) {
      const error = new Error(
        `Location não atende à validação BRLocalAtendimento-1.0:\n- ${errors.join(
          '\n- '
        )}`
      );
      error.statusCode = 400;
      throw error;
    }

    return true;
  }
}

module.exports = new BRLocalAtendimentoValidator();
