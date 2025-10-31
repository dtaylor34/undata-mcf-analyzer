import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export function ChartFilter({ charts = [], selectedCharts, onSelectionChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectAll, setSelectAll] = useState(true);

  // Initialize with all charts selected
  useEffect(() => {
    if (charts.length > 0 && selectedCharts.length === 0) {
      onSelectionChange(charts.map(c => c.id || c.name));
    }
  }, [charts, selectedCharts.length, onSelectionChange]);

  const handleToggleAll = () => {
    if (selectAll) {
      // Deselect all
      onSelectionChange([]);
      setSelectAll(false);
    } else {
      // Select all
      onSelectionChange(charts.map(c => c.id || c.name));
      setSelectAll(true);
    }
  };

  const handleToggleChart = (chartId) => {
    if (selectedCharts.includes(chartId)) {
      // Remove from selection
      const newSelection = selectedCharts.filter(id => id !== chartId);
      onSelectionChange(newSelection);
      setSelectAll(false);
    } else {
      // Add to selection
      const newSelection = [...selectedCharts, chartId];
      onSelectionChange(newSelection);
      // Check if all are now selected
      if (newSelection.length === charts.length) {
        setSelectAll(true);
      }
    }
  };

  // Update selectAll when selection changes externally
  useEffect(() => {
    setSelectAll(selectedCharts.length === charts.length && charts.length > 0);
  }, [selectedCharts.length, charts.length]);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
      >
        <span className="text-sm">
          Filter Charts ({selectedCharts.length}/{charts.length})
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-20 max-h-96 overflow-auto">
            <div className="p-2">
              {/* Select All Option */}
              <label className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleToggleAll}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium">All Charts</span>
              </label>

              <div className="border-t border-border my-2" />

              {/* Individual Charts */}
              {charts.map((chart, index) => {
                const chartId = chart.id || chart.name || `chart-${index}`;
                return (
                  <label
                    key={chartId}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCharts.includes(chartId)}
                      onChange={() => handleToggleChart(chartId)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{chart.title || chart.name || `Chart ${index + 1}`}</span>
                  </label>
                );
              })}

              {charts.length === 0 && (
                <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                  No charts available
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

