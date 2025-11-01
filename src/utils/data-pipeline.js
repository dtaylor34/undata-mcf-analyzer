/**
 * DataPipeline Orchestrator
 * Manages MCF transformation and diff generation across all formats
 */

import { parseMCF, extractStatisticalVariables, extractObservations } from '../mcf-parser.js';
import { convertToSDMXJSON } from './mcf-to-stat.js';
import { convertToDataCommonsJSON } from './mcf-to-datacommons.js';
import { generateOptimizedCache } from './mcf-to-cache.js';

export class DataPipeline {
  constructor(currentMCF, previousMCF = null) {
    this.source = currentMCF;
    this.compare = previousMCF;
    
    // Parse both versions
    this.current = this.parse(currentMCF);
    this.previous = previousMCF ? this.parse(previousMCF) : null;
    
    // Generate all transformations upfront
    this.transformations = {
      stat: this.toSTAT(this.current),
      datacommons: this.toDataCommons(this.current),
      cached: this.toCached(this.current)
    };
    
    // If comparing, generate diffs for ALL formats
    if (this.previous) {
      this.diffs = {
        mcf: this.diffMCF(this.previous, this.current),
        stat: this.diffSTAT(
          this.toSTAT(this.previous),
          this.toSTAT(this.current)
        ),
        datacommons: this.diffDataCommons(
          this.toDataCommons(this.previous),
          this.toDataCommons(this.current)
        ),
        cached: this.diffCached(
          this.toCached(this.previous),
          this.toCached(this.current)
        ),
        charts: this.diffCharts(
          this.toCached(this.previous).charts,
          this.toCached(this.current).charts
        )
      };
      
      // Analyze impact
      this.impact = this.analyzeImpact(this.diffs);
    }
  }
  
  parse(mcfContent) {
    const nodes = parseMCF(mcfContent);
    const variables = extractStatisticalVariables(nodes);
    const observations = extractObservations(nodes);
    
    return {
      raw: mcfContent,
      nodes,
      variables,
      observations,
      variableCount: variables.length,
      observationCount: observations.length
    };
  }
  
  toSTAT(parsed) {
    return convertToSDMXJSON(parsed.observations, parsed.variables);
  }
  
  toDataCommons(parsed) {
    return convertToDataCommonsJSON(parsed.observations, parsed.variables);
  }
  
  toCached(parsed) {
    return generateOptimizedCache(parsed.observations, parsed.variables);
  }
  
  // MCF Diff
  diffMCF(previous, current) {
    const addedNodes = current.nodes.filter(n => 
      !previous.nodes.some(pn => pn.dcid === n.dcid)
    );
    
    const removedNodes = previous.nodes.filter(n => 
      !current.nodes.some(cn => cn.dcid === n.dcid)
    );
    
    const modifiedNodes = current.nodes.filter(n => {
      const prev = previous.nodes.find(pn => pn.dcid === n.dcid);
      return prev && JSON.stringify(prev) !== JSON.stringify(n);
    });
    
    return {
      hasChanges: addedNodes.length > 0 || removedNodes.length > 0 || modifiedNodes.length > 0,
      changeCount: addedNodes.length + removedNodes.length + modifiedNodes.length,
      addedNodes,
      removedNodes,
      modifiedNodes,
      addedObservations: current.observations.filter(o => 
        !previous.observations.some(po => po.dcid === o.dcid)
      ),
      removedObservations: previous.observations.filter(o => 
        !current.observations.some(co => co.dcid === o.dcid)
      ),
      addedVariables: current.variables.filter(v => 
        !previous.variables.some(pv => pv.dcid === v.dcid)
      ),
      removedVariables: previous.variables.filter(v => 
        !current.variables.some(cv => cv.dcid === v.dcid)
      )
    };
  }
  
  // .STAT Diff
  diffSTAT(previousSTAT, currentSTAT) {
    // Detect DSD changes
    const dsdChanges = this.detectDSDChanges(previousSTAT, currentSTAT);
    
    // Detect codelist changes
    const codelistChanges = this.detectCodelistChanges(previousSTAT, currentSTAT);
    
    // Observation changes
    const observations = {
      added: currentSTAT.observations.length - previousSTAT.observations.length,
      removed: previousSTAT.observations.length - currentSTAT.observations.length,
      modified: 0 // TODO: Implement modification detection
    };
    
    return {
      hasChanges: dsdChanges.length > 0 || codelistChanges.length > 0 || observations.added !== 0,
      changeCount: dsdChanges.length + codelistChanges.length + Math.abs(observations.added),
      hasBreakingChanges: dsdChanges.some(c => c.breaking),
      dsdChanges,
      codelistChanges,
      observations
    };
  }
  
