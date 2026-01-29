/**
 * Z-PRO Tournament Global Configuration
 * এখানে একবার এপিআই লিঙ্ক বসালে পুরো প্রোজেক্টে কাজ করবে।
 */

// আপনার Vercel বা Google Apps Script-এর মেইন URL এখানে দিন
// ফোল্ডার পাথ অনুযায়ী 'zapi' ব্যবহার করা হয়েছে
const Z_API_BASE_URL = "https://script.google.com/macros/s/AKfycbzZS_WYwxxOrwu0HX5mYOZ-5wbhO6c7WAmodoPD2ccvCIy5arRfyHgK4h5oVT9gOLkl/exec/zapi";

const CONFIG = {
    PROJECT_NAME: "Z-PRO Tournament",
    TIMEZONE: "Asia/Dhaka",
    CURRENCY_SYMBOL: "🪙",
    Taka_SYMBOL: "৳",
    
    // লোকাল স্টোরেজ কী (ডেটা সেভ রাখার জন্য)
    STORAGE_KEY: "zuser",
    
    saveUser: (data) => {
        localStorage.setItem("zuser", JSON.stringify(data));
    },
    
    logout: () => {
        localStorage.removeItem("zuser");
        window.location.href = "zlogin.html";
    },

    isValidPin: (pin) => {
        return /^\d{4}$/.test(pin);
    }
};

// গ্লোবাল এপিআই কল ফাংশন যা সব ফাইলে ব্যবহার হবে
async function callZAPI(endpoint, options = {}) {
    const url = `${Z_API_BASE_URL}/${endpoint}`;
    try {
        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: options.body ? JSON.stringify(options.body) : null
        });
        return await response.json();
    } catch (error) {
        console.error(`Error in [${endpoint}]:`, error);
        return { status: 'error', message: 'সার্ভারের সাথে কানেক্ট করা যাচ্ছে না' };
    }
  }
          
