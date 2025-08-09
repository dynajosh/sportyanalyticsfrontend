export const getCellBackground = (dateKey, isToday, isFuture, isSelected, processedData) => {
  if (isFuture) return 'bg-white';
  if (isSelected) return 'bg-blue-200 border-2 border-blue-600';
  if (isToday) return 'bg-blue-100 border-2 border-blue-500';
  
  const dayData = processedData[dateKey];
  if (!dayData) return 'bg-gray-100';
  
  if (dayData.netPnL > 0) return 'bg-green-100';
  if (dayData.netPnL < 0) return 'bg-red-100';
  return 'bg-gray-100';
};