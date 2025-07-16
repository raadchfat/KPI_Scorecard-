import { useState } from 'react';
import { ChevronDown, ChevronUp, User } from 'lucide-react';
import type { TechnicianKPIs } from '../types';
import {
  AverageTicketValueMetric,
  JobCloseRateMetric,
  WeeklyRevenueMetric,
  JobEfficiencyMetric,
  MembershipWinRateMetric,
  HydroJettingJobsMetric,
  DescalingJobsMetric,
  WaterHeaterJobsMetric
} from './KPIMetric';

interface TechnicianCardProps {
  technician: TechnicianKPIs;
}

export function TechnicianCard({ technician }: TechnicianCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Calculate overall performance score (simple average of normalized scores)
  const calculatePerformanceScore = () => {
    const metrics = [
      technician.averageTicketValue,
      technician.jobCloseRate,
      technician.weeklyRevenue,
      technician.jobEfficiency,
      technician.membershipWinRate,
      technician.hydroJettingJobsSold,
      technician.descalingJobsSold,
      technician.waterHeaterJobsSold
    ];

    // Normalize each metric to 0-100 scale (this is a simplified approach)
    const normalizedScores = metrics.map((value, index) => {
      // Define reasonable max values for normalization
      const maxValues = [2000, 100, 10000, 100, 100, 10, 5, 5];
      return Math.min((value / maxValues[index]) * 100, 100);
    });

    const averageScore = normalizedScores.reduce((sum, score) => sum + score, 0) / normalizedScores.length;
    return Math.round(averageScore);
  };

  const performanceScore = calculatePerformanceScore();
  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-success-600 bg-success-100';
    if (score >= 60) return 'text-warning-600 bg-warning-100';
    return 'text-danger-600 bg-danger-100';
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {technician.technician}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Performance Score:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(performanceScore)}`}>
                {performanceScore}/100
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={toggleExpanded}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Summary Metrics (always visible) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <WeeklyRevenueMetric value={technician.weeklyRevenue} />
        <JobCloseRateMetric value={technician.jobCloseRate} />
        <JobEfficiencyMetric value={technician.jobEfficiency} />
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Detailed KPIs</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AverageTicketValueMetric value={technician.averageTicketValue} />
            <MembershipWinRateMetric value={technician.membershipWinRate} />
            <HydroJettingJobsMetric value={technician.hydroJettingJobsSold} />
            <DescalingJobsMetric value={technician.descalingJobsSold} />
            <WaterHeaterJobsMetric value={technician.waterHeaterJobsSold} />
          </div>

          {/* Additional Details */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Performance Insights</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Revenue Performance:</span>
                <span className={`ml-2 ${technician.weeklyRevenue >= 5000 ? 'text-success-600' : technician.weeklyRevenue >= 2500 ? 'text-warning-600' : 'text-danger-600'}`}>
                  {technician.weeklyRevenue >= 5000 ? 'Excellent' : technician.weeklyRevenue >= 2500 ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
              <div>
                <span className="font-medium">Close Rate:</span>
                <span className={`ml-2 ${technician.jobCloseRate >= 80 ? 'text-success-600' : technician.jobCloseRate >= 60 ? 'text-warning-600' : 'text-danger-600'}`}>
                  {technician.jobCloseRate >= 80 ? 'Excellent' : technician.jobCloseRate >= 60 ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
              <div>
                <span className="font-medium">Efficiency:</span>
                <span className={`ml-2 ${technician.jobEfficiency >= 75 ? 'text-success-600' : technician.jobEfficiency >= 50 ? 'text-warning-600' : 'text-danger-600'}`}>
                  {technician.jobEfficiency >= 75 ? 'Excellent' : technician.jobEfficiency >= 50 ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
              <div>
                <span className="font-medium">Membership Sales:</span>
                <span className={`ml-2 ${technician.membershipWinRate >= 50 ? 'text-success-600' : technician.membershipWinRate >= 25 ? 'text-warning-600' : 'text-danger-600'}`}>
                  {technician.membershipWinRate >= 50 ? 'Excellent' : technician.membershipWinRate >= 25 ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 