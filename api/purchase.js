export default async function handler(req, res) {
    // শুধুমাত্র POST রিকোয়েস্ট অ্যালাউ করা
    if (req.method !== 'POST') return res.status(405).send();

    const { gameId, fee, packageName, userName, matchId } = req.body;
    const SHEETDB_URL = "https://sheetdb.io/api/v1/d6fk2z82ifpco";

    // ইনপুট ভ্যালিডেশন
    if (!gameId || !fee || !matchId) {
        return res.status(400).json({ message: "প্রয়োজনীয় তথ্য (Match ID/Fee) পাওয়া যায়নি!" });
    }

    try {
        // ১. নিরাপত্তা চেক: ইউজার কি ইতিমধ্যে এই ম্যাচে জয়েন করেছে? (Match_ID দিয়ে চেক)
        // আমরা Match_ID এবং Game_ID দুইটাই চেক করছি যাতে ভুল হওয়ার সুযোগ না থাকে
        const orderCheckRes = await fetch(`${SHEETDB_URL}/search?sheet=Orders&Game_ID=${gameId}&Match_ID=${matchId}`);
        const existingOrders = await orderCheckRes.json();

        if (existingOrders.length > 0) {
            return res.status(400).json({ message: "আপনি ইতিমধ্যে এই টুর্নামেন্টে জয়েন করেছেন! ✅" });
        }

        // ২. ইউজারের বর্তমান কয়েন ডাটাবেস থেকে চেক করা
        const userRes = await fetch(`${SHEETDB_URL}/search?Game_ID=${gameId}`);
        const users = await userRes.json();
        
        if (users.length === 0) {
            return res.status(404).json({ message: "ইউজার পাওয়া যায়নি!" });
        }

        const user = users[0];
        const currentCoins = parseInt(user.Coins);

        if (currentCoins < fee) {
            return res.status(400).json({ message: "দুঃখিত! আপনার পর্যাপ্ত কয়েন নেই। 🪙" });
        }

        // ৩. নতুন ব্যালেন্স আপডেট করা
        const newBalance = currentCoins - fee;
        const updateRes = await fetch(`${SHEETDB_URL}/Game_ID/${gameId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "Coins": newBalance })
        });

        if (updateRes.ok) {
            // বাংলাদেশ সময় বের করা (GMT+6)
            const now = new Date();
            const bdTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (3600000 * 6)).toLocaleString('en-GB');

            // ৪. অর্ডার লিস্টে এন্ট্রি করা (Orders Sheet)
            // এখানে Match_ID কলামটি অবশ্যই আপনার শীটে থাকতে হবে
            await fetch(`${SHEETDB_URL}?sheet=Orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    \"User_Name\": userName,
                    \"Game_ID\": gameId,
                    \"Package\": packageName,
                    \"Match_ID\": matchId,
                    \"Time\": bdTime,
                    \"Status\": \"Success\"
                })
            });

            // ৫. ইনবক্সে মেসেজ পাঠানো (Notifications Sheet)
            await fetch(`${SHEETDB_URL}?sheet=Notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    \"Game_ID\": gameId,
                    \"Message\": `অভিনন্দন! আপনি সফলভাবে \"${packageName}\" (ID: ${matchId}) টুর্নামেন্টে জয়েন করেছেন।`,
                    \"Time\": bdTime,
                    \"Is_Read\": \"Unseen\"
                })
            });

            // সফল রেসপন্স
            return res.status(200).json({ success: true, newBalance: newBalance });
        } else {
            throw new Error(\"Balance Update Failed\");
        }

    } catch (error) {
        console.error(\"Purchase Error:\", error);
        return res.status(500).json({ message: \"সার্ভার সমস্যা! আবার চেষ্টা করুন।\" });
    }
}
