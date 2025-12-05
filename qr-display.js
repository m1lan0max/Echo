// QR Display Page Handler
const API_BASE_URL = 'https://qr-ticket-system-7dcnjele7-ahmads-projects-d17500c2.vercel.app';

// Get transaction ID from URL
const urlParams = new URLSearchParams(window.location.search);
const transactionId = urlParams.get('txn');

if (!transactionId) {
    showError('Invalid ticket link');
} else {
    loadTicket();
}

async function loadTicket() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/success?transactionId=${transactionId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to load ticket');
        }

        if (data.success && data.ticket) {
            displayTicket(data.ticket);
        } else {
            throw new Error('Ticket not found');
        }
    } catch (error) {
        console.error('Load ticket error:', error);
        showError(error.message);
    }
}

function displayTicket(ticket) {
    // Hide loading
    document.getElementById('loadingDiv').style.display = 'none';
    document.getElementById('ticketContent').style.display = 'block';

    // Display ticket info
    document.getElementById('ticketType').textContent = ticket.ticketType.toUpperCase();
    document.getElementById('amountPaid').textContent = `${ticket.price} EGP`;
    document.getElementById('userEmail').textContent = ticket.user.email;
    document.getElementById('transactionId').textContent = ticket.transactionId;

    // Display QR code
    if (ticket.qrCode && ticket.qrCode.qr_image_url) {
        document.getElementById('qrCodeImage').src = ticket.qrCode.qr_image_url;

        // Show regenerate button only if not used and regeneration available
        if (!ticket.qrCode.is_used && ticket.qrCode.regeneration_count < 1) {
            const regenerateBtn = document.getElementById('regenerateBtn');
            regenerateBtn.style.display = 'block';
            regenerateBtn.addEventListener('click', regenerateQR);
        }
    } else {
        // QR not generated yet, show error with regenerate option
        showError('QR code not found. Please try regenerating.');
        document.getElementById('regenerateBtn').style.display = 'block';
        document.getElementById('regenerateBtn').addEventListener('click', regenerateQR);
    }
}

async function regenerateQR() {
    const btn = document.getElementById('regenerateBtn');
    btn.disabled = true;
    btn.textContent = 'Regenerating...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/qr/regenerate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ transactionId })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to regenerate QR');
        }

        if (data.success && data.qrCode) {
            // Update QR code image
            document.getElementById('qrCodeImage').src = data.qrCode.qrImageUrl;
            
            // Hide regenerate button (used up the one-time regeneration)
            btn.style.display = 'none';

            // Show success message
            alert('✓ QR Code regenerated successfully!');
        } else {
            throw new Error('Failed to regenerate QR');
        }
    } catch (error) {
        console.error('Regenerate error:', error);
        alert('Failed to regenerate QR: ' + error.message);
        btn.disabled = false;
        btn.textContent = '🔄 Regenerate QR Code (One-time only)';
    }
}

function showError(message) {
    document.getElementById('loadingDiv').style.display = 'none';
    document.getElementById('ticketContent').style.display = 'none';
    document.getElementById('errorDiv').style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
}
