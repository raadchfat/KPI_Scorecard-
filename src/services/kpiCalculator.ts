import type {
  ProcessedOpportunity,
  ProcessedLineItem,
  ProcessedJobTime,
  ProcessedAppointment,
  TechnicianKPIs
} from '../types';
import { isDateInWeekRange } from '../utils/dateHelpers';
import { 
  getHydroJettingKeywords, 
  getDescalingKeywords, 
  getWaterHeaterKeywords,
  containsServiceKeywords 
} from '../utils/formatters';

/**
 * Calculate all KPIs for a technician within a specific week range
 */
export function calculateTechnicianKPIs(
  technician: string,
  opportunities: ProcessedOpportunity[],
  lineItems: ProcessedLineItem[],
  jobTimes: ProcessedJobTime[],
  appointments: ProcessedAppointment[],
  weekStart: Date,
  weekEnd: Date
): TechnicianKPIs {
  // Filter data for the specific technician and week range
  const techOpportunities = opportunities.filter(
    opp => opp.technician === technician && isDateInWeekRange(opp.date, weekStart, weekEnd)
  );
  
  const techLineItems = lineItems.filter(
    item => item.technician === technician && isDateInWeekRange(item.invoiceDate, weekStart, weekEnd)
  );
  
  const techJobTimes = jobTimes.filter(
    job => job.technician === technician && isDateInWeekRange(job.firstAppointment, weekStart, weekEnd)
  );
  
  const techAppointments = appointments.filter(
    appt => appt.technician === technician && isDateInWeekRange(appt.scheduledFor, weekStart, weekEnd)
  );

  // Calculate KPIs
  const averageTicketValue = calculateAverageTicketValue(techOpportunities, techAppointments);
  const jobCloseRate = calculateJobCloseRate(techOpportunities);
  const weeklyRevenue = calculateWeeklyRevenue(techOpportunities, techAppointments);
  const jobEfficiency = calculateJobEfficiency(techJobTimes);
  const membershipWinRate = calculateMembershipWinRate(techOpportunities);
  const hydroJettingJobsSold = calculateHydroJettingJobsSold(techLineItems);
  const descalingJobsSold = calculateDescalingJobsSold(techLineItems);
  const waterHeaterJobsSold = calculateWaterHeaterJobsSold(techLineItems);

  return {
    technician,
    averageTicketValue,
    jobCloseRate,
    weeklyRevenue,
    jobEfficiency,
    membershipWinRate,
    hydroJettingJobsSold,
    descalingJobsSold,
    waterHeaterJobsSold
  };
}

/**
 * Calculate Average Ticket Value: Total Revenue ÷ Number of Completed Jobs
 */
function calculateAverageTicketValue(
  opportunities: ProcessedOpportunity[],
  appointments: ProcessedAppointment[]
): number {
  // Get completed jobs (Won opportunities + Completed appointments)
  const completedJobs = opportunities.filter(opp => opp.status === 'Won').length +
                       appointments.filter(appt => appt.apptStatus === 'Completed').length;
  
  if (completedJobs === 0) return 0;
  
  // Calculate total revenue from both sources
  const totalRevenue = opportunities.reduce((sum, opp) => sum + opp.revenue, 0) +
                      appointments.reduce((sum, appt) => sum + appt.revenue, 0);
  
  return totalRevenue / completedJobs;
}

/**
 * Calculate Job Close Rate: (Jobs Won ÷ Total Opportunities) × 100
 */
function calculateJobCloseRate(opportunities: ProcessedOpportunity[]): number {
  if (opportunities.length === 0) return 0;
  
  const wonJobs = opportunities.filter(opp => opp.status === 'Won').length;
  return (wonJobs / opportunities.length) * 100;
}

/**
 * Calculate Weekly Revenue: Sum of all revenue for technician
 */
