const RAC_PROFILE =
  'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRRegistroAtendimentoClinico';

const CMD_PROFILE =
  'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRConjuntoMinimoDados-1.1';

const SECTION_RESOURCE_TYPES = {
  Encounter: 'informacoesContatoAssistencial',
  Condition: 'problemasDiagnosticosAvaliados',
  Procedure: 'procedimentosRealizados',
  Observation: 'observacoes',
  AllergyIntolerance: 'alergiaReacaoAdversa',
  MedicationRequest: 'prescricao',
  CarePlan: 'planoCuidados',
  QuestionnaireResponse: 'marcosDesenvolvimento',
};

class BRRegistroAtendimentoClinicoValidator {
  validate(composition) {
    const errors = [];

    if (!composition || typeof composition !== 'object') {
      throw new Error('Composition inválida.');
    }

    this.validateResourceType(composition, errors);
    this.validateStatus(composition, errors);
    this.validateType(composition, errors);
    this.validateCategory(composition, errors);
    this.validateSubject(composition, errors);
    this.validateAuthor(composition, errors);
    this.validateDate(composition, errors);
    this.validateTitle(composition, errors);
    this.validateForbiddenFields(composition, errors);
    this.validateRelatesTo(composition, errors);
    this.validateSections(composition, errors);

    if (errors.length > 0) {
      throw new Error(
        `Composition não atende ao perfil BRRegistroAtendimentoClinico:\n- ${errors.join(
          '\n- '
        )}`
      );
    }

    return true;
  }

  validateResourceType(composition, errors) {
    if (composition.resourceType !== 'Composition') {
      errors.push('resourceType deve ser "Composition".');
    }
  }

  validateStatus(composition, errors) {
    const allowed = ['final', 'entered-in-error'];

    if (!allowed.includes(composition.status)) {
      errors.push(
        `status deve ser "final" ou "entered-in-error" para o perfil CMD.`
      );
    }
  }

  validateType(composition, errors) {
    const codings = composition.type?.coding;

    if (!Array.isArray(codings) || codings.length !== 1) {
      errors.push('type.coding deve possuir exatamente um elemento.');
      return;
    }

    const coding = codings[0];

    if (!coding?.system) {
      errors.push('type.coding[0].system é obrigatório.');
    }

    if (coding?.code !== 'RAC') {
      errors.push('type.coding[0].code deve ser "RAC".');
    }

    if (coding && ('display' in coding || 'userSelected' in coding)) {
      errors.push('type.coding[0] não pode conter display ou userSelected.');
    }

    if ('text' in (composition.type || {})) {
      errors.push('type.text não é permitido pelo perfil CMD.');
    }
  }

  validateCategory(composition, errors) {
    const categories = composition.category;

    if (!Array.isArray(categories) || categories.length !== 1) {
      errors.push('category deve possuir exatamente um elemento.');
      return;
    }

    const codings = categories[0]?.coding;

    if (!Array.isArray(codings) || codings.length !== 1) {
      errors.push('category[0].coding deve possuir exatamente um elemento.');
      return;
    }

    const coding = codings[0];

    if (!coding?.system) {
      errors.push('category[0].coding[0].system é obrigatório.');
    }

    if (!coding?.code) {
      errors.push('category[0].coding[0].code é obrigatório.');
    }

    if (coding && ('display' in coding || 'userSelected' in coding)) {
      errors.push('category.coding não pode conter display ou userSelected.');
    }

    if ('text' in categories[0]) {
      errors.push('category[0].text não é permitido pelo perfil CMD.');
    }
  }

