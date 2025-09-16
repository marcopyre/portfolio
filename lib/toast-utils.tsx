import React from 'react';
import toast from 'react-hot-toast';

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#FCA311',
      color: '#2b2928',
      borderRadius: '12px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
    },
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
    style: {
      background: '#ef4444',
      color: '#ffffff',
      borderRadius: '12px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
    },
  });
};

export const showActionToast = (
  message: string, 
  action: () => void, 
  actionLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  confirmationMessage = 'Action confirmée'
) => {
  toast(
    (t) => (
      <div className="flex items-center gap-3">
        <span className="flex-1">{message}</span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              action();
              toast.dismiss(t.id);
              showSuccessToast(confirmationMessage);
            }}
            className="bg-[#FCA311] text-[#2b2928] px-3 py-1 rounded-lg text-sm font-medium hover:bg-[#FCA311]/90 transition-colors"
          >
            {actionLabel}
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    ),
    {
      duration: 8000,
      position: 'top-right',
      style: {
        background: '#4c4947',
        color: '#EEF0F2',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '14px',
        maxWidth: '500px',
        border: '1px solid rgba(238, 240, 242, 0.1)',
      },
    }
  );
};