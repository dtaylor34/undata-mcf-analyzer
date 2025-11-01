/**
 * FILE: scripts/git-automation.js
 * PURPOSE: Git automation for creating draft branches and managing reviews
 * 
 * Handles:
 * - Creating draft branches for new submissions
 * - Committing changes
 * - Tracking approval status
 * - Merging approved changes
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

/**
 * Create a draft branch for review
 */
async function createDraftBranch(orgId, fileName, mcfContent) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const branchName = `draft/${orgId}/${fileName.replace('.mcf', '')}/${timestamp}`;
  
  console.log(`🌿 Creating draft branch: ${branchName}`);
  
  try {
    // Create and checkout new branch
    execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
    
    // Write MCF file
    const mcfPath = path.join(__dirname, '../mcf', orgId, fileName);
    await fs.mkdir(path.dirname(mcfPath), { recursive: true });
    await fs.writeFile(mcfPath, mcfContent);
    
    // Stage and commit
    execSync(`git add ${mcfPath}`, { stdio: 'inherit' });
    execSync(`git commit -m "Draft: ${orgId} - ${fileName}\n\nAutomatically generated from uploaded data.\nPending review and approval."`, { stdio: 'inherit' });
    
    console.log(`✅ Draft branch created: ${branchName}`);
    
    // Return to main branch
    execSync(`git checkout main`, { stdio: 'inherit' });
    
    return branchName;
  } catch (error) {
    console.error(`❌ Error creating draft branch:`, error.message);
    
    // Try to return to main branch
    try {
      execSync(`git checkout main`, { stdio: 'pipe' });
    } catch (e) {}
    
    throw error;
  }
}

/**
 * Approve and merge a draft branch
 */
async function approveDraft(branchName, reviewer) {
  console.log(`✅ Approving draft: ${branchName}`);
  console.log(`👤 Reviewer: ${reviewer}`);
  
  try {
    // Checkout draft branch
    execSync(`git checkout ${branchName}`, { stdio: 'inherit' });
    
    // Add approval metadata
    const approvalFile = path.join(__dirname, '../approvals', `${branchName.replace(/\//g, '_')}.json`);
    await fs.mkdir(path.dirname(approvalFile), { recursive: true });
    await fs.writeFile(approvalFile, JSON.stringify({
      branch: branchName,
      reviewer,
      approvedAt: new Date().toISOString(),
      status: 'approved'
    }, null, 2));
    
    execSync(`git add ${approvalFile}`, { stdio: 'inherit' });
    execSync(`git commit -m "Approved by ${reviewer}"`, { stdio: 'inherit' });
    
    // Merge to main
    execSync(`git checkout main`, { stdio: 'inherit' });
    execSync(`git merge ${branchName} --no-ff -m "Merge approved draft: ${branchName}"`, { stdio: 'inherit' });
    
    // Delete draft branch
    execSync(`git branch -d ${branchName}`, { stdio: 'inherit' });
    
    console.log(`✅ Draft approved and merged to main`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error approving draft:`, error.message);
    
    // Try to return to main branch
    try {
      execSync(`git checkout main`, { stdio: 'pipe' });
    } catch (e) {}
    
    throw error;
  }
}

/**
 * Reject a draft branch
 */
async function rejectDraft(branchName, reviewer, reason) {
  console.log(`❌ Rejecting draft: ${branchName}`);
  console.log(`👤 Reviewer: ${reviewer}`);
  console.log(`📝 Reason: ${reason}`);
  
  try {
    // Add rejection metadata
    const rejectionFile = path.join(__dirname, '../rejections', `${branchName.replace(/\//g, '_')}.json`);
    await fs.mkdir(path.dirname(rejectionFile), { recursive: true });
    await fs.writeFile(rejectionFile, JSON.stringify({
      branch: branchName,
      reviewer,
      rejectedAt: new Date().toISOString(),
      reason,
      status: 'rejected'
    }, null, 2));
    
    // Delete draft branch
    execSync(`git branch -D ${branchName}`, { stdio: 'inherit' });
    
    console.log(`✅ Draft rejected and deleted`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error rejecting draft:`, error.message);
    throw error;
  }
}

/**
 * List all draft branches
 */
function listDraftBranches() {
  try {
    const output = execSync('git branch', { encoding: 'utf-8' });
    const branches = output.split('\n')
      .map(b => b.trim().replace('* ', ''))
      .filter(b => b.startsWith('draft/'));
    
    return branches;
  } catch (error) {
    console.error(`❌ Error listing branches:`, error.message);
    return [];
  }
}

/**
 * Get diff for a draft branch
 */
function getDraftDiff(branchName) {
  try {
    const diff = execSync(`git diff main...${branchName}`, { encoding: 'utf-8' });
    return diff;
  } catch (error) {
    console.error(`❌ Error getting diff:`, error.message);
    return '';
  }
}

module.exports = {
  createDraftBranch,
  approveDraft,
  rejectDraft,
  listDraftBranches,
  getDraftDiff
};

