/**
 * Format currency values
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format count values
 */
export function formatCount(count: number): string {
  return count.toLocaleString();
}

/**
 * Parse currency string to number
 */
export function parseCurrency(currencyString: string | null | undefined): number {
  if (!currencyString) return 0;
  // Remove $ and commas, then parse
  const cleaned = currencyString.replace(/[$,]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Parse percentage string to number
 */
export function parsePercentage(percentageString: string | null | undefined): number {
  if (!percentageString) return 0;
  // Remove % and spaces, then parse
  const cleaned = percentageString.replace(/[%\s]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Parse time string to minutes
 */
export function parseTimeToMinutes(timeString: string | null | undefined): number {
  if (!timeString) return 0;
  // Handle format like "4h 48m (288 mins)" or "0h 0m (0 mins)"
  const match = timeString.match(/(\d+)h\s*(\d+)m/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return hours * 60 + minutes;
  }
  return 0;
}

/**
 * Get color for KPI performance
 */
export function getKPIColor(value: number, thresholds: { good: number; warning: number }): 'success' | 'warning' | 'danger' | 'neutral' {
  if (value >= thresholds.good) return 'success';
  if (value >= thresholds.warning) return 'warning';
  if (value > 0) return 'danger';
  return 'neutral';
}

/**
 * Normalize technician names
 */
export function normalizeTechnicianName(name: string | null | undefined): string {
  // Handle null/undefined values
  if (!name) return 'Unknown Technician';
  
  // Remove extra spaces and normalize common variations
  const normalized = name.trim().replace(/\s+/g, ' ');
  
  // Handle common name variations
  const nameMap: Record<string, string> = {
    'Aaron M': 'Aaron McDaniel',
    'Aaron': 'Aaron McDaniel',
    'Jake H': 'Jake Harter',
    'Jake': 'Jake Harter',
    'Steven S': 'Steven Springer',
    'Steven': 'Steven Springer',
    'Colin M': 'Colin Myers',
    'Colin': 'Colin Myers',
    'Brennan E': 'Brennan Ebbesmier',
    'Brennan': 'Brennan Ebbesmier',
    'Justice B': 'Justice Burns',
    'Justice': 'Justice Burns',
    'Alex P': 'Alex P',
  };
  
  return nameMap[normalized] || normalized;
}

/**
 * Check if line item contains specific service keywords
 */
export function containsServiceKeywords(lineItem: string | null | undefined, keywords: string[]): boolean {
  if (!lineItem) return false;
  const lowerLineItem = lineItem.toLowerCase();
  return keywords.some(keyword => lowerLineItem.includes(keyword.toLowerCase()));
}

/**
 * Get hydro jetting keywords
 */
export function getHydroJettingKeywords(): string[] {
  return ['hydro', 'jetting', 'high pressure', 'pressure wash'];
}

/**
 * Get descaling keywords
 */
export function getDescalingKeywords(): string[] {
  return ['descal', 'scale removal', 'cast iron pipe descaling', 'descaling'];
}

/**
 * Get water heater keywords
 */
export function getWaterHeaterKeywords(): string[] {
  return ['water heater', 'hot water', 'heater install', 'heater replacement'];
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate file type
 */
export function isValidExcelFile(file: File): boolean {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  return validTypes.includes(file.type);
}

/**
 * Validate file size (max 10MB)
 */
export function isValidFileSize(file: File, maxSizeMB: number = 10): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
} 