  detectDSDChanges(prev, curr) {
    const changes = [];
    
    // Check for new dimensions
    const prevDimensions = prev.dimensions || [];
    const currDimensions = curr.dimensions || [];
    
    const newDimensions = currDimensions.filter(d => 
      !prevDimensions.some(pd => pd.id === d.id)
    );
    
    newDimensions.forEach(dim => {
      changes.push({
        type: 'added',
        dimension: dim.id,
        description: `New dimension "${dim.name}" added`,
        breaking: true
      });
    });
    
    return changes;
  }
  
  detectCodelistChanges(prev, curr) {
    // Simplified codelist diff
    return [];
  }
  
  // DataCommons Diff
  diffDataCommons(previousDC, currentDC) {
    const newNodes = currentDC.nodes.length - previousDC.nodes.length;
    
    return {
      hasChanges: newNodes !== 0,
      changeCount: Math.abs(newNodes),
      hasBreakingChanges: false,
      newNodes,
      modifiedNodes: 0
    };
  }
  
  // Cached Diff
  diffCached(previousCache, currentCache) {
    const chartsAffected = Math.abs(
      currentCache.charts.length - previousCache.charts.length
    );
    
    return {
      hasChanges: chartsAffected > 0,
      changeCount: chartsAffected,
      chartsAffected
    };
  }
  
  // Chart Diff
  diffCharts(previousCharts, currentCharts) {
    const changedCharts = currentCharts.filter(cc => {
      const prev = previousCharts.find(pc => pc.id === cc.id);
      return prev && JSON.stringify(prev.data) !== JSON.stringify(cc.data);
    }).map(c => c.id);
    
    return {
      hasChanges: changedCharts.length > 0,
      oldCharts: previousCharts,
      newCharts: currentCharts,
      changedCharts
    };
  }
  
  // Impact Analysis
  analyzeImpact(diffs) {
    return {
      observations: {
        added: diffs.mcf.addedObservations.length,
        removed: diffs.mcf.removedObservations.length,
        modified: diffs.mcf.modifiedNodes.filter(n => 
          n.typeOf === 'dcs:StatVarObservation'
        ).length
      },
      variables: {
        added: diffs.mcf.addedVariables.length,
        removed: diffs.mcf.removedVariables.length
      },
      statImpact: {
        changes: diffs.stat.changeCount,
        breaking: diffs.stat.hasBreakingChanges
      },
      dcImpact: {
        newNodes: diffs.datacommons.newNodes,
        breaking: diffs.datacommons.hasBreakingChanges
      },
      cacheImpact: {
        chartsAffected: diffs.cached.chartsAffected
      },
      breakingChanges: this.identifyBreakingChanges(diffs)
    };
  }
  
  identifyBreakingChanges(diffs) {
    const breaking = [];
    
    if (diffs.stat.hasBreakingChanges) {
      breaking.push({
        system: '.STAT',
        description: 'DSD structure changes detected',
        severity: 'high'
      });
    }
    
    if (diffs.mcf.removedVariables.length > 0) {
      breaking.push({
        system: 'All',
        description: `${diffs.mcf.removedVariables.length} variables removed`,
        severity: 'high'
      });
    }
    
    return breaking;
  }
  
  // Schema validation
  validateSchema() {
    return {
      mcf: this.validateMCFSchema(this.current),
      stat: this.validateSDMXCompatibility(this.transformations.stat),
      datacommons: this.validateDCSchema(this.transformations.datacommons)
    };
  }
  
  validateMCFSchema(parsed) {
    return {
      isValid: parsed.variableCount > 0 && parsed.observationCount >= 0,
      errors: []
    };
  }
  
  validateSDMXCompatibility(statData) {
    return {
      isValid: true,
      errors: []
    };
  }
  
  validateDCSchema(dcData) {
    return {
      isValid: true,
      errors: []
    };
  }
  
  // Schema evolution detection
  detectSchemaChanges() {
    if (!this.previous) return null;
    
    const addedDimensions = this.findNewDimensions();
    const removedDimensions = this.findRemovedDimensions();
    
    return {
      addedDimensions,
      removedDimensions,
      modifiedProperties: [],
      breakingChanges: this.impact.breakingChanges
    };
  }
  
  findNewDimensions() {
    // Simplified - detect new properties in observations
    return [];
  }
  
  findRemovedDimensions() {
    return [];
  }
}

