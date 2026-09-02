import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface OrderTimerProps {
  createdAt: string;
  expiryMinutes: number;
  onExpire?: () => void;
  className?: string;
  compact?: boolean;
}

export const OrderTimer: React.FC<OrderTimerProps> = ({ 
  createdAt, 
  expiryMinutes, 
  onExpire, 
  className = '',
  compact = false
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    // Calculate initial time left
    const createdDate = new Date(createdAt);
    const expiryDate = new Date(createdDate.getTime() + expiryMinutes * 60000);
    
    const updateTimer = () => {
      const now = new Date();
      const difference = expiryDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeLeft(0);
        if (!isExpired) {
          setIsExpired(true);
          if (onExpire) {
            onExpire();
          }
        }
      } else {
        setTimeLeft(Math.floor(difference / 1000));
      }
    };

    // Run immediately once
    updateTimer();
    
    if (isExpired) return;

    // Set interval to run every second
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [createdAt, expiryMinutes, isExpired, onExpire]);

  if (isExpired) {
    return (
      <div className={`flex items-center gap-1.5 text-red-600 font-bold ${className}`}>
        <Clock className={compact ? "w-3 h-3" : "w-4 h-4"} />
        <span className={compact ? "text-xs" : "text-sm"}>Waktu Habis</span>
      </div>
    );
  }

  // Format time (MM:SS)
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className={`flex items-center gap-1.5 ${minutes < 3 ? 'text-red-500 animate-pulse' : 'text-amber-500'} font-bold ${className}`}>
      <Clock className={compact ? "w-3 h-3" : "w-4 h-4"} />
      <span className={compact ? "text-xs tabular-nums" : "text-sm tabular-nums tracking-wider"}>{formattedTime}</span>
    </div>
  );
};

export default OrderTimer;
