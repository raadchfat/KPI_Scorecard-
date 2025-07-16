import * as XLSX from 'xlsx';
import type {
  OpportunityData,
  LineItemData,
  JobTimeData,
  AppointmentData,
  ProcessedOpportunity,
  ProcessedLineItem,
  ProcessedJobTime,
  ProcessedAppointment
} from '../types';
import { parseCurrency, parsePercentage, parseTimeToMinutes, normalizeTechnicianName } from '../utils/formatters';
import { parseDate, parseDateTime } from '../utils/dateHelpers';

/**
 * Parse Excel file and extract data from specified sheet
 */
export async function parseExcelFile<T>(file: File, sheetName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (!workbook.SheetNames.includes(sheetName)) {
          throw new Error(`Sheet "${sheetName}" not found in file`);
        }
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<T>(worksheet, { header: 1 });
        
        // Remove header row and convert to objects
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as any[][];
        
        const result = rows.map(row => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj as T;
        });
        
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse Opportunities Report
 */
export async function parseOpportunitiesFile(file: File): Promise<ProcessedOpportunity[]> {
  const rawData = await parseExcelFile<OpportunityData>(file, 'Opportunities');
  
  return rawData.map(row => ({
    date: parseDate(row.Date),
    jobId: String(row.Job),
    customer: row.Customer,
    email: row.Email,
    phone: row.Phone,
    status: row.Status,
    technician: normalizeTechnicianName(row['Opportunity Owner']),
    membershipOpportunity: row['Membership Opportunity'] === 'Yes',
    membershipSold: row['Membership Sold'] === 'Yes',
    revenue: typeof row.Revenue === 'number' ? row.Revenue : parseCurrency(String(row.Revenue))
  }));
}

/**
 * Parse Line Items Sold Report
 */
export async function parseLineItemsFile(file: File): Promise<ProcessedLineItem[]> {
  const rawData = await parseExcelFile<LineItemData>(file, 'Sold Line Items');
  
  return rawData.map(row => ({
    invoiceDate: parseDate(row['Invoice Date']),
    customer: row.Customer,
    jobId: String(row.Job),
    technician: normalizeTechnicianName(row['Opp. Owner']),
    category: row.Category,
    lineItem: row['Line Item'],
    quantity: typeof row.Quantity === 'number' ? row.Quantity : parseInt(String(row.Quantity), 10) || 1,
    price: typeof row.Price === 'number' ? row.Price : parseCurrency(String(row.Price))
  }));
}

/**
 * Parse Job Times Report
 */
export async function parseJobTimesFile(file: File): Promise<ProcessedJobTime[]> {
  const rawData = await parseExcelFile<JobTimeData>(file, 'Job Times');
  
  return rawData.map(row => ({
    firstAppointment: parseDate(row['First Appointment']),
    jobId: String(row.Job),
    jobStatus: row['Job Status'],
    customer: row.Customer,
    technician: normalizeTechnicianName(row['Opportunity Owner']),
    opportunity: row.Opportunity,
    total: parseCurrency(row.Total),
    totalTime: parseTimeToMinutes(row['Total Time']),
    soldTime: parseTimeToMinutes(row['Sold Time']),
    jobEfficiency: parsePercentage(row['Job Efficiency'])
  }));
}

/**
 * Parse Appointments Report
 */
export async function parseAppointmentsFile(file: File): Promise<ProcessedAppointment[]> {
  const rawData = await parseExcelFile<AppointmentData>(file, 'Appointments');
  
  return rawData.map(row => ({
    appointmentId: String(row.Appointment),
    scheduledFor: parseDateTime(row['Scheduled For']),
    jobId: String(row.Job),
    customer: row.Customer,
    apptStatus: row['Appt Status'],
    technician: normalizeTechnicianName(row.Technician),
    serviceCategory: row['Service Category'],
    revenue: typeof row.Revenue === 'number' ? row.Revenue : parseCurrency(String(row.Revenue))
  }));
}

/**
 * Validate file structure and required columns
 */
export function validateFileStructure(file: File, expectedSheet: string, requiredColumns: string[]): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (!workbook.SheetNames.includes(expectedSheet)) {
          reject(new Error(`Required sheet "${expectedSheet}" not found`));
          return;
        }
        
        const worksheet = workbook.Sheets[expectedSheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          reject(new Error('File is empty'));
          return;
        }
        
        const headers = jsonData[0] as string[];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          reject(new Error(`Missing required columns: ${missingColumns.join(', ')}`));
          return;
        }
        
        resolve(true);
      } catch (error) {
        reject(new Error(`File validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file for validation'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Get file validation requirements for each file type
 */
export const FILE_VALIDATION_REQUIREMENTS = {
  opportunities: {
    sheetName: 'Opportunities',
    requiredColumns: ['Date', 'Job', 'Customer', 'Status', 'Opportunity Owner', 'Revenue']
  },
  lineItems: {
    sheetName: 'Sold Line Items',
    requiredColumns: ['Invoice Date', 'Job', 'Opp. Owner', 'Line Item', 'Price']
  },
  jobTimes: {
    sheetName: 'Job Times',
    requiredColumns: ['First Appointment', 'Job', 'Job Status', 'Opportunity Owner', 'Job Efficiency']
  },
  appointments: {
    sheetName: 'Appointments',
    requiredColumns: ['Scheduled For', 'Job', 'Technician', 'Appt Status', 'Revenue']
  }
}; 