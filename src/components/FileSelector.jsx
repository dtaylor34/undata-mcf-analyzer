import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { FileText, GitCompare } from 'lucide-react';
import { getOrganizations, getFileTypesForOrg, getVersionsForOrgAndFileType } from '../mcf-file-index';

export function FileSelector({
  onFileSelected,
  onCompareFileSelected,
  showDiff,
  onToggleDiff,
}) {
  const [selectedOrg, setSelectedOrg] = useState('ilo');
  const [selectedFileType, setSelectedFileType] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [compareVersion, setCompareVersion] = useState('');
  
  const organizations = getOrganizations();
  const fileTypes = selectedOrg ? getFileTypesForOrg(selectedOrg) : [];
  const versions = selectedOrg && selectedFileType ? getVersionsForOrgAndFileType(selectedOrg, selectedFileType) : [];
  
  // Initialize file type when org changes
  useEffect(() => {
    if (selectedOrg) {
      const types = getFileTypesForOrg(selectedOrg);
      if (types.length > 0) {
        setSelectedFileType(types[0]);
      }
    }
  }, [selectedOrg]);
  
  // Initialize version when file type changes
  useEffect(() => {
    if (selectedOrg && selectedFileType) {
      const vers = getVersionsForOrgAndFileType(selectedOrg, selectedFileType);
      if (vers.length > 0) {
        setSelectedVersion(vers[0].fileId);
        onFileSelected(vers[0].fileId);
      }
    }
  }, [selectedOrg, selectedFileType, onFileSelected]);
  
  // Handle org change
  const handleOrgChange = (orgId) => {
    setSelectedOrg(orgId);
    setCompareVersion('');
    onCompareFileSelected('');
  };
  
  // Handle file type change
  const handleFileTypeChange = (fileType) => {
    setSelectedFileType(fileType);
    setCompareVersion('');
    onCompareFileSelected('');
  };
  
  // Handle version change
  const handleVersionChange = (fileId) => {
    setSelectedVersion(fileId);
    onFileSelected(fileId);
  };
  
  // Handle compare version change
  const handleCompareVersionChange = (fileId) => {
    setCompareVersion(fileId);
    onCompareFileSelected(fileId);
  };
  
  // Get display names
  const selectedOrgData = organizations.find(o => o.id === selectedOrg);
  const selectedVersionDisplay = versions.find(v => v.fileId === selectedVersion)?.displayName || '';

  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Organization:</span>
          </div>

          {/* Organization Selector */}
          <Select value={selectedOrg} onValueChange={handleOrgChange}>
            <SelectTrigger className="w-[180px] bg-input border-border text-foreground hover:bg-input/80">
              <SelectValue>
                {selectedOrgData && `${selectedOrgData.emoji} ${selectedOrgData.name}`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {organizations.map((org) => (
                <SelectItem 
                  key={org.id} 
                  value={org.id} 
                  className="text-foreground hover:bg-accent focus:bg-accent"
                >
                  {org.emoji} {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* File Type Selector */}
          {fileTypes.length > 0 && (
            <>
              <span className="text-sm text-muted-foreground">File:</span>
              <Select value={selectedFileType} onValueChange={handleFileTypeChange}>
                <SelectTrigger className="w-[200px] bg-input border-border text-foreground hover:bg-input/80">
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-[400px]">
                  {fileTypes.map((fileType) => (
                    <SelectItem 
                      key={fileType} 
                      value={fileType} 
                      className="text-foreground hover:bg-accent focus:bg-accent"
                    >
                      {fileType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {/* Version Selector (only show if multiple versions) */}
          {versions.length > 1 && (
            <>
              <span className="text-sm text-muted-foreground">Version:</span>
              <Select value={selectedVersion} onValueChange={handleVersionChange}>
                <SelectTrigger className="w-[160px] bg-input border-border text-foreground hover:bg-input/80">
                  <SelectValue>
                    {selectedVersionDisplay}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {versions.map((version) => (
                    <SelectItem 
                      key={version.fileId} 
                      value={version.fileId} 
                      className="text-foreground hover:bg-accent focus:bg-accent"
                    >
                      {version.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {/* Diff Controls */}
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant={showDiff ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleDiff}
              disabled={versions.length <= 1}
              className={`gap-2 transition-all ${
                showDiff
                  ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                  : 'bg-transparent border-border text-foreground hover:bg-accent'
              }`}
            >
              <GitCompare className="h-4 w-4" />
              {showDiff ? 'Hide Diff' : 'Show Diff'}
            </Button>

            {showDiff && versions.length > 1 && (
              <>
                <span className="text-sm text-muted-foreground">vs</span>
                <Select value={compareVersion} onValueChange={handleCompareVersionChange}>
                  <SelectTrigger className="w-[160px] bg-input border-border text-foreground hover:bg-input/80">
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {versions
                      .filter(v => v.fileId !== selectedVersion)
                      .map((version) => (
                        <SelectItem 
                          key={version.fileId} 
                          value={version.fileId} 
                          className="text-foreground hover:bg-accent focus:bg-accent"
                        >
                          {version.displayName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
