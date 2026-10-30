const PROFILE_URL =
  'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRContatoAssistencial-1.0';

class BRContatoAssistencialValidator {
  validate(encounter) {
    const errors = [];

    if (!encounter || typeof encounter !== 'object') {
      throw new Error('Encounter inválido.');
    }

    this.validateResourceType(encounter, errors);
    this.validateProfile(encounter, errors);
    this.validateStatus(encounter, errors);
    this.validateForbiddenFields(encounter, errors);
    this.validateClass(encounter, errors);
    this.validateType(encounter, errors);
    this.validatePriority(encounter, errors);
    this.validateSubject(encounter, errors);
    this.validateParticipants(encounter, errors);
    this.validatePeriod(encounter, errors);
    this.validateReasonReference(encounter, errors);
    this.validateDiagnosis(encounter, errors);
    this.validateHospitalization(encounter, errors);
    this.validateLocation(encounter, errors);
    this.validateServiceProvider(encounter, errors);
    this.validatePartOf(encounter, errors);

    if (errors.length > 0) {
      const error = new Error(
        `Encounter não atende ao perfil BRContatoAssistencial-1.0:\n- ${errors.join(
          '\n- '
        )}`
      );

      error.statusCode = 400;
      throw error;
    }

    return true;
  }

  validateResourceType(encounter, errors) {
    if (encounter.resourceType !== 'Encounter') {
      errors.push('resourceType deve ser Encounter.');
    }
  }

  validateProfile(encounter, errors) {
    if (!encounter.meta?.profile?.includes(PROFILE_URL)) {
      errors.push(`meta.profile deve conter ${PROFILE_URL}.`);
    }
  }

  validateStatus(encounter, errors) {
    const validStatuses = ['finished', 'entered-in-error'];

    if (!validStatuses.includes(encounter.status)) {
      errors.push('status deve ser finished ou entered-in-error.');
    }
  }

  validateForbiddenFields(encounter, errors) {
    const forbidden = [
      'identifier',
      'statusHistory',
      'classHistory',
      'serviceType',
      'episodeOfCare',
      'basedOn',
      'appointment',
      'length',
      'reasonCode',
      'account',
    ];

    forbidden.forEach((field) => {
      if (encounter[field] !== undefined) {
        errors.push(`${field} não é permitido pelo perfil.`);
      }
    });

    if (encounter.class) {
      if (encounter.class.display !== undefined) {
        errors.push('class.display não é permitido.');
      }

      if (encounter.class.userSelected !== undefined) {
        errors.push('class.userSelected não é permitido.');
      }
    }

    if (encounter.subject) {
      if (encounter.subject.reference !== undefined) {
        errors.push('subject.reference não é permitido.');
      }

      if (encounter.subject.display !== undefined) {
        errors.push('subject.display não é permitido.');
      }

      if (encounter.subject.type !== undefined) {
        errors.push('subject.type não é permitido.');
      }

      this.validateForbiddenIdentifierFields(
        encounter.subject.identifier,
        'subject.identifier',
        errors
      );
    }
  }

  validateForbiddenIdentifierFields(identifier, path, errors) {
    if (!identifier) return;

    ['use', 'type', 'period', 'assigner'].forEach((field) => {
      if (identifier[field] !== undefined) {
        errors.push(`${path}.${field} não é permitido.`);
      }
    });
  }

  validateCoding(coding, path, errors) {
    if (!coding || typeof coding !== 'object') {
      errors.push(`${path} é obrigatório.`);
      return;
    }

    if (!coding.system) {
      errors.push(`${path}.system é obrigatório.`);
    }

    if (!coding.code) {
      errors.push(`${path}.code é obrigatório.`);
    }

    if (coding.display !== undefined) {
      errors.push(`${path}.display não é permitido.`);
    }

    if (coding.userSelected !== undefined) {
      errors.push(`${path}.userSelected não é permitido.`);
    }
  }

  validateCodeableConcept(concept, path, errors) {
    if (!concept || !Array.isArray(concept.coding)) {
      errors.push(`${path}.coding é obrigatório.`);
      return;
    }

    if (concept.coding.length !== 1) {
      errors.push(`${path}.coding deve conter exatamente um elemento.`);
      return;
    }

    this.validateCoding(concept.coding[0], `${path}.coding[0]`, errors);

    if (concept.text !== undefined) {
      errors.push(`${path}.text não é permitido.`);
    }
  }

  validateClass(encounter, errors) {
    this.validateCoding(encounter.class, 'class', errors);
  }

  validateType(encounter, errors) {
    if (encounter.type === undefined) return;

    if (!Array.isArray(encounter.type) || encounter.type.length !== 1) {
      errors.push('type deve conter no máximo um elemento.');
      return;
    }

    this.validateCodeableConcept(encounter.type[0], 'type[0]', errors);
  }

  validatePriority(encounter, errors) {
    this.validateCodeableConcept(encounter.priority, 'priority', errors);
  }

  validateSubject(encounter, errors) {
    const identifier = encounter.subject?.identifier;

    if (!identifier) {
      errors.push('subject.identifier é obrigatório.');
      return;
    }

    if (!identifier.system) {
      errors.push('subject.identifier.system é obrigatório.');
    }

    if (!identifier.value) {
      errors.push('subject.identifier.value é obrigatório.');
    }

    this.validateForbiddenIdentifierFields(
      identifier,
      'subject.identifier',
      errors
    );
  }

