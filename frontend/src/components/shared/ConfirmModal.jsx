import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, LogOut, X } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  icon = 'alert', // 'trash' | 'logout' | 'alert'
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

  const isDanger = variant === 'danger';

  const renderIcon = () => {
    if (icon === 'trash') {
      return <Trash2 className={isDanger ? 'text-red-600' : 'text-amber-600'} size={24} />;
    }
    if (icon === 'logout') {
      return <LogOut className="text-amber-600" size={24} />;
    }
    return <AlertTriangle className={isDanger ? 'text-red-600' : 'text-amber-600'} size={24} />;
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div
          className={`h-1.5 w-full ${
            isDanger
              ? 'bg-gradient-to-r from-red-500 via-rose-500 to-red-600'
              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500'
          }`}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl shrink-0 ${
                isDanger ? 'bg-red-50 ring-1 ring-red-100' : 'bg-amber-50 ring-1 ring-amber-100'
              }`}
            >
              {renderIcon()}
            </div>
            <div className="flex-1 pr-6">
              <h3 className="font-serif text-lg font-bold text-slate-900 tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                isDanger
                  ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                  : 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950'
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
