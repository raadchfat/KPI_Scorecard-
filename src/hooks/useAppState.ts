import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { AppState, AppAction, UploadedFiles, TechnicianKPIs } from '../types';
import { getCurrentWeek } from '../utils/dateHelpers';

// Initial state
const initialState: AppState = {
  uploadedFiles: {
    opportunities: null,
    lineItems: null,
    jobTimes: null,
    appointments: null
  },
  selectedWeek: getCurrentWeek(),
  technicians: [],
  isProcessing: false,
  error: null,
  isDataLoaded: false
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FILES':
      return {
        ...state,
        uploadedFiles: action.payload,
        isDataLoaded: false,
        technicians: [],
        error: null
      };
    
    case 'SET_WEEK':
      return {
        ...state,
        selectedWeek: action.payload,
        isDataLoaded: false,
        technicians: [],
        error: null
      };
    
    case 'SET_TECHNICIANS':
      return {
        ...state,
        technicians: action.payload,
        isDataLoaded: true,
        error: null
      };
    
    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isProcessing: false
      };
    
    case 'SET_DATA_LOADED':
      return {
        ...state,
        isDataLoaded: action.payload
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the app context
export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}

// Helper functions for common actions
export function useAppActions() {
  const { dispatch } = useAppState();

  const setFiles = (files: UploadedFiles) => {
    dispatch({ type: 'SET_FILES', payload: files });
  };

  const setWeek = (week: { start: Date; end: Date }) => {
    dispatch({ type: 'SET_WEEK', payload: week });
  };

  const setTechnicians = (technicians: TechnicianKPIs[]) => {
    dispatch({ type: 'SET_TECHNICIANS', payload: technicians });
  };

  const setProcessing = (isProcessing: boolean) => {
    dispatch({ type: 'SET_PROCESSING', payload: isProcessing });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const setDataLoaded = (isDataLoaded: boolean) => {
    dispatch({ type: 'SET_DATA_LOADED', payload: isDataLoaded });
  };

  const resetState = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  return {
    setFiles,
    setWeek,
    setTechnicians,
    setProcessing,
    setError,
    setDataLoaded,
    resetState
  };
} 