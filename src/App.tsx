import { useEffect, useState } from 'react';
import { BarChart3, AlertCircle, Loader2 } from 'lucide-react';
import { AppProvider, useAppState, useAppActions } from './hooks/useAppState';
import { FileUploader } from './components/FileUploader';
import { WeekSelector } from './components/WeekSelector';
import { TechnicianCard } from './components/TechnicianCard';
import { processAndIntegrateFiles, getDataSummary } from './services/dataIntegrator';
import { calculateAllTechnicianKPIs } from './services/kpiCalculator';
import type { UploadedFiles } from './types';

function AppContent() {
  const { state } = useAppState();
  const { setFiles, setWeek, setTechnicians, setProcessing, setError, setDataLoaded } = useAppActions();
  
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [dataSummary, setDataSummary] = useState<any>(null);

  // Handle file changes
  const handleFilesChange = (files: UploadedFiles) => {
    setFiles(files);
    setValidationErrors([]);
  };

  // Handle validation completion
  const handleValidationComplete = (isValid: boolean, errors: string[]) => {
    setValidationErrors(errors);
    if (!isValid) {
      setError(errors.join(', '));
    } else {
      setError(null);
    }
  };

  // Handle week changes
  const handleWeekChange = (week: { start: Date; end: Date }) => {
    setWeek(week);
  };

  // Process files and calculate KPIs
  useEffect(() => {
    const processFiles = async () => {
      if (!state.uploadedFiles.opportunities || 
          !state.uploadedFiles.lineItems || 
          !state.uploadedFiles.jobTimes || 
          !state.uploadedFiles.appointments) {
        return;
      }

      setProcessing(true);
      setError(null);

      try {
        // Process and integrate files
        const integratedData = await processAndIntegrateFiles(state.uploadedFiles);
        const summary = getDataSummary(integratedData);
        setDataSummary(summary);

        // Calculate KPIs for all technicians
        const technicianKPIs = calculateAllTechnicianKPIs(
          integratedData.opportunities,
          integratedData.lineItems,
          integratedData.jobTimes,
          integratedData.appointments,
          state.selectedWeek.start,
          state.selectedWeek.end
        );

        setTechnicians(technicianKPIs);
        setDataLoaded(true);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to process files');
        setDataLoaded(false);
      } finally {
        setProcessing(false);
      }
    };

    processFiles();
  }, [state.uploadedFiles, state.selectedWeek, setProcessing, setError, setTechnicians, setDataLoaded]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Omaha Drain</h1>
                <p className="text-sm text-gray-500">Service Technicians KPI Dashboard</p>
              </div>
            </div>
            
            {dataSummary && (
              <div className="text-sm text-gray-500">
                {dataSummary.uniqueTechnicians} technicians • {dataSummary.uniqueJobs} jobs
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* File Upload Section */}
        {!state.isDataLoaded && (
          <div className="mb-8">
            <FileUploader
              onFilesChange={handleFilesChange}
              onValidationComplete={handleValidationComplete}
            />
            
            {validationErrors.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h3 className="text-sm font-medium text-red-800">Validation Errors</h3>
                </div>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Week Selector */}
        {state.isDataLoaded && (
          <div className="mb-8">
            <WeekSelector
              selectedWeek={state.selectedWeek}
              onWeekChange={handleWeekChange}
              dataAvailable={dataSummary?.dateRange}
            />
          </div>
        )}

        {/* Processing State */}
        {state.isProcessing && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              <span className="text-lg text-gray-700">Processing files and calculating KPIs...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {state.error && !state.isProcessing && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <span className="text-lg">{state.error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="mt-4 btn-secondary"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Results Section */}
        {state.isDataLoaded && !state.isProcessing && state.technicians.length > 0 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Technician Performance
              </h2>
              <p className="text-gray-600">
                Showing KPIs for {state.technicians.length} technicians
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {state.technicians.map((technician) => (
                <TechnicianCard
                  key={technician.technician}
                  technician={technician}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {state.isDataLoaded && !state.isProcessing && state.technicians.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500">
              No technician data found for the selected week. Try selecting a different week or check your uploaded files.
            </p>
          </div>
        )}

        {/* Upload Files CTA */}
        {!state.isDataLoaded && !state.isProcessing && (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Get Started</h3>
            <p className="text-gray-500">
              Upload the four required Excel files to begin analyzing technician performance.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
