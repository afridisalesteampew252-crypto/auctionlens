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
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('leadName').value;
            const phone = document.getElementById('leadPhone').value;
            const msg = document.getElementById('leadMessage').value;
            
            // Your Number: 923318484115
            const myNumber = "923318484115"; 
            const text = `*NEW INQUIRY: AUCTIONLENS PK*%0A%0A` +
                         `*Name:* ${name}%0A` +
                         `*Phone:* ${phone}%0A` +
                         `*Interested In:* ${msg}`;
            
            window.open(`https://wa.me/${myNumber}?text=${text}`, '_blank');
        });
    }
});
