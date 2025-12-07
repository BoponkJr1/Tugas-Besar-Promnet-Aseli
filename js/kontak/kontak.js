// ==========================================
// KRIUK KITA - KONTAK.JS
// JavaScript khusus untuk Halaman Kontak
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        // Validate phone number (basic)
        if (!validatePhone(phone)) {
            alert('Nomor telepon tidak valid. Harap masukkan nomor dengan format yang benar.');
            return;
        }

        // Simulate sending message
        const confirmMessage = `📧 KONFIRMASI PENGIRIMAN PESAN

Terima kasih, ${name}!

Pesan Anda telah diterima dengan detail:
───────────────────────────────
📝 Subjek: ${subject}
📧 Email: ${email}
📱 Telepon: ${phone}

Kami akan menghubungi Anda melalui email atau telepon dalam waktu 1x24 jam.

Terima kasih telah menghubungi Kriuk Kita! 🔥`;

        alert(confirmMessage);
        
        // Save to localStorage (optional - for demo purposes)
        saveContactMessage({
            name,
            email,
            phone,
            subject,
            message,
            timestamp: new Date().toISOString()
        });
        
        // Reset form
        contactForm.reset();
    });
});

// Validate phone number
function validatePhone(phone) {
    // Indonesian phone number format: starts with 08 or +62, 10-13 digits
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

// Save contact message to localStorage (for demo)
function saveContactMessage(messageData) {
    try {
        let messages = JSON.parse(localStorage.getItem('kriukKitaMessages') || '[]');
        messages.push(messageData);
        
        // Keep only last 10 messages
        if (messages.length > 10) {
            messages = messages.slice(-10);
        }
        
        localStorage.setItem('kriukKitaMessages', JSON.stringify(messages));
        console.log('Message saved successfully');
    } catch (error) {
        console.error('Error saving message:', error);
    }
}

// Get all saved messages (for admin view - optional)
function getSavedMessages() {
    return JSON.parse(localStorage.getItem('kriukKitaMessages') || '[]');
}