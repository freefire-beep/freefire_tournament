export default async function handler(req, res) {
    // শুধুমাত্র POST রিকোয়েস্ট অ্যালাউ করা
    if (req.method !== 'POST') return res.status(405).send();

    const { gameId, fee, packageName, userName } = req.body;
    const SHEETDB_URL = "https://sheetdb.io/api/v1/d6fk2z82ifpco";

    try {
        // ১. চেক করা: ইউজার কি ইতিমধ্যে এই প্যাকেজে জয়েন করেছে? (Duplicate Join Prevention)
        const orderCheckRes = await fetch(`${SHEETDB_URL}/search?sheet=Orders&Game_ID=${gameId}&Package=${packageName}`);
        const existingOrders = await orderCheckRes.json();

        if (existingOrders.length > 0) {
            return res.status(400).json({ message: "আপনি ইতিমধ্যে এই প্যাকেজে জয়েন করেছেন!" });
        }

        // ২. ইউজারের বর্তমান কয়েন ডাটাবেস থেকে চেক করা (নিরাপত্তা)
        const userRes = await fetch(`${SHEETDB_URL}/search?Game_ID=${gameId}`);
        const users = await userRes.json();
        
        if (users.length === 0) {
            return res.status(404).json({ message: "ইউজার পাওয়া যায়নি!" });
        }

        const user = users[0];
        const currentCoins = parseInt(user.Coins);

        if (currentCoins < fee) {
            return res.status(400).json({ message: "দুঃখিত! আপনার পর্যাপ্ত কয়েন নেই।" });
        }

        const newBalance = currentCoins - fee;

        // ৩. গুগল শীটে কয়েন আপডেট করা (Users Sheet)
        const updateRes = await fetch(`${SHEETDB_URL}/Game_ID/${gameId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "Coins": newBalance })
        });

        if (updateRes.ok) {
            // ৪. অর্ডার লিস্টে এন্ট্রি করা (Orders Sheet)
            await fetch(`${SHEETDB_URL}?sheet=Orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "User_Name": userName,
                    "Game_ID": gameId,
                    "Package": packageName,
                    "Time": new Date().toLocaleString(),
                    "Status": "Success"
                })
            });

            // ৫. ইনবক্সে মেসেজ পাঠানো (Notifications Sheet)
            await fetch(`${SHEETDB_URL}?sheet=Notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "Game_ID": gameId,
                    "Message": `অভিনন্দন! আপনি সফলভাবে ${packageName} প্যাকেজে জয়েন করেছেন।`,
                    "Time": new Date().toLocaleString(),
                    "Is_Read": "Unseen"
                })
            });

            // সফল হলে নতুন ব্যালেন্স ফ্রন্টএন্ডে পাঠানো (Real-time Update এর জন্য)
            return res.status(200).json({ success: true, newBalance: newBalance });
        } else {
            throw new Error("Update Failed");
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "ট্রানজেকশন প্রসেস করতে সমস্যা হয়েছে! ইন্টারনেট চেক করুন।" });
    }
    }
            
