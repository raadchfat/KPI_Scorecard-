// Excel file data types
export interface OpportunityData {
  Date: string;
  Job: string;
  Customer: string;
  Email: string;
  Phone: string;
  Status: 'Won' | 'Lost' | 'Pending';
  'Opportunity Owner': string;
  'Membership Opportunity': 'Yes' | 'No';
  'Membership Sold': 'Yes' | 'No';
  Revenue: number;
}

export interface LineItemData {
  'Invoice Date': string;
  Customer: string;
  Job: string;
  'Opp. Owner': string;
  Category: string;
  'Line Item': string;
  Quantity: number;
  Price: number;
}

export interface JobTimeData {
  'First Appointment': string;
  Job: string;
  'Job Status': 'Pending' | 'Completed';
  Customer: string;
  'Opportunity Owner': string;
  Opportunity: 'Won' | 'Lost' | 'Invalid';
  Total: string;
  'Total Time': string;
  'Sold Time': string;
  'Job Efficiency': string;
}

export interface AppointmentData {
  Appointment: string;
  'Scheduled For': string;
  Job: string;
  Customer: string;
  'Appt Status': 'Cancelled' | 'Completed' | 'Pending';
  Technician: string;
  'Service Category': string;
  Revenue: number;
}

// Processed data types
export interface ProcessedOpportunity {
  date: Date;
  jobId: string;
  customer: string;
  email: string;
  phone: string;
  status: 'Won' | 'Lost' | 'Pending';
  technician: string;
  membershipOpportunity: boolean;
  membershipSold: boolean;
  revenue: number;
}

export interface ProcessedLineItem {
  invoiceDate: Date;
  customer: string;
  jobId: string;
  technician: string;
  category: string;
  lineItem: string;
  quantity: number;
  price: number;
}

export interface ProcessedJobTime {
  firstAppointment: Date;
  jobId: string;
  jobStatus: 'Pending' | 'Completed';
  customer: string;
  technician: string;
  opportunity: 'Won' | 'Lost' | 'Invalid';
  total: number;
  totalTime: number; // in minutes
  soldTime: number; // in minutes
  jobEfficiency: number; // percentage
}

export interface ProcessedAppointment {
  appointmentId: string;
  scheduledFor: Date;
  jobId: string;
  customer: string;
  apptStatus: 'Cancelled' | 'Completed' | 'Pending';
  technician: string;
  serviceCategory: string;
  revenue: number;
}

// KPI calculation types
export interface TechnicianKPIs {
  technician: string;
  averageTicketValue: number;
  jobCloseRate: number;
  weeklyRevenue: number;
  jobEfficiency: number;
  membershipWinRate: number;
  hydroJettingJobsSold: number;
  descalingJobsSold: number;
  waterHeaterJobsSold: number;
}

export interface KPIMetric {
  name: string;
  value: number;
  unit: string;
  color: 'success' | 'warning' | 'danger' | 'neutral';
  description: string;
}

// File upload types
export interface UploadedFiles {
  opportunities: File | null;
  lineItems: File | null;
  jobTimes: File | null;
  appointments: File | null;
}

export interface FileUploadState {
  files: UploadedFiles;
  isProcessing: boolean;
  error: string | null;
  progress: number;
}

// App state types
export interface AppState {
  uploadedFiles: UploadedFiles;
  selectedWeek: {
    start: Date;
    end: Date;
  };
  technicians: TechnicianKPIs[];
  isProcessing: boolean;
  error: string | null;
  isDataLoaded: boolean;
}

export type AppAction =
  | { type: 'SET_FILES'; payload: UploadedFiles }
  | { type: 'SET_WEEK'; payload: { start: Date; end: Date } }
  | { type: 'SET_TECHNICIANS'; payload: TechnicianKPIs[] }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATA_LOADED'; payload: boolean }
  | { type: 'RESET_STATE' };

// Week selection types
export interface WeekRange {
  start: Date;
  end: Date;
  label: string;
}

// Error types
export interface ProcessingError {
  type: 'FILE_ERROR' | 'DATA_ERROR' | 'CALCULATION_ERROR';
  message: string;
  details?: string;
} 