  validateSubject(composition, errors) {
    const subject = composition.subject;

    if (!subject || typeof subject !== 'object') {
      errors.push('subject é obrigatório.');
      return;
    }

    if (subject.reference !== undefined) {
      errors.push('subject.reference não é permitido pelo perfil CMD.');
    }

    if (subject.type !== undefined) {
      errors.push('subject.type não é permitido pelo perfil CMD.');
    }

    if (subject.display !== undefined) {
      errors.push('subject.display não é permitido pelo perfil CMD.');
    }

    const identifier = subject.identifier;

    if (!identifier || typeof identifier !== 'object') {
      errors.push('subject.identifier é obrigatório.');
      return;
    }

    if (!identifier.system) {
      errors.push('subject.identifier.system é obrigatório.');
    }

    if (!identifier.value) {
      errors.push('subject.identifier.value é obrigatório.');
    }

    for (const field of ['use', 'type', 'period', 'assigner']) {
      if (identifier[field] !== undefined) {
        errors.push(
          `subject.identifier.${field} não é permitido pelo perfil CMD.`
        );
      }
    }
  }

  validateAuthor(composition, errors) {
    const authors = composition.author;

    if (!Array.isArray(authors) || authors.length < 1) {
      errors.push('author deve conter pelo menos um elemento.');
      return;
    }

    authors.forEach((author, index) => {
      if (!author || typeof author !== 'object') {
        errors.push(`author[${index}] deve ser um objeto Reference.`);
        return;
      }

      if (author.reference !== undefined) {
        errors.push(
          `author[${index}].reference não é permitido pelo perfil CMD.`
        );
      }

      if (author.type !== undefined) {
        errors.push(`author[${index}].type não é permitido pelo perfil CMD.`);
      }

      if (author.display !== undefined) {
        errors.push(
          `author[${index}].display não é permitido pelo perfil CMD.`
        );
      }

      const identifier = author.identifier;

      if (!identifier || typeof identifier !== 'object') {
        errors.push(`author[${index}].identifier é obrigatório.`);
        return;
      }

      if (!identifier.system) {
        errors.push(`author[${index}].identifier.system é obrigatório.`);
      }

      if (!identifier.value) {
        errors.push(`author[${index}].identifier.value é obrigatório.`);
      }

      for (const field of ['use', 'type', 'period', 'assigner']) {
        if (identifier[field] !== undefined) {
          errors.push(
            `author[${index}].identifier.${field} não é permitido pelo perfil CMD.`
          );
        }
      }
    });
  }

  validateDate(composition, errors) {
    if (!composition.date || Number.isNaN(Date.parse(composition.date))) {
      errors.push('date é obrigatório e deve conter uma data/hora válida.');
    }
  }

  validateTitle(composition, errors) {
    if (typeof composition.title !== 'string' || !composition.title.trim()) {
      errors.push('title é obrigatório.');
    }
  }

  validateForbiddenFields(composition, errors) {
    const forbidden = [
      'identifier',
      'encounter',
      'confidentiality',
      'attester',
      'custodian',
      'event',
    ];

    forbidden.forEach((field) => {
      if (composition[field] !== undefined) {
        errors.push(`${field} não é permitido pelo perfil CMD.`);
      }
    });
  }

  validateRelatesTo(composition, errors) {
    const relatesTo = composition.relatesTo;

    if (relatesTo === undefined) return;

    if (!Array.isArray(relatesTo) || relatesTo.length > 1) {
      errors.push('relatesTo pode conter no máximo um elemento.');
      return;
    }

    relatesTo.forEach((relation, index) => {
      if (relation.code !== 'replaces') {
        errors.push(`relatesTo[${index}].code deve ser "replaces".`);
      }

      const target = relation.targetReference;

      if (!target || !target.reference) {
        errors.push(
          `relatesTo[${index}].targetReference.reference é obrigatório.`
        );
      }

      if (relation.targetIdentifier !== undefined) {
        errors.push(
          `relatesTo[${index}].targetIdentifier não é permitido pelo perfil CMD.`
        );
      }
    });
  }

