/**
 * Permission Management System
 * Handles user access control and data filtering
 */

// Permission levels
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
};

// Mock permission database (in production, this would be a backend API)
const PERMISSIONS_DB = {
  // Admin users have full access
  'admin@undata.org': {
    role: ROLES.ADMIN,
    organizations: ['*'], // Wildcard = all
    files: ['*'],
    canShare: true,
    canManagePermissions: true
  },
  
  // Example user with limited access
  'researcher@example.com': {
    role: ROLES.USER,
    organizations: ['who', 'unicef'], // Only WHO and UNICEF
    files: ['who/schema/sv.mcf', 'unicef/schema/sv.mcf'], // Specific files
    canShare: true,
    canManagePermissions: false
  },
  
  // Example guest with very limited access
  'guest@example.com': {
    role: ROLES.GUEST,
    organizations: ['who'], // Only WHO
    files: ['who/schema/sv.mcf'], // Only one file
    canShare: false,
    canManagePermissions: false
  }
};

// Token-based permission grants (for shareable links)
const TOKEN_PERMISSIONS = {
  'tok_who_tobacco': {
    organizations: ['who'],
    files: ['who/schema/sv.mcf'],
    dataSources: ['WHO__Adult_curr_tob_use.csv'],
    expiresAt: null, // No expiration
    grantedBy: 'admin@undata.org',
    purpose: 'WHO Tobacco Research Access'
  },
  
  'tok_unicef_education': {
    organizations: ['unicef'],
    files: ['unicef/schema/sv.mcf'],
    dataSources: ['UNICEF__Education_*.csv'],
    expiresAt: new Date('2025-12-31').toISOString(),
    grantedBy: 'admin@undata.org',
    purpose: 'UNICEF Education Data Access'
  }
};

/**
 * Get user permissions (from mock DB or backend API)
 * @param {string} userId - User email or ID
 * @returns {Object|null} User permissions object
 */
export function getUserPermissions(userId) {
  // In production, this would call a backend API
  return PERMISSIONS_DB[userId] || null;
}

/**
 * Get permissions from share token
 * @param {string} token - Share token from URL
 * @returns {Object|null} Token permissions object
 */
export function getTokenPermissions(token) {
  const perms = TOKEN_PERMISSIONS[token];
  
  // Check if token is expired
  if (perms && perms.expiresAt) {
    if (new Date(perms.expiresAt) < new Date()) {
      console.warn('Token expired:', token);
      return null;
    }
  }
  
  return perms || null;
}

/**
 * Check if user has access to an organization
 * @param {Object} permissions - User or token permissions
 * @param {string} orgId - Organization ID (e.g., 'who')
 * @returns {boolean}
 */
export function canAccessOrganization(permissions, orgId) {
  if (!permissions) return false;
  
  // Test data is publicly accessible
  if (orgId === 'sdg') return true; // SDG test-data is public for demos
  
  // Admin has access to everything
  if (permissions.organizations.includes('*')) return true;
  
  // Check if org is in allowed list
  return permissions.organizations.includes(orgId);
}

/**
 * Check if user has access to a specific file
 * @param {Object} permissions - User or token permissions
 * @param {string} fileId - File ID (e.g., 'who/schema/sv.mcf')
 * @returns {boolean}
 */
export function canAccessFile(permissions, fileId) {
  if (!permissions) return false;
  
  // Test data is publicly accessible
  if (fileId && fileId.startsWith('sdg/')) return true; // All SDG files are public for demos
  
  // Admin has access to everything
  if (permissions.files.includes('*')) return true;
  
  // Check if file is in allowed list
  return permissions.files.includes(fileId);
}

/**
 * Check if user has access to a data source (CSV file)
 * @param {Object} permissions - User or token permissions
 * @param {string} dataSource - Data source filename
 * @returns {boolean}
 */
export function canAccessDataSource(permissions, dataSource) {
  if (!permissions) return false;
  if (!permissions.dataSources) return true; // No restriction
  
  // Admin or no restriction
  if (permissions.dataSources.includes('*')) return true;
  
  // Check exact match or wildcard pattern
  return permissions.dataSources.some(allowed => {
    if (allowed.includes('*')) {
      // Simple wildcard matching (e.g., "WHO__*" matches "WHO__Adult_curr_tob_use.csv")
      const pattern = allowed.replace(/\*/g, '.*');
      return new RegExp(pattern).test(dataSource);
    }
    return allowed === dataSource;
  });
}

/**
 * Filter organizations based on user permissions
 * @param {Array} organizations - All available organizations
 * @param {Object} permissions - User or token permissions
 * @returns {Array} Filtered organizations
 */
export function filterOrganizations(organizations, permissions) {
  if (!permissions) return [];
  if (permissions.organizations.includes('*')) return organizations;
  
  return organizations.filter(org => 
    permissions.organizations.includes(org.id)
  );
}

