/**
 * MCF to DataCommons JSON Converter
 * Formats MCF for DataCommons Knowledge Graph API
 */

export function convertToDataCommonsJSON(observations, variables) {
  return {
    nodes: [
      ...variables.map(v => ({
        dcid: v.dcid,
        typeOf: 'StatisticalVariable',
        name: v.name,
        description: v.description,
        populationType: v.populationType,
        measuredProperty: v.measuredProperty
      })),
      ...observations.map(obs => ({
        dcid: obs.dcid,
        typeOf: 'StatVarObservation',
        variableMeasured: obs.variableMeasured,
        observationAbout: obs.observationAbout,
        observationDate: obs.observationDate,
        value: obs.value,
        unit: obs.unit
      }))
    ]
  };
}

