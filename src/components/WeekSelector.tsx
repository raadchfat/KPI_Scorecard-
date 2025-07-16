import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { 
  getCurrentWeek, 
  getPreviousWeek, 
  getNextWeek, 
  formatDateRange, 
  getWeekLabel 
} from '../utils/dateHelpers';

interface WeekSelectorProps {
  selectedWeek: { start: Date; end: Date };
  onWeekChange: (week: { start: Date; end: Date }) => void;
  dataAvailable?: { start: Date | null; end: Date | null };
}

export function WeekSelector({ 
  selectedWeek, 
  onWeekChange, 
  dataAvailable 
}: WeekSelectorProps) {
  const handlePreviousWeek = () => {
    const prevWeek = getPreviousWeek(selectedWeek.start);
    onWeekChange(prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = getNextWeek(selectedWeek.start);
    onWeekChange(nextWeek);
  };

  const handleCurrentWeek = () => {
    const currentWeek = getCurrentWeek();
    onWeekChange(currentWeek);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    onWeekChange({ start: startOfWeek, end: endOfWeek });
  };

  const isDataAvailable = dataAvailable?.start && dataAvailable?.end;
  const isWeekInDataRange = isDataAvailable && 
    selectedWeek.start >= dataAvailable.start! && 
    selectedWeek.end <= dataAvailable.end!;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Week Selection</h3>
          </div>
          
          {isDataAvailable && (
            <div className="text-sm text-gray-500">
              Data available: {formatDateRange(dataAvailable.start!, dataAvailable.end!)}
            </div>
          )}
        </div>

        <button
          onClick={handleCurrentWeek}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Current Week
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={handlePreviousWeek}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Previous week"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {getWeekLabel(selectedWeek.start, selectedWeek.end)}
            </div>
            <div className="text-sm text-gray-500">
              {formatDateRange(selectedWeek.start, selectedWeek.end)}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="week-picker" className="text-sm font-medium text-gray-700">
              Jump to:
            </label>
            <input
              id="week-picker"
              type="date"
              value={selectedWeek.start.toISOString().split('T')[0]}
              onChange={handleDateChange}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={handleNextWeek}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Next week"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {isDataAvailable && !isWeekInDataRange && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-sm text-yellow-800">
              Selected week is outside available data range. No data will be shown.
            </span>
          </div>
        </div>
      )}

      {!isDataAvailable && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-sm text-gray-600">
              Upload files to see data availability
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 