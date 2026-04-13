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
        } catch (err) { alert("Camera access denied."); }
    });

    elements.shutter.addEventListener('click', () => {
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
    });

    elements.fileIn.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            activeBase64 = ev.target.result.split(',')[1];
            elements.preview.src = ev.target.result;
            elements.preview.classList.remove('hidden');
            elements.analyze.classList.remove('hidden');
            elements.placeholder.classList.add('hidden');
            elements.result.classList.add('hidden');
        };
        reader.readAsDataURL(e.target.files[0]);
    });

    // --- 3. AI ANALYSIS ---
    elements.analyze.addEventListener('click', async () => {
        elements.analyze.innerText = "PROCESSING...";
        elements.analyze.disabled = true;
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: activeBase64, mimeType: "image/png" })
            });
            const data = await res.json();
            if (res.ok) {
                const txt = data.result;
                const extract = (label) => {
                    const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z\\s]+:|$)`, 'i');
                    return txt.match(regex)?.[1]?.trim() || "-";
                };

                // Fill expanded report
                document.getElementById('resVerdict').innerText = extract("VERDICT");
                document.getElementById('resYear').innerText = extract("YEAR");
                document.getElementById('resGrade').innerText = extract("GRADE");
                document.getElementById('resChassis').innerText = extract("CHASSIS");
                document.getElementById('resInterior').innerText = extract("INTERIOR");
                document.getElementById('resSummary').innerText = extract("SUMMARY");

                // Style Verdict Box
                const isBad = txt.toUpperCase().includes("AVOID");
                document.getElementById('verdictBox').className = isBad ? 
                    "p-4 rounded-xl border-2 border-red-600 bg-red-900/10 text-red-500 text-center" : 
                    "p-4 rounded-xl border-2 border-emerald-600 bg-emerald-900/10 text-emerald-500 text-center";

                elements.result.classList.remove('hidden');
                window.scrollTo({ top: elements.result.offsetTop, behavior: 'smooth' });
            }
        } catch (err) { alert("AI Error. Try again."); }
        finally { elements.analyze.innerText = "PROCESS SHEET"; elements.analyze.disabled = false; }
    });

    // --- 4. WHATSAPP BUTTONS ---
    document.getElementById('whatsappBtn').addEventListener('click', () => {
        const msg = `*Expert Review Request*%0A*Year:* ${document.getElementById('resYear').innerText}%0A*Grade:* ${document.getElementById('resGrade').innerText}%0A*Chassis:* ${document.getElementById('resChassis').innerText}`;
        window.open(`https://wa.me/${myNumber}?text=${msg}`, '_blank');
    });

    elements.leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = `*New Lead*%0A*Name:* ${document.getElementById('leadName').value}%0A*Car:* ${document.getElementById('leadMessage').value}`;
        window.open(`https://wa.me/${myNumber}?text=${text}`, '_blank');
    });
});
