"use client";

import React, { useState } from 'react';
import styles from './FeedbackModal.module.css';

const FeedbackModal: React.FC = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  const handleFeedbackOpen = () => {
    setShowFeedback(true);
    setCurrentStep(1);
    setRating(0);
    setFeedbackText('');
    // Небольшая задержка для запуска анимации открытия
    setTimeout(() => {
      setIsAnimating(true);
    }, 10);
  };

  const handleFeedbackClose = () => {
    setIsAnimating(false);
    // Ждем завершения анимации закрытия перед скрытием модала
    setTimeout(() => {
      setShowFeedback(false);
      setCurrentStep(1);
      setRating(0);
      setFeedbackText('');
    }, 400);
  };

  const handleRatingClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleNext = () => {
    if (currentStep === 1 && rating > 0) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = () => {
    // Здесь будет логика отправки feedback
    handleFeedbackClose();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    // Закрываем модал только при клике на backdrop (не на content)
    if (e.target === e.currentTarget) {
      handleFeedbackClose();
    }
  };


  return (
    <>
      {/* Fixed Feedback Button */}
      <div className={styles.feedbackButtonContainer}>
        <button
          onClick={handleFeedbackOpen}
          className={`${styles.feedbackButton} ${showFeedback ? styles.feedbackButtonHidden : ''}`}
        >
          Feedback
        </button>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div 
          className={`${styles.feedbackModal} ${isAnimating ? styles.feedbackModalOpen : styles.feedbackModalClosed}`}
          onClick={handleModalClick}
        >
          <div className={`${styles.feedbackModalContent} ${isAnimating ? styles.feedbackModalContentOpen : styles.feedbackModalContentClosed} ${currentStep === 2 ? styles.expanded : ''}`}>
            <div className={styles.feedbackModalHeader}>
              <h3 className={styles.feedbackModalTitle}>
                {currentStep === 1 ? 'How would you rate your experience?' : 'Tell us more'}
              </h3>
            </div>

            {currentStep === 1 ? (
              <div className={styles.ratingStep}>
                <div className={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingClick(star)}
                      className={`${styles.star} ${star <= rating ? styles.starActive : ''}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div className={styles.ratingLabels}>
                  <span className={styles.ratingLabel}>Awful</span>
                  <span className={styles.ratingLabel}>Amazing</span>
                </div>
                <button 
                  className={`${styles.nextButton} ${rating > 0 ? styles.nextButtonActive : ''}`}
                  onClick={handleNext}
                  disabled={rating === 0}
                >
                  Next
                </button>
              </div>
            ) : (
              <div className={styles.feedbackStep}>
                <textarea
                  placeholder="Tell us about your experience with our service..."
                  className={styles.feedbackTextarea}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
                <div className={styles.feedbackButtons}>
                  <button 
                    className={styles.backButton}
                    onClick={() => setCurrentStep(1)}
                  >
                    Back
                  </button>
                  <button 
                    className={styles.submitButton}
                    onClick={handleSubmit}
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackModal;
