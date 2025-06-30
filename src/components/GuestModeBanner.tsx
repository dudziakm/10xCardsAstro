import React from 'react';
import { Button } from './ui/button';
import { useTranslation } from '../hooks/useTranslation';

interface GuestModeBannerProps {
  onSignUp?: () => void;
  onDismiss?: () => void;
}

export function GuestModeBanner({ onSignUp, onDismiss }: GuestModeBannerProps) {
  const { t } = useTranslation();
  
  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp();
    } else {
      window.location.href = '/auth/signup';
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-xl">⚠️</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">{t('guestMode.title')}</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              {t('guestMode.description')}
            </p>
          </div>
          <div className="mt-4 flex space-x-3">
            <Button
              onClick={handleSignUp}
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {t('guestMode.signUpButton')}
            </Button>
            <button
              onClick={onDismiss}
              className="text-sm text-yellow-600 hover:text-yellow-500 underline"
            >
              {t('guestMode.dismissButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}