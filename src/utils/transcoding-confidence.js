/**
 * Confidence Scoring for Transcoding Mappings
 * 
 * Analyzes OLD → NEW taxonomy mappings and assigns confidence scores
 * to determine which mappings need human review vs. auto-approval
 */

/**
 * Calculate Levenshtein distance (string similarity)
 * Returns similarity ratio between 0 and 1
 */
function levenshteinSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 1;
  
  const len1 = s1.length;
  const len2 = s2.length;
  
  // Create distance matrix
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return 1 - (distance / maxLen);
}

/**
 * Known mapping patterns that are always correct
 */
const KNOWN_PATTERNS = [
  // Total/No breakdown patterns
  { old: /^TOTAL$/i, new: /^_T$/i, confidence: 100, name: 'Total/No Breakdown' },
  { old: /^_T$/i, new: /^_T$/i, confidence: 100, name: 'Exact Total Match' },
  
  // Sex/Gender patterns
  { old: /^M$/i, new: /^M$/i, confidence: 100, name: 'Male' },
  { old: /^F$/i, new: /^F$/i, confidence: 100, name: 'Female' },
  { old: /^MALE$/i, new: /^M$/i, confidence: 100, name: 'Male (expanded)' },
  { old: /^FEMALE$/i, new: /^F$/i, confidence: 100, name: 'Female (expanded)' },
  
  // Age group patterns (Y15T24 → 15-24)
  { old: /^Y(\d+)T(\d+)$/i, new: /^(\d+)-(\d+)$/i, confidence: 95, name: 'Age Range' },
  { old: /^Y_GE(\d+)$/i, new: /^(\d+)\+$/i, confidence: 95, name: 'Age 65+' },
  
  // ISIC codes (International Standard Industrial Classification)
  { old: /^ISIC(\d)_([A-Z0-9]+)$/i, new: /^ISIC(\d)_([A-Z0-9]+)$/i, confidence: 100, name: 'ISIC Code' },
  
  // Education levels
  { old: /^ISCED/i, new: /^ISCED/i, confidence: 95, name: 'Education Level' },
  
  // Location codes
  { old: /^URB$/i, new: /^URBAN$/i, confidence: 100, name: 'Urban' },
  { old: /^RUR$/i, new: /^RURAL$/i, confidence: 100, name: 'Rural' },
];

/**
 * Check if mapping matches a known pattern
 */
function matchesKnownPattern(oldCode, newCode) {
  if (!oldCode || !newCode) return null;
  
  for (const pattern of KNOWN_PATTERNS) {
    if (pattern.old.test(oldCode) && pattern.new.test(newCode)) {
      return {
        matched: true,
        patternName: pattern.name,
        confidence: pattern.confidence
      };
    }
  }
  
  return null;
}

/**
 * Calculate comprehensive confidence score for a mapping
 * Returns score 0-100
 */
