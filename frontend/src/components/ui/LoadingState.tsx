import React from 'react';

export interface LoadingStateProps {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  loadingText = 'Загрузка...',
  children,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-sm text-gray-600 font-medium">{loadingText}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingState;
