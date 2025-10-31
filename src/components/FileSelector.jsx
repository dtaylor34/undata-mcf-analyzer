import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { FileText, GitCompare } from 'lucide-react';
import { getUniqueFileTypes, getVersionsForFileType } from '../mcf-file-index';

export function FileSelector({
  onFileSelected,
  onCompareFileSelected,
  showDiff,
  onToggleDiff,
}) {
  const [selectedFileType, setSelectedFileType] = useState('schema.mcf');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [compareVersion, setCompareVersion] = useState('');
  
  const fileTypes = getUniqueFileTypes();
  const versions = selectedFileType ? getVersionsForFileType(selectedFileType) : [];
  
  // Initialize with first version when file type changes
  useEffect(() => {
    if (versions.length > 0 && !selectedVersion) {
      setSelectedVersion(versions[0].fileId);
      onFileSelected(versions[0].fileId);
    }
  }, [versions, selectedVersion, onFileSelected]);
  
  // Handle file type change
  const handleFileTypeChange = (fileType) => {
    setSelectedFileType(fileType);
    const newVersions = getVersionsForFileType(fileType);
    if (newVersions.length > 0) {
      setSelectedVersion(newVersions[0].fileId);
      onFileSelected(newVersions[0].fileId);
      setCompareVersion('');
      onCompareFileSelected('');
    }
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
  
  // Get display name for selected version
  const selectedVersionDisplay = versions.find(v => v.fileId === selectedVersion)?.displayName || '';

  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">File Type:</span>
          </div>

          {/* File Type Selector */}
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

          {/* Version Selector */}
          {versions.length > 0 && (
            <>
              <span className="text-sm text-muted-foreground">Version:</span>
              <Select value={selectedVersion} onValueChange={handleVersionChange}>
                <SelectTrigger className="w-[200px] bg-input border-border text-foreground hover:bg-input/80">
                  <SelectValue placeholder="Select version">
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
                  <SelectTrigger className="w-[200px] bg-input border-border text-foreground hover:bg-input/80">
                    <SelectValue placeholder="Select version to compare" />
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
