/**
 * Get the start of the week (Monday) for a given date
 */
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Get the end of the week (Sunday) for a given date
 */
export function getEndOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Get the current week range (Monday to Sunday)
 */
export function getCurrentWeek(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: getStartOfWeek(now),
    end: getEndOfWeek(now)
  };
}

/**
 * Get the previous week range
 */
export function getPreviousWeek(currentStart: Date): { start: Date; end: Date } {
  const prevStart = new Date(currentStart);
  prevStart.setDate(prevStart.getDate() - 7);
  return {
    start: prevStart,
    end: new Date(prevStart.getTime() + 6 * 24 * 60 * 60 * 1000)
  };
}

/**
 * Get the next week range
 */
export function getNextWeek(currentStart: Date): { start: Date; end: Date } {
  const nextStart = new Date(currentStart);
  nextStart.setDate(nextStart.getDate() + 7);
  return {
    start: nextStart,
    end: new Date(nextStart.getTime() + 6 * 24 * 60 * 60 * 1000)
  };
}

/**
 * Format date as MM/DD/YYYY
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}

/**
 * Format date range for display
 */
export function formatDateRange(start: Date, end: Date): string {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

/**
 * Parse date string in MM/DD/YYYY format
 */
export function parseDate(dateString: string): Date {
  const [month, day, year] = dateString.split('/').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Parse date string with time in MM/DD/YYYY HH:MM AM/PM format
 */
export function parseDateTime(dateTimeString: string): Date {
  // Handle format like "06/01/2025 10:00 AM"
  const [datePart, timePart] = dateTimeString.split(' ');
  const date = parseDate(datePart);
  
  if (timePart) {
    const [time, period] = timePart.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour = hours;
    
    if (period === 'PM' && hours !== 12) {
      hour += 12;
    } else if (period === 'AM' && hours === 12) {
      hour = 0;
    }
    
    date.setHours(hour, minutes, 0, 0);
  }
  
  return date;
}

/**
 * Check if a date falls within a week range
 */
export function isDateInWeekRange(date: Date, weekStart: Date, weekEnd: Date): boolean {
  return date >= weekStart && date <= weekEnd;
}

/**
 * Get week label for display
 */
export function getWeekLabel(start: Date, end: Date): string {
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = start.getFullYear();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}, ${year}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }
} 