export function calculateConfidence(row) {
  const oldCode = row.EnumerationValue_Code || row.enum_value_code || '';
  const newCode = row.EnumerationValue_Code2 || row.enum_value_code2 || '';
  const oldName = row.EnumerationValue_Name || row.enum_value_name || '';
  const newName = row.EnumerationValue_Name2 || row.enum_value_name2 || '';
  
  let score = 0;
  let reasons = [];
  
  // 1. Exact code match (100% confidence)
  if (oldCode && newCode && oldCode.trim() === newCode.trim()) {
    return {
      score: 100,
      level: 'high',
      reasons: ['Exact code match'],
      autoApprove: true
    };
  }
  
  // 2. Check known patterns (95-100% confidence)
  const patternMatch = matchesKnownPattern(oldCode, newCode);
  if (patternMatch) {
    return {
      score: patternMatch.confidence,
      level: patternMatch.confidence >= 95 ? 'high' : 'medium',
      reasons: [`Matches known pattern: ${patternMatch.patternName}`],
      autoApprove: patternMatch.confidence >= 95
    };
  }
  
  // 3. String similarity for codes
  const codeSimilarity = levenshteinSimilarity(oldCode, newCode);
  if (codeSimilarity >= 0.8) {
    score += 40;
    reasons.push(`High code similarity (${Math.round(codeSimilarity * 100)}%)`);
  } else if (codeSimilarity >= 0.6) {
    score += 25;
    reasons.push(`Moderate code similarity (${Math.round(codeSimilarity * 100)}%)`);
  } else if (codeSimilarity >= 0.4) {
    score += 15;
    reasons.push(`Low code similarity (${Math.round(codeSimilarity * 100)}%)`);
  }
  
  // 4. String similarity for names
  const nameSimilarity = levenshteinSimilarity(oldName, newName);
  if (nameSimilarity >= 0.8) {
    score += 40;
    reasons.push(`High name similarity (${Math.round(nameSimilarity * 100)}%)`);
  } else if (nameSimilarity >= 0.6) {
    score += 25;
    reasons.push(`Moderate name similarity (${Math.round(nameSimilarity * 100)}%)`);
  } else if (nameSimilarity >= 0.4) {
    score += 15;
    reasons.push(`Low name similarity (${Math.round(nameSimilarity * 100)}%)`);
  }
  
  // 5. Enumeration type consistency (same parent type)
  const oldEnum = row.Enumeration_Code || row.enumeration_code || '';
  const newEnum = row.Enumeration_Code2 || row.enumeration_code2 || '';
  if (oldEnum && newEnum) {
    const enumSimilarity = levenshteinSimilarity(oldEnum, newEnum);
    if (enumSimilarity >= 0.7) {
      score += 20;
      reasons.push('Consistent enumeration type');
    }
  }
  
  // 6. Check for suspicious mappings
  const suspiciousFlags = [];
  if (!newCode || newCode.trim() === '') {
    suspiciousFlags.push('Missing new code');
    score = Math.max(0, score - 30);
  }
  if (codeSimilarity < 0.3 && nameSimilarity < 0.3) {
    suspiciousFlags.push('Low similarity in both code and name');
    score = Math.max(0, score - 20);
  }
  
  // Ensure score is between 0 and 100
  score = Math.min(100, Math.max(0, score));
  
  // Determine confidence level and auto-approve flag
  let level = 'low';
  let autoApprove = false;
  
  if (score >= 90) {
    level = 'high';
    autoApprove = true;
  } else if (score >= 70) {
    level = 'medium';
    autoApprove = false;
  } else {
    level = 'low';
    autoApprove = false;
  }
  
  return {
    score: Math.round(score),
    level,
    reasons,
    suspiciousFlags,
    autoApprove
  };
}

/**
 * Group mappings by enumeration type for bulk review
 */
export function groupMappingsByEnumeration(mappings) {
  const groups = {};
  
  mappings.forEach(mapping => {
    const enumCode = mapping.Enumeration_Code || mapping.enumeration_code || 'UNKNOWN';
    
    if (!groups[enumCode]) {
      groups[enumCode] = {
        enumeration: enumCode,
        name: mapping.Enumeration_Name || mapping.enumeration_name || enumCode,
        mappings: [],
        stats: {
          total: 0,
          highConfidence: 0,
          mediumConfidence: 0,
          lowConfidence: 0,
          autoApproved: 0
        }
      };
    }
    
    const confidence = calculateConfidence(mapping);
    const mappingWithConfidence = {
      ...mapping,
      confidence
    };
    
    groups[enumCode].mappings.push(mappingWithConfidence);
    groups[enumCode].stats.total++;
    
    if (confidence.level === 'high') groups[enumCode].stats.highConfidence++;
    if (confidence.level === 'medium') groups[enumCode].stats.mediumConfidence++;
    if (confidence.level === 'low') groups[enumCode].stats.lowConfidence++;
    if (confidence.autoApprove) groups[enumCode].stats.autoApproved++;
  });
  
  // Calculate average confidence for each group
  Object.values(groups).forEach(group => {
    const totalScore = group.mappings.reduce((sum, m) => sum + m.confidence.score, 0);
    group.averageConfidence = Math.round(totalScore / group.mappings.length);
  });
  
  return groups;
}

/**
 * Get statistics across all mappings
 */
export function getTranscodingStats(mappings) {
  const stats = {
    total: mappings.length,
    highConfidence: 0,
    mediumConfidence: 0,
    lowConfidence: 0,
    autoApproved: 0,
    needsReview: 0
  };
  
  mappings.forEach(mapping => {
    const confidence = calculateConfidence(mapping);
    
    if (confidence.level === 'high') stats.highConfidence++;
    if (confidence.level === 'medium') stats.mediumConfidence++;
    if (confidence.level === 'low') stats.lowConfidence++;
    if (confidence.autoApprove) stats.autoApproved++;
    if (!confidence.autoApprove) stats.needsReview++;
  });
  
  // Calculate percentages
  stats.autoApprovedPercent = Math.round((stats.autoApproved / stats.total) * 100);
  stats.needsReviewPercent = Math.round((stats.needsReview / stats.total) * 100);
  stats.timeSaved = Math.round(((stats.total - stats.needsReview) / stats.total) * 100);
  
  return stats;
}

