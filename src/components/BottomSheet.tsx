import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[];
  initialSnap?: number;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.3, 0.6, 0.9],
  initialSnap = 1,
  className
}) => {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const snapHeight = snapPoints[currentSnap] * window.innerHeight;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setCurrentSnap(initialSnap);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialSnap]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!dragHandleRef.current?.contains(e.target as Node)) return;
    
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    setCurrentY(e.touches[0].clientY);
    const deltaY = e.touches[0].clientY - startY;
    const newHeight = Math.max(0, snapHeight - deltaY);
    
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${Math.max(0, window.innerHeight - newHeight)}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    const deltaY = currentY - startY;
    const velocityThreshold = 50;
    
    let newSnapIndex = currentSnap;
    
    if (deltaY > velocityThreshold) {
      // Dragging down
      if (currentSnap > 0) {
        newSnapIndex = currentSnap - 1;
      } else {
        onClose();
        return;
      }
    } else if (deltaY < -velocityThreshold) {
      // Dragging up
      if (currentSnap < snapPoints.length - 1) {
        newSnapIndex = currentSnap + 1;
      }
    }
    
    setCurrentSnap(newSnapIndex);
    
    if (sheetRef.current) {
      const targetHeight = snapPoints[newSnapIndex] * window.innerHeight;
      sheetRef.current.style.transform = `translateY(${window.innerHeight - targetHeight}px)`;
    }
  };

  // Mouse events for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!dragHandleRef.current?.contains(e.target as Node)) return;
    
    setIsDragging(true);
    setStartY(e.clientY);
    setCurrentY(e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    setCurrentY(e.clientY);
    const deltaY = e.clientY - startY;
    const newHeight = Math.max(0, snapHeight - deltaY);
    
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${Math.max(0, window.innerHeight - newHeight)}px)`;
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    const deltaY = currentY - startY;
    const velocityThreshold = 50;
    
    let newSnapIndex = currentSnap;
    
    if (deltaY > velocityThreshold) {
      if (currentSnap > 0) {
        newSnapIndex = currentSnap - 1;
      } else {
        onClose();
        return;
      }
    } else if (deltaY < -velocityThreshold) {
      if (currentSnap < snapPoints.length - 1) {
        newSnapIndex = currentSnap + 1;
      }
    }
    
    setCurrentSnap(newSnapIndex);
    
    if (sheetRef.current) {
      const targetHeight = snapPoints[newSnapIndex] * window.innerHeight;
      sheetRef.current.style.transform = `translateY(${window.innerHeight - targetHeight}px)`;
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startY, snapHeight]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          "fixed left-0 right-0 bottom-0 bg-white z-50 transition-transform duration-300 ease-out",
          "rounded-t-xl shadow-lg border-t border-gray-200",
          className
        )}
        style={{
          height: snapHeight,
          transform: `translateY(${window.innerHeight - snapHeight}px)`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {/* Drag Handle */}
        <div 
          ref={dragHandleRef}
          className="w-full py-3 px-4 cursor-grab active:cursor-grabbing"
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-2" />
          {title && (
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {children}
        </div>
        
        {/* Snap Indicator */}
        <div className="absolute right-4 top-4 flex space-x-1">
          {snapPoints.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                currentSnap === index ? "bg-blue-500" : "bg-gray-300"
              )}
            />
          ))}
        </div>
      </div>
    </>
  );
};

