// Generate Icon on the fly
function generateIcon() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 512, 512);

    // Glow
    ctx.shadowBlur = 50;
    ctx.shadowColor = '#39ff14';

    // S Shape (Snake)
    ctx.strokeStyle = '#39ff14';
    ctx.lineWidth = 40;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(350, 150);
    ctx.lineTo(200, 150);
    ctx.bezierCurveTo(100, 150, 100, 250, 200, 250);
    ctx.lineTo(300, 250);
    ctx.bezierCurveTo(400, 250, 400, 350, 300, 350);
    ctx.lineTo(150, 350);
    ctx.stroke();

    // Convert to URL
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL();
    document.getElementsByTagName('head')[0].appendChild(link);

    // Also update manifest link if possible? 
    // Browsers cache manifest.json, so dynamic generation for PWA install icon is tricky without a real file.
    // For now, we will just use this for the favicon.
}

generateIcon();
