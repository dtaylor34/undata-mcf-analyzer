/**
 * FILE: scripts/file-watcher.js
 * PURPOSE: Automated file watcher for detecting new data submissions
 * 
 * This script monitors the inbox/ directory for new CSV, SDMX, or MCF files
 * and automatically triggers the processing pipeline.
 */

const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs').promises;
const { processIncomingFile } = require('./data-processor');
const { validateGovernance } = require('./governance-validator');
const { createDraftBranch } = require('./git-automation');

// Configuration
const INBOX_PATH = path.join(__dirname, '../inbox');
const PROCESSING_PATH = path.join(__dirname, '../processing');
const MCF_OUTPUT_PATH = path.join(__dirname, '../mcf');

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(INBOX_PATH, { recursive: true });
  await fs.mkdir(PROCESSING_PATH, { recursive: true });
  await fs.mkdir(MCF_OUTPUT_PATH, { recursive: true });
}

// Process new file
async function handleNewFile(filePath) {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(filePath).toLowerCase();
  
  console.log(`\n🔔 New file detected: ${fileName}`);
  console.log(`📁 Path: ${filePath}`);
  console.log(`📝 Type: ${fileExt}`);
  
  try {
    // Move to processing
    const processingPath = path.join(PROCESSING_PATH, fileName);
    await fs.rename(filePath, processingPath);
    console.log(`✅ Moved to processing: ${processingPath}`);
    
    // Determine organization from filename or folder structure
    const orgId = extractOrganization(fileName);
    console.log(`🏢 Detected organization: ${orgId}`);
    
    // Process file (CSV → MCF, SDMX → MCF, or validate existing MCF)
    const mcfContent = await processIncomingFile(processingPath, orgId);
    console.log(`✅ Generated MCF content (${mcfContent.length} chars)`);
    
    // Validate governance (theme/SDG alignment)
    const governanceResult = await validateGovernance(mcfContent, orgId);
    console.log(`📊 Governance validation:`, governanceResult);
    
    if (!governanceResult.isValid) {
      console.warn(`⚠️ Governance issues found:`, governanceResult.errors);
      // Move to review queue with warnings
    }
    
    // Save MCF to output
    const mcfFileName = fileName.replace(fileExt, '.mcf');
    const mcfOutputPath = path.join(MCF_OUTPUT_PATH, orgId, mcfFileName);
    await fs.mkdir(path.dirname(mcfOutputPath), { recursive: true });
    await fs.writeFile(mcfOutputPath, mcfContent);
    console.log(`✅ Saved MCF: ${mcfOutputPath}`);
    
    // Create draft branch for review
    const branchName = await createDraftBranch(orgId, mcfFileName, mcfContent);
    console.log(`✅ Created draft branch: ${branchName}`);
    
    // Add to review queue
    await addToReviewQueue({
      fileName,
      orgId,
      mcfPath: mcfOutputPath,
      branchName,
      governanceResult,
      timestamp: new Date().toISOString(),
      status: 'pending_review'
    });
    
    console.log(`✅ File processing complete! Ready for review.`);
    
  } catch (error) {
    console.error(`❌ Error processing file:`, error);
    
    // Move to failed directory
    const failedPath = path.join(__dirname, '../failed', fileName);
    await fs.mkdir(path.dirname(failedPath), { recursive: true });
    await fs.rename(processingPath, failedPath);
    
    // Log error for admin review
    await logError(fileName, error);
  }
}

// Extract organization from filename
function extractOrganization(fileName) {
  const lowerName = fileName.toLowerCase();
  
  if (lowerName.includes('who')) return 'who';
  if (lowerName.includes('unicef')) return 'unicef';
  if (lowerName.includes('ilo')) return 'ilo';
  if (lowerName.includes('fao')) return 'fao';
  if (lowerName.includes('sdg')) return 'sdg';
  
  // Default fallback
  return 'unknown';
}

// Add to review queue (stored in JSON for UI to read)
async function addToReviewQueue(item) {
  const queuePath = path.join(__dirname, '../review-queue.json');
  
  let queue = [];
  try {
    const existing = await fs.readFile(queuePath, 'utf-8');
    queue = JSON.parse(existing);
  } catch (error) {
    // Queue doesn't exist yet, start fresh
  }
  
  queue.push(item);
  await fs.writeFile(queuePath, JSON.stringify(queue, null, 2));
}

// Log error
async function logError(fileName, error) {
  const errorLog = {
    fileName,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  };
  
  const logPath = path.join(__dirname, '../logs/errors.json');
  await fs.mkdir(path.dirname(logPath), { recursive: true });
  
  let logs = [];
  try {
    const existing = await fs.readFile(logPath, 'utf-8');
    logs = JSON.parse(existing);
  } catch (e) {}
  
  logs.push(errorLog);
  await fs.writeFile(logPath, JSON.stringify(logs, null, 2));
}

// Start watcher
async function startWatcher() {
  await ensureDirectories();
  
  console.log('👀 Starting file watcher...');
  console.log(`📂 Monitoring: ${INBOX_PATH}`);
  console.log('📝 Supported formats: .csv, .sdmx, .xml, .mcf');
  console.log('');
  
  const watcher = chokidar.watch(INBOX_PATH, {
    ignored: /(^|[\/\\])\../, // Ignore dotfiles
    persistent: true,
    ignoreInitial: false,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  });
  
  watcher
    .on('add', handleNewFile)
    .on('error', error => console.error('❌ Watcher error:', error));
  
  console.log('✅ File watcher is running!');
  console.log('💡 Drop files into inbox/ to trigger processing\n');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down file watcher...');
  process.exit(0);
});

// Run if executed directly
if (require.main === module) {
  startWatcher().catch(error => {
    console.error('❌ Failed to start watcher:', error);
    process.exit(1);
  });
}

module.exports = { startWatcher, handleNewFile };

