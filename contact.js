import { showToast, validateInput } from './ui-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTS ---
    const btnScan = document.getElementById('navScanner');
    const btnCont = document.getElementById('navContact');
    const viewScan = document.getElementById('viewScanner');
    const viewCont = document.getElementById('viewContact');
    const leadForm = document.getElementById('leadForm');

    // --- NAVIGATION LOGIC ---
    if (btnScan && btnCont && viewScan && viewCont) {
        
        // Switch to Contact View
        btnCont.addEventListener('click', () => {
            viewScan.classList.add('hidden');
            viewCont.classList.remove('hidden');
            // Colors
            btnCont.classList.add('text-blue-500');
            btnCont.classList.remove('text-slate-500');
            btnScan.classList.remove('text-blue-500');
            btnScan.classList.add('text-slate-500');
        });

        // Switch back to Scanner View
        btnScan.addEventListener('click', () => {
            viewCont.classList.add('hidden');
            viewScan.classList.remove('hidden');
            // Colors
            btnScan.classList.add('text-blue-500');
            btnScan.classList.remove('text-slate-500');
            btnCont.classList.remove('text-blue-500');
            btnCont.classList.add('text-slate-500');
        });
    }

    // --- LEAD FORM LOGIC ---
    if (leadForm) {
        const inputs = leadForm.querySelectorAll('input, textarea');
        
        // Real-time validation feedback
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                validateInput(input);
            });
        });
        
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const leadName = document.getElementById('leadName');
            const leadPhone = document.getElementById('leadPhone');
            const leadMessage = document.getElementById('leadMessage');
            
            // Validate all inputs
            if (!validateInput(leadName) || !validateInput(leadPhone) || !validateInput(leadMessage)) {
                showToast('⚠️ Please fill in all fields', 'warning');
                return;
            }
            
            const name = leadName.value;
            const phone = leadPhone.value;
            const msg = leadMessage.value;
            
            // Your Number: 923318484115
            const myNumber = "923318484115"; 
            const text = `*NEW INQUIRY: AUCTIONLENS PK*%0A%0A` +
                         `*Name:* ${name}%0A` +
                         `*Phone:* ${phone}%0A` +
                         `*Interested In:* ${msg}`;
            
            window.open(`https://wa.me/${myNumber}?text=${text}`, '_blank');
            
            // Reset form
            leadForm.reset();
            showToast('✓ Inquiry sent! Check your WhatsApp.', 'success');
        });
    }
});
