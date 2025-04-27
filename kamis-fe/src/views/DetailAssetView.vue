// Calculate maintenance duration in days
const calculateMaintenanceDuration = (startDate: string, endDate: string): string | number => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const differenceInTime = end.getTime() - start.getTime();
  const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
  
  // Return "<1" if the duration is less than 1 day
  return differenceInDays < 1 ? "<1" : differenceInDays;
};