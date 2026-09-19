export const getRelativeDate = (offsetDays: number = 0, format: 'full' | 'short' | 'dash' | 'iso' | 'month' | 'shortYear' | 'nospace' | 'file' = 'full') => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  
  if (format === 'dash') {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}-${month}-${d.getFullYear()}`;
  }
  if (format === 'iso') {
    return d.toISOString().split('T')[0];
  }
  if (format === 'short') {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }
  if (format === 'shortYear') {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  if (format === 'full') {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  if (format === 'nospace') {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/\s/g, '');
  }
  if (format === 'file') {
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleDateString('en-GB', { month: 'short' });
    return `${day}${month}${d.getFullYear()}`;
  }
  return d.toString();
};

export const getToday = () => getRelativeDate(0);
export const getYesterday = () => getRelativeDate(-1);
export const getTomorrow = () => getRelativeDate(1);
