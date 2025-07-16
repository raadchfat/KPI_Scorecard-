import type {
  ProcessedOpportunity,
  ProcessedLineItem,
  ProcessedJobTime,
  ProcessedAppointment,
  UploadedFiles
} from '../types';
import {
  parseOpportunitiesFile,
  parseLineItemsFile,
  parseJobTimesFile,
  parseAppointmentsFile,
  validateFileStructure,
  FILE_VALIDATION_REQUIREMENTS
} from './fileParser';
import { isValidExcelFile, isValidFileSize } from '../utils/formatters';

/**
 * Integrated data structure containing all processed data
 */
export interface IntegratedData {
  opportunities: ProcessedOpportunity[];
  lineItems: ProcessedLineItem[];
  jobTimes: ProcessedJobTime[];
  appointments: ProcessedAppointment[];
  technicianNames: string[];
  jobIds: string[];
}

/**
 * Validation result for file uploads
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate all uploaded files
 */
export async function validateUploadedFiles(files: UploadedFiles): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if all required files are present
  if (!files.opportunities) {
    errors.push('Opportunities Report is required');
  }
  if (!files.lineItems) {
    errors.push('Line Items Sold Report is required');
  }
  if (!files.jobTimes) {
    errors.push('Job Times Report is required');
  }
  if (!files.appointments) {
    errors.push('Appointments Report is required');
  }

  // Validate each file individually
  if (files.opportunities) {
    const result = await validateFile(files.opportunities, 'opportunities');
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  if (files.lineItems) {
    const result = await validateFile(files.lineItems, 'lineItems');
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  if (files.jobTimes) {
    const result = await validateFile(files.jobTimes, 'jobTimes');
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  if (files.appointments) {
    const result = await validateFile(files.appointments, 'appointments');
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate individual file
 */
async function validateFile(file: File, fileType: keyof typeof FILE_VALIDATION_REQUIREMENTS): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file type
  if (!isValidExcelFile(file)) {
    errors.push(`${fileType} file must be an Excel file (.xlsx or .xls)`);
    return { isValid: false, errors, warnings };
  }

  // Check file size
  if (!isValidFileSize(file)) {
    errors.push(`${fileType} file size must be under 10MB`);
    return { isValid: false, errors, warnings };
  }

  // Validate file structure
  try {
    const requirements = FILE_VALIDATION_REQUIREMENTS[fileType];
    await validateFileStructure(file, requirements.sheetName, requirements.requiredColumns);
  } catch (error) {
    errors.push(`${fileType} file validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Process and integrate all uploaded files
 */
export async function processAndIntegrateFiles(files: UploadedFiles): Promise<IntegratedData> {
  // Parse all files
  const [opportunities, lineItems, jobTimes, appointments] = await Promise.all([
    files.opportunities ? parseOpportunitiesFile(files.opportunities) : Promise.resolve([]),
    files.lineItems ? parseLineItemsFile(files.lineItems) : Promise.resolve([]),
    files.jobTimes ? parseJobTimesFile(files.jobTimes) : Promise.resolve([]),
    files.appointments ? parseAppointmentsFile(files.appointments) : Promise.resolve([])
  ]);

  // Clean and validate data
  const cleanedOpportunities = cleanOpportunitiesData(opportunities);
  const cleanedLineItems = cleanLineItemsData(lineItems);
  const cleanedJobTimes = cleanJobTimesData(jobTimes);
  const cleanedAppointments = cleanAppointmentsData(appointments);

  // Extract unique technician names and job IDs
  const technicianNames = extractTechnicianNames(
    cleanedOpportunities,
    cleanedLineItems,
    cleanedJobTimes,
    cleanedAppointments
  );

  const jobIds = extractJobIds(
    cleanedOpportunities,
    cleanedLineItems,
    cleanedJobTimes,
    cleanedAppointments
  );

  return {
    opportunities: cleanedOpportunities,
    lineItems: cleanedLineItems,
    jobTimes: cleanedJobTimes,
    appointments: cleanedAppointments,
    technicianNames,
    jobIds
  };
}

/**
 * Clean opportunities data
 */
function cleanOpportunitiesData(opportunities: ProcessedOpportunity[]): ProcessedOpportunity[] {
  return opportunities.filter(opp => {
    // Remove records with missing critical data
    if (!opp.jobId || !opp.technician || !opp.date) {
      return false;
    }
    
    // Validate revenue is positive
    if (opp.revenue < 0) {
      return false;
    }
    
    return true;
  });
}

/**
 * Clean line items data
 */
function cleanLineItemsData(lineItems: ProcessedLineItem[]): ProcessedLineItem[] {
  return lineItems.filter(item => {
    // Remove records with missing critical data
    if (!item.jobId || !item.technician || !item.invoiceDate) {
      return false;
    }
    
    // Validate price is positive
    if (item.price < 0) {
      return false;
    }
    
    // Validate quantity is positive
    if (item.quantity <= 0) {
      return false;
    }
    
    return true;
  });
}

/**
 * Clean job times data
 */
function cleanJobTimesData(jobTimes: ProcessedJobTime[]): ProcessedJobTime[] {
  return jobTimes.filter(job => {
    // Remove records with missing critical data
    if (!job.jobId || !job.technician || !job.firstAppointment) {
      return false;
    }
    
    // Validate efficiency is within reasonable range
    if (job.jobEfficiency < 0 || job.jobEfficiency > 100) {
      return false;
    }
    
    return true;
  });
}

/**
 * Clean appointments data
 */
function cleanAppointmentsData(appointments: ProcessedAppointment[]): ProcessedAppointment[] {
  return appointments.filter(appt => {
    // Remove records with missing critical data
    if (!appt.jobId || !appt.technician || !appt.scheduledFor) {
      return false;
    }
    
    // Validate revenue is positive
    if (appt.revenue < 0) {
      return false;
    }
    
    return true;
  });
}

/**
 * Extract unique technician names from all data sources
 */
function extractTechnicianNames(
  opportunities: ProcessedOpportunity[],
  lineItems: ProcessedLineItem[],
  jobTimes: ProcessedJobTime[],
  appointments: ProcessedAppointment[]
): string[] {
  const names = new Set<string>();
  
  opportunities.forEach(opp => names.add(opp.technician));
  lineItems.forEach(item => names.add(item.technician));
  jobTimes.forEach(job => names.add(job.technician));
  appointments.forEach(appt => names.add(appt.technician));
  
  return Array.from(names).sort();
}

/**
 * Extract unique job IDs from all data sources
 */
function extractJobIds(
  opportunities: ProcessedOpportunity[],
  lineItems: ProcessedLineItem[],
  jobTimes: ProcessedJobTime[],
  appointments: ProcessedAppointment[]
): string[] {
  const ids = new Set<string>();
  
  opportunities.forEach(opp => ids.add(opp.jobId));
  lineItems.forEach(item => ids.add(item.jobId));
  jobTimes.forEach(job => ids.add(job.jobId));
  appointments.forEach(appt => ids.add(appt.jobId));
  
  return Array.from(ids).sort();
}

/**
 * Get data summary statistics
 */
export function getDataSummary(data: IntegratedData): {
  totalOpportunities: number;
  totalLineItems: number;
  totalJobTimes: number;
  totalAppointments: number;
  uniqueTechnicians: number;
  uniqueJobs: number;
  dateRange: { start: Date | null; end: Date | null };
} {
  const allDates: Date[] = [
    ...data.opportunities.map(opp => opp.date),
    ...data.lineItems.map(item => item.invoiceDate),
    ...data.jobTimes.map(job => job.firstAppointment),
    ...data.appointments.map(appt => appt.scheduledFor)
  ].filter(date => date instanceof Date && !isNaN(date.getTime()));

  const dateRange = allDates.length > 0 ? {
    start: new Date(Math.min(...allDates.map(d => d.getTime()))),
    end: new Date(Math.max(...allDates.map(d => d.getTime())))
  } : { start: null, end: null };

  return {
    totalOpportunities: data.opportunities.length,
    totalLineItems: data.lineItems.length,
    totalJobTimes: data.jobTimes.length,
    totalAppointments: data.appointments.length,
    uniqueTechnicians: data.technicianNames.length,
    uniqueJobs: data.jobIds.length,
    dateRange
  };
} 