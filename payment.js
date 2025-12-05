// Payment Form Handler
const API_BASE_URL = 'https://qr-ticket-system-7dcnjele7-ahmads-projects-d17500c2.vercel.app';
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const { data, error } = await supabaseClient
    .from('tickets')
    .insert([{
        full_name: formData.user.fullName,
        email: formData.user.email,
        phone: formData.user.phone,
        ticket_type: formData.ticket.type,
        price: formData.ticket.price,
        payment_method: formData.paymentMethod,
        event_name: formData.ticket.eventName,
        paid: false
    }]);

if (error) {
    console.log("Supabase Error:", error);
    alert("Error saving data: " + error.message);
    return;
}


// Handle ticket selection UI
document.querySelectorAll('.ticket-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.ticket-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        option.querySelector('input[type="radio"]').checked = true;
    });
});

// Handle payment method selection UI
document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', () => {
        document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
        method.classList.add('selected');
        method.querySelector('input[type="radio"]').checked = true;
    });
});

// Handle form submission
document.getElementById('ticketForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('payBtn');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    // Gather form data
    const formData = {
        user: {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value || null
        },
        ticket: {
            type: document.querySelector('input[name="ticketType"]:checked').value,
            price: parseFloat(document.querySelector('input[name="ticketType"]:checked').dataset.price),
            eventName: 'Epic College Party'
        },
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value
    };

    try {
        // Call payment simulation API
        const response = await fetch(`${API_BASE_URL}/api/payments/simulate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success && data.paymentUrl) {
            // Redirect to payment gateway (sandbox)
            window.location.href = data.paymentUrl;
        } else {
            throw new Error(data.error || 'Failed to initiate payment');
        }
    } catch (error) {
        console.error('Payment error:', error);
        alert('Failed to process payment: ' + error.message);
        btn.disabled = false;
        btn.textContent = '🎉 Pay Now & Get Your Ticket';
    }
});
