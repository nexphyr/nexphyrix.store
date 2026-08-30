import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolvePromise, setResolvePromise] = useState<(value: boolean) => void>();

  const confirm = (msg: string, opts?: ConfirmOptions): Promise<boolean> => {
    setMessage(msg);
    setOptions(opts || {});
    setIsOpen(true);
    
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    if (resolvePromise) resolvePromise(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolvePromise) resolvePromise(false);
    setIsOpen(false);
  };

  const isDanger = options.type === 'danger';

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDanger ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {options.title || 'Konfirmasi'}
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                {message}
              </p>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-xl transition-colors"
                >
                  {options.cancelText || 'Batal'}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-1 px-4 py-2 text-white text-sm font-bold rounded-xl shadow-sm transition-colors ${
                    isDanger 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  {options.confirmText || 'Ya, Lanjutkan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
