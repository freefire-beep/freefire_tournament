// Global Configuration for Tournament App
const CONFIG = {
    // আপনার গুগল অ্যাপস স্ক্রিপ্ট বা ভার্সেল এপিআই ইউআরএল এখানে দিন
    API_URL: "Https://script.google.com/macros/s/AKfycbzZS_WYwxxOrwu0HX5mYOZ-5wbhO6c7WAmodoPD2ccvCIy5arRfyHgK4h5oVT9gOLkl/exec", 
    
    // ওয়েবসাইট সেটিংস
    APP_NAME: "টুর্নামেন্ট প্রো",
    CURRENCY_SYMBOL: "৳", // কয়েন বা টাকা বোঝাতে
    TIMEZONE: "Asia/Dhaka",
    
    // রিফ্রেশ রেট (মিলি সেকেন্ডে)
    SYNC_INTERVAL: 10000, // ১০ সেকেন্ড পর পর কয়েন ও ডাটা সিঙ্ক হবে
};

// গ্লোবাল ফাংশন: সময় ফরম্যাট (বাংলাদেশি ফরম্যাট)
function formatBDTime(dateString) {
    const options = { 
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true 
    };
    return new Date(dateString).toLocaleString('bn-BD', options);
}