  validateParticipants(encounter, errors) {
    if (!Array.isArray(encounter.participant)) return;

    encounter.participant.forEach((participant, index) => {
      const path = `participant[${index}]`;

      if (participant.period !== undefined) {
        errors.push(`${path}.period não é permitido.`);
      }

      if (participant.individual) {
        const individual = participant.individual;

        if (!individual.identifier) {
          errors.push(`${path}.individual.identifier é obrigatório.`);
        } else {
          if (!individual.identifier.system) {
            errors.push(`${path}.individual.identifier.system é obrigatório.`);
          }

          if (!individual.identifier.value) {
            errors.push(`${path}.individual.identifier.value é obrigatório.`);
          }

          this.validateForbiddenIdentifierFields(
            individual.identifier,
            `${path}.individual.identifier`,
            errors
          );
        }

        ['reference', 'type', 'display'].forEach((field) => {
          if (individual[field] !== undefined) {
            errors.push(`${path}.individual.${field} não é permitido.`);
          }
        });
      }
    });
  }

  validatePeriod(encounter, errors) {
    if (!encounter.period) {
      errors.push('period é obrigatório.');
      return;
    }

    if (!encounter.period.start) {
      errors.push('period.start é obrigatório.');
    }
  }

  validateReasonReference(encounter, errors) {
    if (encounter.reasonReference === undefined) return;

    if (!Array.isArray(encounter.reasonReference)) {
      errors.push('reasonReference deve ser uma lista.');
      return;
    }

    if (encounter.reasonReference.length > 1) {
      errors.push('reasonReference permite no máximo um elemento.');
    }

    encounter.reasonReference.forEach((reference, index) => {
      if (!reference.reference) {
        errors.push(`reasonReference[${index}].reference é obrigatório.`);
      }

      ['type', 'identifier', 'display'].forEach((field) => {
        if (reference[field] !== undefined) {
          errors.push(`reasonReference[${index}].${field} não é permitido.`);
        }
      });
    });
  }

  validateDiagnosis(encounter, errors) {
    if (
      !Array.isArray(encounter.diagnosis) ||
      encounter.diagnosis.length === 0
    ) {
      errors.push('diagnosis deve possuir pelo menos um elemento.');
      return;
    }

    encounter.diagnosis.forEach((diagnosis, index) => {
      const path = `diagnosis[${index}]`;

      if (!diagnosis.condition?.reference) {
        errors.push(`${path}.condition.reference é obrigatório.`);
      }

      if (diagnosis.condition?.identifier !== undefined) {
        errors.push(`${path}.condition.identifier não é permitido.`);
      }

      if (diagnosis.condition?.display !== undefined) {
        errors.push(`${path}.condition.display não é permitido.`);
      }

      if (diagnosis.condition?.type !== undefined) {
        errors.push(`${path}.condition.type não é permitido.`);
      }

      if (diagnosis.use) {
        this.validateCodeableConcept(diagnosis.use, `${path}.use`, errors);
      }
    });
  }

  validateHospitalization(encounter, errors) {
    const hospitalization = encounter.hospitalization;

    if (!hospitalization) {
      errors.push('hospitalization é obrigatório.');
      return;
    }

    this.validateCodeableConcept(
      hospitalization.admitSource,
      'hospitalization.admitSource',
      errors
    );

    this.validateCodeableConcept(
      hospitalization.dischargeDisposition,
      'hospitalization.dischargeDisposition',
      errors
    );

    const forbidden = [
      'preAdmissionIdentifier',
      'origin',
      'reAdmission',
      'dietPreference',
      'specialCourtesy',
      'specialArrangement',
      'destination',
    ];

    forbidden.forEach((field) => {
      if (hospitalization[field] !== undefined) {
        errors.push(`hospitalization.${field} não é permitido.`);
      }
    });
  }

  validateLocation(encounter, errors) {
    if (encounter.location === undefined) return;

    if (!Array.isArray(encounter.location) || encounter.location.length > 1) {
      errors.push('location permite no máximo um elemento.');
      return;
    }

    encounter.location.forEach((item, index) => {
      if (!item.location?.reference) {
        errors.push(`location[${index}].location.reference é obrigatório.`);
      }

      ['type', 'identifier', 'display'].forEach((field) => {
        if (item.location?.[field] !== undefined) {
          errors.push(`location[${index}].location.${field} não é permitido.`);
        }
      });

      ['status', 'physicalType', 'period'].forEach((field) => {
        if (item[field] !== undefined) {
          errors.push(`location[${index}].${field} não é permitido.`);
        }
      });
    });
  }

  validateServiceProvider(encounter, errors) {
    const provider = encounter.serviceProvider;

    if (!provider?.identifier) {
      errors.push('serviceProvider.identifier é obrigatório.');
      return;
    }

    if (!provider.identifier.system) {
      errors.push('serviceProvider.identifier.system é obrigatório.');
    }

    if (!provider.identifier.value) {
      errors.push('serviceProvider.identifier.value é obrigatório.');
    }

    ['reference', 'type', 'display'].forEach((field) => {
      if (provider[field] !== undefined) {
        errors.push(`serviceProvider.${field} não é permitido.`);
      }
    });

    this.validateForbiddenIdentifierFields(
      provider.identifier,
      'serviceProvider.identifier',
      errors
    );
  }

  validatePartOf(encounter, errors) {
    if (encounter.partOf === undefined) return;

    if (!encounter.partOf.reference) {
      errors.push('partOf.reference é obrigatório.');
    }

    ['type', 'identifier', 'display'].forEach((field) => {
      if (encounter.partOf[field] !== undefined) {
        errors.push(`partOf.${field} não é permitido.`);
      }
    });
  }
}

module.exports = new BRContatoAssistencialValidator();
