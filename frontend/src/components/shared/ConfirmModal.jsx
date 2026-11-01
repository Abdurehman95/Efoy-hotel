import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, LogOut, X } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Logout',
  message = 'Are you sure you want to end your current session and sign out of the portal?',
  confirmText = 'Yes, Log Out',
  cancelText = 'Cancel',
  variant = 'gold', // 'gold' | 'danger' | 'warning' | 'info'
  icon = 'logout', // 'logout' | 'trash' | 'alert'
  isLoading = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLogout = icon === 'logout' || variant === 'gold';
  const isDanger = variant === 'danger' && !isLogout;

  const renderIcon = () => {
    if (icon === 'trash') {
      return <Trash2 className="text-red-600" size={24} />;
    }
    if (icon === 'logout' || isLogout) {
      return <LogOut className="text-[#b8904a]" size={24} />;
    }
    return <AlertTriangle className={isDanger ? 'text-red-600' : 'text-amber-600'} size={24} />;
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-dark-900/75 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[480px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100/80 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold / Accent Bar */}
        <div
          className={`h-2 w-full ${
            isDanger
              ? 'bg-gradient-to-r from-red-500 via-rose-500 to-red-600'
              : 'bg-[#cda25b]'
          }`}
        />

        {/* Close 'X' Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-dark-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8 pt-7">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Squircle Icon Badge */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                isDanger
                  ? 'bg-red-50 border border-red-100'
                  : 'bg-[#faf6ee] border border-[#f0e6d2]'
              }`}
            >
              {renderIcon()}
            </div>

            {/* Title & Message */}
            <div className="flex-1 pr-6">
              <h3 className="font-serif text-2xl font-bold text-dark-900 tracking-tight leading-snug">
                {title}
              </h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Divider & Action Buttons */}
          <div className="mt-7 pt-5 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-dark-900 transition-colors cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-6 py-2.5 text-sm font-medium text-white rounded-xl transition-all cursor-pointer disabled:opacity-50 ${
                isDanger
                  ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-md shadow-red-600/20'
                  : 'bg-[#cda25b] hover:bg-[#bd934a] active:bg-[#aa8139] shadow-md shadow-[#cda25b]/25'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
