import { useState, useEffect } from 'react';

export function useRealTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedTimeWithSeconds = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  return { time, formattedTime, formattedTimeWithSeconds };
}
