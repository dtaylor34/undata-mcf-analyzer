import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { FileText, GitCompare } from 'lucide-react';

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
  // Mock MCF files - replace with your actual data
  const mcfFiles = [
    'unemployment_rate.mcf',
    'population_census.mcf',
    'gdp_annual.mcf',
    'climate_temperature.mcf',
  ];

  // Mock versions - replace with your actual data
  const versions = ['v1.0.0', 'v1.1.0', 'v1.2.0', 'v2.0.0'];

  return (
    <div className="bg-[#34495e] border-b border-[#2c3e50]">
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#95a5a6]" />
            <span className="text-sm text-[#95a5a6]">Source MCF:</span>
          </div>

          <Select value={selectedFile} onValueChange={onFileChange}>
            <SelectTrigger className="w-[220px] bg-[#2c3e50] border-[#1a252f] text-white hover:bg-[#273747]">
              <SelectValue placeholder="Select MCF file" />
            </SelectTrigger>
            <SelectContent className="bg-[#2c3e50] border-[#1a252f]">
              {mcfFiles.map((file) => (
                <SelectItem key={file} value={file} className="text-white hover:bg-[#34495e] focus:bg-[#34495e]">
                  {file}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedVersion} onValueChange={onVersionChange}>
            <SelectTrigger className="w-[140px] bg-[#2c3e50] border-[#1a252f] text-white hover:bg-[#273747]">
              <SelectValue placeholder="Version" />
            </SelectTrigger>
            <SelectContent className="bg-[#2c3e50] border-[#1a252f]">
              {versions.map((version) => (
                <SelectItem key={version} value={version} className="text-white hover:bg-[#34495e] focus:bg-[#34495e]">
                  {version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 ml-4">
            <Button
              variant={showDiff ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleDiff}
              className={`gap-2 transition-all ${
                showDiff
                  ? 'bg-[#8e44ad] hover:bg-[#9b59b6] text-white border-[#8e44ad]'
                  : 'bg-transparent border-[#8e44ad] text-[#8e44ad] hover:bg-[#8e44ad]/10 hover:text-[#8e44ad]'
              }`}
            >
              <GitCompare className="h-4 w-4" />
              {showDiff ? 'Hide Diff' : 'Show Diff'}
            </Button>

            {showDiff && (
              <Select value={compareVersion} onValueChange={onCompareVersionChange}>
                <SelectTrigger className="w-[140px] bg-[#2c3e50] border-[#1a252f] text-white hover:bg-[#273747]">
                  <SelectValue placeholder="Compare to" />
                </SelectTrigger>
                <SelectContent className="bg-[#2c3e50] border-[#1a252f]">
                  {versions
                    .filter((v) => v !== selectedVersion)
                    .map((version) => (
                      <SelectItem key={version} value={version} className="text-white hover:bg-[#34495e] focus:bg-[#34495e]">
                        {version}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
