"use client";

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

interface EventSuccessNotificationProps {
  onClose: () => void;
  duration?: number;
}

const EventSuccessNotification: React.FC<EventSuccessNotificationProps> = ({ 
  onClose, 
  duration = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show notification with slight delay for animation
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Auto-hide notification
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: isVisible 
          ? 'translate(-50%, -50%) scale(1)' 
          : 'translate(-50%, -50%) scale(0.8)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 9999,
        maxWidth: '500px',
        minWidth: '400px'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          padding: '40px 30px',
          backgroundColor: '#000000',
          border: '1px solid #333333',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center'
        }}
      >
        {/* Close button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            borderRadius: '50%',
            transition: 'all 0.2s ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <X size={20} />
        </button>

        {/* Paul Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            padding: '15px',
            marginBottom: '10px'
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#000000',
              fontFamily: 'serif'
            }}
          >
            P
          </div>
        </div>

        {/* Success message */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <h3
            style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#ffffff',
              margin: 0,
              fontFamily: 'serif'
            }}
          >
            Your request has been submitted.
          </h3>
          
          <p
            style={{
              fontSize: '16px',
              fontWeight: '400',
              color: '#cccccc',
              margin: 0,
              lineHeight: '1.5',
              maxWidth: '350px'
            }}
          >
            We will get in touch with you within 2 days
          </p>
        </div>

        {/* Progress bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '4px',
            backgroundColor: '#ffffff',
            borderRadius: '0 0 16px 16px',
            animation: `progressBar ${duration}ms linear forwards`
          }}
        />

        <style jsx>{`
          @keyframes progressBar {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default EventSuccessNotification;