function calculateWeeklyRevenue(
  opportunities: ProcessedOpportunity[],
  appointments: ProcessedAppointment[]
): number {
  const opportunitiesRevenue = opportunities.reduce((sum, opp) => sum + opp.revenue, 0);
  const appointmentsRevenue = appointments.reduce((sum, appt) => sum + appt.revenue, 0);
  
  return opportunitiesRevenue + appointmentsRevenue;
}

/**
 * Calculate Job Efficiency: Average of individual job efficiency percentages
 */
function calculateJobEfficiency(jobTimes: ProcessedJobTime[]): number {
  const validEfficiencies = jobTimes
    .filter(job => job.jobEfficiency > 0)
    .map(job => job.jobEfficiency);
  
  if (validEfficiencies.length === 0) return 0;
  
  const sum = validEfficiencies.reduce((total, efficiency) => total + efficiency, 0);
  return sum / validEfficiencies.length;
}

/**
 * Calculate Membership Win Rate: (Memberships Sold ÷ Membership Opportunities) × 100
 */
function calculateMembershipWinRate(opportunities: ProcessedOpportunity[]): number {
  const membershipOpportunities = opportunities.filter(opp => opp.membershipOpportunity);
  
  if (membershipOpportunities.length === 0) return 0;
  
  const membershipsSold = membershipOpportunities.filter(opp => opp.membershipSold).length;
  return (membershipsSold / membershipOpportunities.length) * 100;
}

/**
 * Calculate Hydro Jetting Jobs Sold: Count of line items containing hydro jetting services
 */
function calculateHydroJettingJobsSold(lineItems: ProcessedLineItem[]): number {
  const keywords = getHydroJettingKeywords();
  return lineItems.filter(item => containsServiceKeywords(item.lineItem, keywords)).length;
}

/**
 * Calculate Descaling Jobs Sold: Count of line items containing descaling services
 */
function calculateDescalingJobsSold(lineItems: ProcessedLineItem[]): number {
  const keywords = getDescalingKeywords();
  return lineItems.filter(item => containsServiceKeywords(item.lineItem, keywords)).length;
}

/**
 * Calculate Water Heater Jobs Sold: Count of line items containing water heater services
 */
function calculateWaterHeaterJobsSold(lineItems: ProcessedLineItem[]): number {
  const keywords = getWaterHeaterKeywords();
  return lineItems.filter(item => containsServiceKeywords(item.lineItem, keywords)).length;
}

/**
 * Calculate KPIs for all technicians
 */
export function calculateAllTechnicianKPIs(
  opportunities: ProcessedOpportunity[],
  lineItems: ProcessedLineItem[],
  jobTimes: ProcessedJobTime[],
  appointments: ProcessedAppointment[],
  weekStart: Date,
  weekEnd: Date
): TechnicianKPIs[] {
  // Get unique technician names from all data sources
  const technicianNames = new Set<string>();
  
  opportunities.forEach(opp => technicianNames.add(opp.technician));
  lineItems.forEach(item => technicianNames.add(item.technician));
  jobTimes.forEach(job => technicianNames.add(job.technician));
  appointments.forEach(appt => technicianNames.add(appt.technician));
  
  // Calculate KPIs for each technician
  return Array.from(technicianNames).map(technician =>
    calculateTechnicianKPIs(
      technician,
      opportunities,
      lineItems,
      jobTimes,
      appointments,
      weekStart,
      weekEnd
    )
  );
}

/**
 * Get KPI thresholds for color coding
 */
export const KPI_THRESHOLDS = {
  averageTicketValue: { good: 1000, warning: 500 },
  jobCloseRate: { good: 80, warning: 60 },
  weeklyRevenue: { good: 5000, warning: 2500 },
  jobEfficiency: { good: 75, warning: 50 },
  membershipWinRate: { good: 50, warning: 25 },
  hydroJettingJobsSold: { good: 3, warning: 1 },
  descalingJobsSold: { good: 2, warning: 1 },
  waterHeaterJobsSold: { good: 2, warning: 1 }
}; 