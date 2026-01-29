// zsync.js - ব্যালেন্স এবং নোটিফিকেশন আপডেট রাখার জন্য
async function syncUserData() {
    const username = localStorage.getItem('username');
    if (!username) return;

    try {
        const response = await fetch(`${CONFIG.API_URL}`, {
            method: 'POST',
            body: JSON.stringify({
                action: 'sync',
                username: username
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            // ১. কয়েন আপডেট
            const coinElement = document.getElementById('user-coins');
            if (coinElement) coinElement.innerText = data.coins;

            // ২. ইনবক্স লাল ডট (Unread count)
            const dot = document.getElementById('inbox-dot');
            if (dot) {
                if (data.unreadCount > 0) {
                    dot.style.display = 'block';
                    dot.innerText = data.unreadCount;
                } else {
                    dot.style.display = 'none';
                }
            }
        }
    } catch (error) {
        console.error("সিঙ্ক এরর:", error);
    }
}

// প্রতি ১০ সেকেন্ড পর পর সিঙ্ক হবে (CONFIG.SYNC_INTERVAL অনুযায়ী)
setInterval(syncUserData, CONFIG.SYNC_INTERVAL || 10000);

// পেজ লোড হওয়ার সাথে সাথেই একবার সিঙ্ক হবে
document.addEventListener('DOMContentLoaded', syncUserData);