  validateSections(composition, errors) {
    const sections = composition.section;

    if (!Array.isArray(sections) || sections.length < 1) {
      errors.push('section deve conter pelo menos um elemento.');
      return;
    }

    const found = new Set();
    const counts = {};

    sections.forEach((section, index) => {
      if (!section || typeof section !== 'object') {
        errors.push(`section[${index}] deve ser um objeto.`);
        return;
      }

      for (const field of [
        'title',
        'code',
        'author',
        'focus',
        'text',
        'mode',
        'orderedBy',
        'emptyReason',
        'section',
      ]) {
        if (section[field] !== undefined) {
          errors.push(
            `section[${index}].${field} não é permitido pelo perfil.`
          );
        }
      }

      if (!Array.isArray(section.entry) || section.entry.length < 1) {
        errors.push(
          `section[${index}].entry deve conter pelo menos um elemento.`
        );
        return;
      }

      section.entry.forEach((entry, entryIndex) => {
        if (!entry || typeof entry !== 'object') {
          errors.push(
            `section[${index}].entry[${entryIndex}] deve ser um objeto Reference.`
          );
          return;
        }

        if (entry.type !== undefined) {
          errors.push(
            `section[${index}].entry[${entryIndex}].type não é permitido.`
          );
        }

        if (entry.display !== undefined) {
          errors.push(
            `section[${index}].entry[${entryIndex}].display não é permitido.`
          );
        }

        const reference = entry.reference;

        if (reference) {
          if (entry.identifier !== undefined) {
            errors.push(
              `section[${index}].entry[${entryIndex}] não pode conter reference e identifier simultaneamente.`
            );
          }

          const resourceType = reference.split('/')[0];
          const sliceName = SECTION_RESOURCE_TYPES[resourceType];

          if (sliceName) {
            found.add(sliceName);
            counts[sliceName] = (counts[sliceName] || 0) + 1;
          }
        } else if (entry.identifier) {
          const identifier = entry.identifier;

          if (!identifier.system) {
            errors.push(
              `section[${index}].entry[${entryIndex}].identifier.system é obrigatório.`
            );
          }

          if (!identifier.value) {
            errors.push(
              `section[${index}].entry[${entryIndex}].identifier.value é obrigatório.`
            );
          }

          for (const field of ['use', 'type', 'period', 'assigner']) {
            if (identifier[field] !== undefined) {
              errors.push(
                `section[${index}].entry[${entryIndex}].identifier.${field} não é permitido.`
              );
            }
          }
        } else {
          errors.push(
            `section[${index}].entry[${entryIndex}] deve conter reference ou identifier.`
          );
        }
      });

      // As seções abaixo exigem exatamente uma entrada.
      // A seção de alergias e a de marcos de desenvolvimento admitem múltiplas.
      const sectionTypes = section.entry
        .map((entry) => entry?.reference?.split('/')[0])
        .filter(Boolean);

      const singleEntryTypes = [
        'Encounter',
        'Condition',
        'Procedure',
        'Observation',
        'MedicationRequest',
        'CarePlan',
        'DocumentReference',
      ];

      if (
        sectionTypes.some((type) => singleEntryTypes.includes(type)) &&
        section.entry.length !== 1
      ) {
        errors.push(
          `section[${index}].entry deve conter exatamente um elemento para esse tipo de seção.`
        );
      }
    });

    const requiredSections = [
      'informacoesContatoAssistencial',
      'problemasDiagnosticosAvaliados',
      'procedimentosRealizados',
    ];

    requiredSections.forEach((name) => {
      if (!found.has(name)) {
        errors.push(
          `A seção obrigatória "${name}" não foi identificada pelas referências informadas.`
        );
      }
    });

    const maxOneSections = [
      'prescricao',
      'planoCuidados',
      'marcosDesenvolvimento',
    ];

    maxOneSections.forEach((name) => {
      if ((counts[name] || 0) > 1) {
        errors.push(`A seção "${name}" permite no máximo uma ocorrência.`);
      }
    });
  }
}

module.exports = new BRRegistroAtendimentoClinicoValidator();
