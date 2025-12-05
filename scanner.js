// QR Scanner Handler
const API_BASE_URL = 'https://qr-ticket-system-7dcnjele7-ahmads-projects-d17500c2.vercel.app';

let html5QrCode;
let isScanning = true;

function onScanSuccess(decodedText, decodedResult) {
    if (!isScanning) return;
    
    isScanning = false;
    
    // Stop scanner
    html5QrCode.stop().then(() => {
        validateQR(decodedText);
    }).catch(err => {
        console.error('Failed to stop scanner:', err);
        validateQR(decodedText);
    });
}

function onScanFailure(error) {
    // Silent fail - this fires frequently while scanning
}

async function validateQR(qrData) {
    // Show loading state
    const scanResult = document.getElementById('scanResult');
    scanResult.style.display = 'block';
    scanResult.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Validating ticket...</p>
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE_URL}/api/qr/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ qrData })
        });

        const data = await response.json();

        if (data.valid) {
            showSuccess(data);
        } else {
            showError(data);
        }
    } catch (error) {
        console.error('Validation error:', error);
        showError({ 
            error: 'System Error', 
            message: 'Failed to validate ticket. Please try again.' 
        });
    }
}

function showSuccess(data) {
    const scanResult = document.getElementById('scanResult');
    scanResult.innerHTML = `
        <div class="scan-result success">
            <div class="icon">✅</div>
            <h2>ENTRY GRANTED</h2>
            <p><strong>${data.message}</strong></p>
            
            <div class="holder-info">
                <div class="holder-info-row">
                    <span><strong>Name:</strong></span>
                    <span>${data.ticket.holder.name}</span>
                </div>
                <div class="holder-info-row">
                    <span><strong>Ticket Type:</strong></span>
                    <span>${data.ticket.ticketType.toUpperCase()}</span>
                </div>
                <div class="holder-info-row">
                    <span><strong>Price:</strong></span>
                    <span>${data.ticket.price} EGP</span>
                </div>
                <div class="holder-info-row">
                    <span><strong>Email:</strong></span>
                    <span>${data.ticket.holder.email}</span>
                </div>
                <div class="holder-info-row">
                    <span><strong>Scanned At:</strong></span>
                    <span>${new Date(data.scannedAt).toLocaleString()}</span>
                </div>
            </div>
        </div>
    `;

    document.getElementById('resetBtn').style.display = 'block';
}

function showError(data) {
    const scanResult = document.getElementById('scanResult');
    scanResult.innerHTML = `
        <div class="scan-result error">
            <div class="icon">❌</div>
            <h2>ENTRY DENIED</h2>
            <p><strong>${data.error || 'Invalid Ticket'}</strong></p>
            <p>${data.message}</p>
            ${data.usedAt ? `<p><small>Previously scanned: ${new Date(data.usedAt).toLocaleString()}</small></p>` : ''}
        </div>
    `;

    document.getElementById('resetBtn').style.display = 'block';
}

// Initialize scanner
window.addEventListener('DOMContentLoaded', () => {
    html5QrCode = new Html5Qrcode("qr-reader");
    
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };

    html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        config,
        onScanSuccess,
        onScanFailure
    ).catch(err => {
        console.error('Failed to start scanner:', err);
        document.getElementById('scanResult').innerHTML = `
            <div class="alert alert-error">
                <strong>Camera Error:</strong> ${err.message || 'Failed to access camera. Please grant camera permissions.'}
            </div>
        `;
    });
});
