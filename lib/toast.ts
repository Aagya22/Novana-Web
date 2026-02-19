// Simple toast utility functions
export const showToast = (
  message: string,
  type: 'success' | 'error' | 'info' = 'info',
  position: 'top' | 'bottom' = 'top'
) => {
  if (typeof window !== 'undefined') {
    // Try to use react-hot-toast if available, fallback to custom implementation
    if ((window as any).showReactToast) {
      (window as any).showReactToast(message, type);
      return;
    }

    // Custom toast implementation
    const toast = document.createElement('div');
    toast.textContent = message;

    const hiddenTransform = position === 'bottom' ? 'translateY(120%)' : 'translateY(-120%)';
    toast.style.cssText = `
      position: fixed;
      right: 20px;
      ${position === 'bottom' ? 'bottom: 20px;' : 'top: 20px;'}
      padding: 12px 24px;
      border-radius: 8px;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: ${hiddenTransform};
      transition: transform 0.3s ease;
      max-width: 350px;
      word-wrap: break-word;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `;
    
    document.body.appendChild(toast);
    
    // Trigger slide in
    setTimeout(() => {
      toast.style.transform = 'translateY(0)';
    }, 100);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.style.transform = hiddenTransform;
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, 300);
    }, 4000);
  }
};

// Global setup function
export const setupGlobalToast = () => {
  if (typeof window !== 'undefined') {
    (window as any).showToast = showToast;
  }
};