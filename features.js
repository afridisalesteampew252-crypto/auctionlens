// --- FEATURE: DOWNLOAD REPORT AS IMAGE WITH FIXES ---

document.getElementById('downloadBtn').addEventListener('click', async () => {
    const reportElement = document.getElementById('result');
    const downloadBtn = document.getElementById('downloadBtn');
    const whatsappBtn = document.getElementById('whatsappBtn');

    // 1. Prepare for Capture (Clean UI)
    downloadBtn.style.display = 'none';
    whatsappBtn.style.display = 'none';
    
    // Add temporary padding to ensure borders don't cut text
    reportElement.style.padding = "20px";

    try {
        const canvas = await html2canvas(reportElement, {
            backgroundColor: "#020617",
            scale: 3, // Ultra-High Quality for social media
            useCORS: true,
            logging: false,
            onclone: (clonedDoc) => {
                // Add a Watermark to the bottom of the cloned report
                const watermark = clonedDoc.createElement('div');
                watermark.innerHTML = "WWW.AUCTIONLENS.PK - AI VERIFIED";
                watermark.style.cssText = "text-align:center; color:#334155; font-size:10px; font-weight:bold; margin-top:20px; letter-spacing:2px;";
                clonedDoc.getElementById('result').appendChild(watermark);
            }
        });

        // 2. Download Logic
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        const chassis = document.getElementById('resChassis').innerText || "Report";
        
        link.href = image;
        link.download = `AuctionLens_Verified_${chassis}.png`;
        link.click();

    } catch (err) {
        alert("Capture Error. Please try again.");
    } finally {
        // 3. Reset UI
        reportElement.style.padding = "0px";
        downloadBtn.style.display = 'flex';
        whatsappBtn.style.display = 'flex';
    }
});
