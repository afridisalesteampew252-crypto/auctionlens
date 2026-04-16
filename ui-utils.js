// --- UI UTILITIES FOR ENHANCED UX ---

// Toast Notification System
export function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    const bgColor = {
        'success': 'bg-emerald-500',
        'error': 'bg-red-500',
        'warning': 'bg-yellow-500',
        'info': 'bg-blue-500'
    }[type] || 'bg-blue-500';
    
    toast.className = `${bgColor} text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg animate-slide-in`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('animate-slide-out');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'fixed top-4 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
    return container;
}

// Loading Spinner
export function showLoadingSpinner(element, message = 'Processing...') {
    element.innerHTML = `
        <div class="flex flex-col items-center justify-center gap-3 py-8">
            <div class="w-10 h-10 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
            <p class="text-sm font-bold text-slate-400">${message}</p>
        </div>
    `;
}

// Skeleton Loader
export function showSkeleton(element) {
    element.innerHTML = `
        <div class="space-y-4 animate-pulse">
            <div class="h-8 bg-slate-800 rounded-lg"></div>
            <div class="grid grid-cols-3 gap-2">
                <div class="h-12 bg-slate-800 rounded-lg"></div>
                <div class="h-12 bg-slate-800 rounded-lg"></div>
                <div class="h-12 bg-slate-800 rounded-lg"></div>
            </div>
            <div class="h-20 bg-slate-800 rounded-lg"></div>
        </div>
    `;
}

// Disable Button with Loading State
export function setButtonLoading(button, isLoading, originalText = '') {
    if (isLoading) {
        button.disabled = true;
        button.classList.add('opacity-50');
        button.innerHTML = `
            <span class="inline-flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>${originalText}</span>
            </span>
        `;
    } else {
        button.disabled = false;
        button.classList.remove('opacity-50');
        button.textContent = originalText;
    }
}

// Copy to Clipboard
export function copyToClipboard(text, element) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = element.textContent;
        element.textContent = '✓ Copied!';
        element.classList.add('text-emerald-400');
        setTimeout(() => {
            element.textContent = originalText;
            element.classList.remove('text-emerald-400');
        }, 2000);
    });
}

// Form Validation Feedback
export function validateInput(input) {
    if (!input.value.trim()) {
        input.classList.remove('border-slate-800');
        input.classList.add('border-red-500', 'border-2');
        return false;
    }
    input.classList.remove('border-red-500', 'border-2');
    input.classList.add('border-slate-800');
    return true;
}

// Smooth Scroll
export function smoothScroll(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Add Styles for Animations
export function injectAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(-100%);
                opacity: 0;
            }
        }
        .animate-slide-in {
            animation: slideIn 0.3s ease-out;
        }
        .animate-slide-out {
            animation: slideOut 0.3s ease-out;
        }
        .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    `;
    document.head.appendChild(style);
}
