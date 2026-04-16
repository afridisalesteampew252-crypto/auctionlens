import { showToast, setButtonLoading, copyToClipboard, smoothScroll } from './ui-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTS ---
    const elements = {
        btnScan: document.getElementById('navScanner'),
        btnCont: document.getElementById('navContact'),
        viewScan: document.getElementById('viewScanner'),
        viewCont: document.getElementById('viewContact'),
        video: document.getElementById('video'),
        preview: document.getElementById('previewImg'),
        fileIn: document.getElementById('fileIn'),
        shutter: document.getElementById('shutter'),
        analyze: document.getElementById('analyze'),
        result: document.getElementById('result'),
        placeholder: document.getElementById('placeholderText'),
        leadForm: document.getElementById('leadForm')
    };

    let activeBase64 = null;
    const myNumber = "923318484115";

    // --- 1. NAVIGATION LOGIC ---
    elements.btnCont.addEventListener('click', () => {
        elements.viewScan.classList.add('hidden');
        elements.viewCont.classList.remove('hidden');
        elements.btnCont.classList.replace('text-slate-500', 'text-blue-500');
        elements.btnScan.classList.replace('text-blue-500', 'text-slate-500');
    });

    elements.btnScan.addEventListener('click', () => {
        elements.viewCont.classList.add('hidden');
        elements.viewScan.classList.remove('hidden');
        elements.btnScan.classList.replace('text-slate-500', 'text-blue-500');
        elements.btnCont.classList.replace('text-blue-500', 'text-slate-500');
    });

    // --- 2. IMAGE INPUT (CAMERA & GALLERY) ---
    document.getElementById('btnCam').addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            elements.video.srcObject = stream;
            elements.video.classList.remove('hidden');
            elements.shutter.classList.remove('hidden');
            elements.preview.classList.add('hidden');
            elements.placeholder.classList.add('hidden');
            elements.result.classList.add('hidden');
            showToast('📸 Camera ready - align auction sheet in frame', 'info');
        } catch (err) { 
            showToast('❌ Camera access denied. Try Gallery instead.', 'error', 4000);
        }
    });

    elements.shutter.addEventListener('click', () => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = elements.video.videoWidth; 
            canvas.height = elements.video.videoHeight;
            canvas.getContext('2d').drawImage(elements.video, 0, 0);
            activeBase64 = canvas.toDataURL('image/png').split(',')[1];
            elements.preview.src = canvas.toDataURL('image/png');
            elements.video.classList.add('hidden');
            elements.preview.classList.remove('hidden');
            elements.shutter.classList.add('hidden');
            elements.analyze.classList.remove('hidden');
            elements.video.srcObject.getTracks().forEach(t => t.stop());
            showToast('✓ Photo captured - ready to analyze', 'success');
        } catch (err) {
            showToast('❌ Failed to capture photo. Try again.', 'error');
        }
    });

    elements.fileIn.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('⚠️ Image too large (max 5MB)', 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (ev) => {
            activeBase64 = ev.target.result.split(',')[1];
            elements.preview.src = ev.target.result;
            elements.preview.classList.remove('hidden');
            elements.analyze.classList.remove('hidden');
            elements.placeholder.classList.add('hidden');
            elements.result.classList.add('hidden');
            showToast('✓ Image uploaded - ready to analyze', 'success');
        };
        reader.onerror = () => {
            showToast('❌ Failed to read file', 'error');
        };
        reader.readAsDataURL(file);
    });

    // --- 3. AI ANALYSIS ---
    elements.analyze.addEventListener('click', async () => {
        if (!activeBase64) {
            showToast('❌ No image selected', 'warning');
            return;
        }
        
        elements.result.classList.remove('hidden');
        smoothScroll(elements.result);
        setButtonLoading(elements.analyze, true, '⚡ Processing...');
        
        // Show loading skeleton
        document.getElementById('verdictBox').innerHTML = '<div class="animate-pulse h-8 bg-slate-700 rounded"></div>';
        
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: activeBase64, mimeType: "image/png" }),
                timeout: 30000
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `API Error: ${res.status}`);
            }
            
            const data = await res.json();
            if (!data.result) {
                throw new Error('No analysis result received');
            }
            
            const txt = data.result;
            const extract = (label) => {
                const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z\\s]+:|$)`, 'i');
                return txt.match(regex)?.[1]?.trim() || "Unable to detect";
            };

            // Fill expanded report
            document.getElementById('resVerdict').innerText = extract("VERDICT");
            document.getElementById('resYear').innerText = extract("YEAR");
            document.getElementById('resGrade').innerText = extract("GRADE");
            document.getElementById('resChassis').innerText = extract("CHASSIS");
            document.getElementById('resInterior').innerText = extract("INTERIOR");
            document.getElementById('resSummary').innerText = extract("SUMMARY");
            document.getElementById('resExterior').innerText = extract("EXTERIOR");

            // Style Verdict Box with colors
            const verdictText = txt.toUpperCase();
            let borderColor = 'border-slate-600';
            let bgColor = 'bg-slate-950';
            let textColor = 'text-slate-300';
            
            if (verdictText.includes("AVOID")) {
                borderColor = 'border-red-600';
                bgColor = 'bg-red-900/10';
                textColor = 'text-red-400';
            } else if (verdictText.includes("CAUTION")) {
                borderColor = 'border-yellow-600';
                bgColor = 'bg-yellow-900/10';
                textColor = 'text-yellow-400';
            } else if (verdictText.includes("BUY")) {
                borderColor = 'border-emerald-600';
                bgColor = 'bg-emerald-900/10';
                textColor = 'text-emerald-400';
            }
            
            document.getElementById('verdictBox').className = `p-4 rounded-xl border-2 ${borderColor} ${bgColor} ${textColor} text-center`;
            
            showToast('✓ Analysis complete!', 'success');
            smoothScroll(elements.result);
        } catch (err) { 
            console.error('Analysis error:', err);
            showToast(`❌ ${err.message || 'Analysis failed. Try a clearer image.'}`, 'error', 5000);
            document.getElementById('verdictBox').innerHTML = '<p class="text-red-400 font-bold">Analysis Failed</p>';
        } finally { 
            setButtonLoading(elements.analyze, false, '⚡ Process Sheet');
        }
    });

    // --- 4. COPY TO CLIPBOARD FOR CHASSIS ---
    document.getElementById('resChassis').addEventListener('click', function(e) {
        e.preventDefault();
        const chassisText = this.innerText;
        if (chassisText !== '-') {
            copyToClipboard(chassisText, this);
        }
    });

    // --- 5. WHATSAPP BUTTONS ---
    document.getElementById('whatsappBtn').addEventListener('click', () => {
        const year = document.getElementById('resYear').innerText;
        const grade = document.getElementById('resGrade').innerText;
        const chassis = document.getElementById('resChassis').innerText;
        const verdict = document.getElementById('resVerdict').innerText;
        
        const msg = `*Expert Review Request - AuctionLens PK*%0A%0A*Year:* ${year}%0A*Grade:* ${grade}%0A*Chassis:* ${chassis}%0A*Verdict:* ${verdict}%0A%0A💰 *Ready for Premium Analysis?*`;
        window.open(`https://wa.me/${myNumber}?text=${msg}`, '_blank');
        showToast('Opening WhatsApp...', 'info');
    });

    elements.leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('leadName').value.trim();
        const phone = document.getElementById('leadPhone').value.trim();
        const msg = document.getElementById('leadMessage').value.trim();
        
        if (!name || !phone || !msg) {
            showToast('⚠️ Please fill in all fields', 'warning');
            return;
        }
        
        const text = `*NEW INQUIRY: AUCTIONLENS PK*%0A%0A*Name:* ${name}%0A*Phone:* ${phone}%0A*Looking For:* ${msg}`;
        window.open(`https://wa.me/${myNumber}?text=${text}`, '_blank');
        
        // Reset form
        elements.leadForm.reset();
        showToast('✓ Inquiry sent! Check your WhatsApp.', 'success');
    });
});
