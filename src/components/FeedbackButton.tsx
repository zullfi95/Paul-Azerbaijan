"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, X } from 'lucide-react';
import './FeedbackButton.css';

const FeedbackButton: React.FC = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  const handleFeedbackClick = () => {
    router.push('/feedback');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="feedback-button-container">
      <button 
        className="feedback-button"
        onClick={handleFeedbackClick}
        aria-label="Feedback"
      >
        <MessageCircle size={20} />
        <span>Feedback</span>
      </button>
      <button 
        className="feedback-close"
        onClick={handleClose}
        aria-label="Close feedback button"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default FeedbackButton;