/**
 * Filter files based on user permissions
 * @param {Array} files - All available files for an organization
 * @param {Object} permissions - User or token permissions
 * @returns {Array} Filtered files
 */
export function filterFiles(files, permissions) {
  if (!permissions) return [];
  if (permissions.files.includes('*')) return files;
  
  return files.filter(file => 
    permissions.files.includes(file.id)
  );
}

/**
 * Filter data sources based on user permissions
 * @param {Array} dataSources - All available data sources
 * @param {Object} permissions - User or token permissions
 * @returns {Array} Filtered data sources
 */
export function filterDataSources(dataSources, permissions) {
  if (!permissions) return [];
  if (!permissions.dataSources) return dataSources; // No restriction
  if (permissions.dataSources.includes('*')) return dataSources;
  
  return dataSources.filter(ds => canAccessDataSource(permissions, ds));
}

/**
 * Generate a shareable token with specific permissions
 * @param {Object} config - Token configuration
 * @returns {string} Token string
 */
export function generateShareToken(config) {
  // In production, this would create a token in the backend
  const tokenId = `tok_${config.org}_${Date.now()}`;
  
  TOKEN_PERMISSIONS[tokenId] = {
    organizations: config.organizations || [config.org],
    files: config.files || [],
    dataSources: config.dataSources || [],
    expiresAt: config.expiresAt || null,
    grantedBy: config.grantedBy || 'system',
    purpose: config.purpose || 'Data access'
  };
  
  console.log(`✅ Generated share token: ${tokenId}`, TOKEN_PERMISSIONS[tokenId]);
  return tokenId;
}

/**
 * Validate URL parameters against user permissions
 * @param {Object} urlParams - Parsed URL parameters
 * @param {Object} permissions - User or token permissions
 * @returns {Object} Validation result with allowed parameters
 */
export function validateUrlPermissions(urlParams, permissions) {
  const result = {
    isValid: true,
    errors: [],
    allowedParams: { ...urlParams }
  };
  
  if (!permissions) {
    result.isValid = false;
    result.errors.push('No permissions provided');
    return result;
  }
  
  // Validate organization
  if (urlParams.org && !canAccessOrganization(permissions, urlParams.org)) {
    result.isValid = false;
    result.errors.push(`Access denied to organization: ${urlParams.org}`);
    result.allowedParams.org = null;
  }
  
  // Validate file
  if (urlParams.fileType) {
    const fileId = `${urlParams.org}/${urlParams.fileType}`;
    if (!canAccessFile(permissions, fileId)) {
      result.isValid = false;
      result.errors.push(`Access denied to file: ${fileId}`);
      result.allowedParams.fileType = null;
    }
  }
  
  // Validate data sources
  if (urlParams.dataSources && urlParams.dataSources.length > 0) {
    const allowedSources = urlParams.dataSources.filter(ds => 
      canAccessDataSource(permissions, ds)
    );
    
    if (allowedSources.length < urlParams.dataSources.length) {
      const denied = urlParams.dataSources.filter(ds => !allowedSources.includes(ds));
      result.errors.push(`Access denied to data sources: ${denied.join(', ')}`);
    }
    
    result.allowedParams.dataSources = allowedSources;
  }
  
  return result;
}

/**
 * Get current user/token from URL or session
 * @returns {Object} Current permissions
 */
export function getCurrentPermissions() {
  // Check for share token in URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  
  if (token) {
    const tokenPerms = getTokenPermissions(token);
    if (tokenPerms) {
      console.log('🔑 Using token permissions:', token);
      return { ...tokenPerms, source: 'token', token };
    }
  }
  
  // Check for logged-in user (in production, check session/JWT)
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const userPerms = getUserPermissions(currentUser);
    if (userPerms) {
      console.log('👤 Using user permissions:', currentUser);
      return { ...userPerms, source: 'user', userId: currentUser };
    }
  }
  
  // Default: guest with no access (or you could provide minimal access)
  console.log('🔒 No permissions found, using guest mode');
  return {
    role: ROLES.GUEST,
    organizations: [],
    files: [],
    canShare: false,
    canManagePermissions: false,
    source: 'guest'
  };
}

/**
 * Check if current user is admin
 * @param {Object} permissions - User permissions
 * @returns {boolean}
 */
export function isAdmin(permissions) {
  return permissions && permissions.role === ROLES.ADMIN;
}

/**
 * Set current user (for demo/testing purposes)
 * @param {string} userId - User email or ID
 */
export function setCurrentUser(userId) {
  if (userId) {
    localStorage.setItem('currentUser', userId);
    console.log('✅ Current user set:', userId);
  } else {
    localStorage.removeItem('currentUser');
    console.log('✅ User logged out');
  }
  window.location.reload(); // Reload to apply new permissions
}

