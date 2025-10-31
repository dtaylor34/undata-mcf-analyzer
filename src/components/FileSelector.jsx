import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { FileText, GitCompare } from 'lucide-react';
import { getAllFiles, getComparableVersions } from '../mcf-file-index';
import { useMemo } from 'react';

export function FileSelector({
  selectedFile,
  selectedVersion,
  compareVersion,
  onFileChange,
  onVersionChange,
  onCompareVersionChange,
  showDiff,
  onToggleDiff,
}) {
  // Get all available MCF files
  const allFiles = useMemo(() => getAllFiles(), []);
  
  // Get comparable versions for the selected file
  const comparableVersions = useMemo(() => {
    if (selectedFile) {
      return getComparableVersions(selectedFile);
    }
    return [];
  }, [selectedFile]);
  
  // Check if diff is possible (has comparable versions)
  const canShowDiff = comparableVersions.length > 1;

  return (
    <div className="bg-muted border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Source MCF:</span>
          </div>

          {/* File Selector */}
          <Select value={selectedFile} onValueChange={onFileChange}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select MCF file" />
            </SelectTrigger>
            <SelectContent className="max-h-[400px]">
              {allFiles.map((file) => (
                <SelectItem key={file.id} value={file.id}>
                  {file.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Version Selector (only for files with versions) */}
          {comparableVersions.length > 0 && (
            <Select value={selectedVersion} onValueChange={onVersionChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Version" />
              </SelectTrigger>
              <SelectContent>
                {comparableVersions.map((ver) => (
                  <SelectItem key={ver.id} value={ver.id}>
                    {ver.versionName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Diff Toggle (only show if versions available) */}
          {canShowDiff && (
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant={showDiff ? 'default' : 'outline'}
                size="sm"
                onClick={onToggleDiff}
                className="gap-2"
              >
                <GitCompare className="h-4 w-4" />
                {showDiff ? 'Hide Diff' : 'Show Diff'}
              </Button>

              {showDiff && (
                <Select value={compareVersion} onValueChange={onCompareVersionChange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Compare to" />
                  </SelectTrigger>
                  <SelectContent>
                    {comparableVersions
                      .filter((ver) => ver.id !== selectedVersion)
                      .map((ver) => (
                        <SelectItem key={ver.id} value={ver.id}>
                          {ver.versionName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
