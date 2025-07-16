import React from 'react';
import { Info } from 'lucide-react';
import { formatCurrency, formatPercentage, formatCount, getKPIColor } from '../utils/formatters';
import { KPI_THRESHOLDS } from '../services/kpiCalculator';

interface KPIMetricProps {
  name: string;
  value: number;
  unit: 'currency' | 'percentage' | 'count';
  description: string;
  thresholds?: { good: number; warning: number };
}

export function KPIMetric({ 
  name, 
  value, 
  unit, 
  description, 
  thresholds 
}: KPIMetricProps) {
  const formatValue = () => {
    switch (unit) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      case 'count':
        return formatCount(value);
      default:
        return value.toString();
    }
  };

  const getColor = () => {
    if (!thresholds) return 'neutral';
    return getKPIColor(value, thresholds);
  };

  const color = getColor();
  const colorClasses = {
    success: 'text-success-600 bg-success-50 border-success-200',
    warning: 'text-warning-600 bg-warning-50 border-warning-200',
    danger: 'text-danger-600 bg-danger-50 border-danger-200',
    neutral: 'text-gray-600 bg-gray-50 border-gray-200'
  };

  return (
    <div className={`metric-card border-l-4 border-l-${color === 'success' ? 'success' : color === 'warning' ? 'warning' : color === 'danger' ? 'danger' : 'gray'}-500`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-sm font-medium text-gray-900">{name}</h4>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
          
          <div className={`text-2xl font-bold ${colorClasses[color]}`}>
            {formatValue()}
          </div>
          
          {thresholds && (
            <div className="mt-2 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>Poor: &lt;{unit === 'currency' ? formatCurrency(thresholds.warning) : unit === 'percentage' ? formatPercentage(thresholds.warning) : thresholds.warning}</span>
                <span>Good: ≥{unit === 'currency' ? formatCurrency(thresholds.good) : unit === 'percentage' ? formatPercentage(thresholds.good) : thresholds.good}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className={`w-3 h-3 rounded-full ${color === 'success' ? 'bg-success-500' : color === 'warning' ? 'bg-warning-500' : color === 'danger' ? 'bg-danger-500' : 'bg-gray-400'}`}></div>
      </div>
    </div>
  );
}

// Predefined KPI components for common metrics
export function AverageTicketValueMetric({ value }: { value: number }) {
  return (
    <KPIMetric
      name="Average Ticket Value"
      value={value}
      unit="currency"
      description="Total revenue divided by number of completed jobs"
      thresholds={KPI_THRESHOLDS.averageTicketValue}
    />
  );
}

export function JobCloseRateMetric({ value }: { value: number }) {
  return (
    <KPIMetric
      name="Job Close Rate"
      value={value}
      unit="percentage"
      description="Percentage of opportunities that resulted in won jobs"
      thresholds={KPI_THRESHOLDS.jobCloseRate}
    />
  );
}

export function WeeklyRevenueMetric({ value }: { value: number }) {
  return (
    <KPIMetric
      name="Weekly Revenue"
      value={value}
      unit="currency"
      description="Total revenue generated in the selected week"
      thresholds={KPI_THRESHOLDS.weeklyRevenue}
    />
  );
}

export function JobEfficiencyMetric({ value }: { value: number }) {
  return (
    <KPIMetric
      name="Job Efficiency"
      value={value}
      unit="percentage"
      description="Average efficiency percentage across all jobs"
      thresholds={KPI_THRESHOLDS.jobEfficiency}
    />
  );
}

export function MembershipWinRateMetric({ value }: { value: number }) {
  return (
    <KPIMetric
      name="Membership Win Rate"
      value={value}
      unit="percentage"
      description="Percentage of membership opportunities that were sold"
      thresholds={KPI_THRESHOLDS.membershipWinRate}
    />
  );
}

export function HydroJettingJobsMetric({ value }: { value: number }) {
  return (
    <KPIMetric
      name="Hydro Jetting Jobs"
      value={value}
      unit="count"
      description="Number of hydro jetting services sold"
      thresholds={KPI_THRESHOLDS.hydroJettingJobsSold}
    />
  );
}

export function DescalingJobsMetric({ value }: { value: number }) {
  return (
    <KPIMetric
      name="Descaling Jobs"
      value={value}
      unit="count"
      description="Number of descaling services sold"
      thresholds={KPI_THRESHOLDS.descalingJobsSold}
    />
  );
}

export function WaterHeaterJobsMetric({ value }: { value: number }) {
  return (
    <KPIMetric
      name="Water Heater Jobs"
      value={value}
      unit="count"
      description="Number of water heater services sold"
      thresholds={KPI_THRESHOLDS.waterHeaterJobsSold}
    />
  );
} 