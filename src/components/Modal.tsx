import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerActions?: React.ReactNode;
  maxWidth?: string;
  maxHeight?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  headerActions,
  maxWidth = '90vw',
  maxHeight = '80vh'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Focus trap - only for Tab navigation, not for regular typing
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    // Only auto-focus first element if no input is already focused
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
    if (!isInputFocused && firstElement) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        firstElement.focus();
      }, 0);
    }

    const handleTab = (e: KeyboardEvent) => {
      // Only handle Tab key, ignore all other keys
      if (e.key !== 'Tab') return;
      
      // Don't interfere if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        // Allow normal Tab behavior within inputs
        return;
      }

      // Only trap Tab navigation between focusable elements
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleTab);
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleTab);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/75 z-[9999] flex items-center justify-center p-4 animate-modalFadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full overflow-hidden flex flex-col animate-scaleIn h-[90vh] max-h-[90vh] md:h-auto"
        style={{ 
          maxWidth: isMobile ? '95vw' : maxWidth,
          maxHeight: isMobile ? '90vh' : maxHeight
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 id="modal-title" className="text-xl font-bold text-gray-900">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {headerActions}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white z-10">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;

