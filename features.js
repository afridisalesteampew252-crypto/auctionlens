import { showToast } from './ui-utils.js';

// --- FEATURE: DOWNLOAD REPORT AS IMAGE WITH IMPROVEMENTS ---

// Import html2canvas dynamically if needed
async function loadHtml2Canvas() {
    if (!window.html2canvas) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        document.head.appendChild(script);
        return new Promise(resolve => script.onload = resolve);
    }
}

document.getElementById('downloadBtn')?.addEventListener('click', async () => {
    const reportElement = document.getElementById('result');
    const downloadBtn = document.getElementById('downloadBtn');
    const whatsappBtn = document.getElementById('whatsappBtn');

    if (!reportElement) {
        showToast('❌ No report to download', 'error');
        return;
    }

    try {
        // Load html2canvas if not already loaded
        await loadHtml2Canvas();

        // 1. Prepare for Capture (Clean UI)
        downloadBtn.style.display = 'none';
        whatsappBtn.style.display = 'none';
        reportElement.style.padding = "20px";

        showToast('📸 Generating report...', 'info');

        const canvas = await html2canvas(reportElement, {
            backgroundColor: "#020617",
            scale: 3, // Ultra-High Quality for social media
            useCORS: true,
            logging: false,
            onclone: (clonedDoc) => {
                // Add a Watermark to the bottom of the cloned report
                const watermark = clonedDoc.createElement('div');
                watermark.innerHTML = "✓ WWW.AUCTIONLENS.PK - AI VERIFIED";
                watermark.style.cssText = "text-align:center; color:#334155; font-size:10px; font-weight:bold; margin-top:20px; letter-spacing:2px;";
                clonedDoc.getElementById('result').appendChild(watermark);
            }
        });

        // 2. Download Logic
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        const chassis = document.getElementById('resChassis')?.innerText || "Report";
        const timestamp = new Date().toISOString().slice(0, 10);
        
        link.href = image;
        link.download = `AuctionLens_${chassis}_${timestamp}.png`;
        link.click();
        
        showToast('✓ Report downloaded!', 'success');

    } catch (err) {
        console.error('Download error:', err);
        showToast('❌ Failed to generate report. Try again.', 'error', 4000);
    } finally {
        // 3. Reset UI
        reportElement.style.padding = "24px";
        if (downloadBtn) downloadBtn.style.display = 'flex';
        if (whatsappBtn) whatsappBtn.style.display = 'flex';
    }
});
