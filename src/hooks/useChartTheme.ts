import { useEffect, useState } from 'react';

export interface ChartTheme {
  isDark: boolean;
  grid: string;
  axis: string;
  tick: string;
  tooltipText: string;
  cursorFill: string;
  cursorStroke: string;
  legendText: string;
  tooltipStyle: React.CSSProperties;
}

export const useDarkMode = (): boolean => {
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false
  );

  useEffect(() => {
    const el = document.documentElement;
    const update = () => setIsDark(el.classList.contains('dark'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
};

export const useChartTheme = (): ChartTheme => {
  const isDark = useDarkMode();

  return {
    isDark,
    grid: isDark ? 'rgba(148, 163, 184, 0.16)' : '#e2e8f0',
    axis: isDark ? 'rgba(148, 163, 184, 0.25)' : '#cbd5e1',
    tick: isDark ? '#94a3b8' : '#64748b',
    tooltipText: isDark ? '#e2e8f0' : '#1e293b',
    cursorFill: isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(15, 23, 42, 0.04)',
    cursorStroke: isDark ? '#475569' : '#cbd5e1',
    legendText: isDark ? '#c7d2e0' : '#475569',
    tooltipStyle: isDark
      ? {
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 8,
          fontSize: 11,
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)',
        }
      : {
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          fontSize: 11,
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
        },
  };
};