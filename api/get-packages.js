export default async function handler(req, res) {
    // শুধুমাত্র GET রিকোয়েস্ট অ্যালাউ করা
    if (req.method !== 'GET') return res.status(405).send();

    const { gameId } = req.query;
    const SHEET_URL = "https://sheetdb.io/api/v1/3dn8ej3m7h685";

    if (!gameId) {
        return res.status(400).json({ error: "Game ID missing" });
    }

    try {
        // ১. 'Packages' নামক শীট থেকে সব প্যাকেজ এবং দাম নিয়ে আসা
        const pkgResponse = await fetch(`${SHEET_URL}?sheet=Packages`);
        const packages = await pkgResponse.json();

        // ২. 'Users' শীট থেকে ইউজারের লেটেস্ট কয়েন ব্যালেন্স আনা
        const userResponse = await fetch(`${SHEET_URL}/search?Game_ID=${gameId}`);
        const userData = await userResponse.json();
        const latestCoins = userData.length > 0 ? userData[0].Coins : 0;

        // ৩. 'Orders' শীট থেকে চেক করা ইউজার আগে থেকেই কোনগুলোতে জয়েন করেছে
        const orderResponse = await fetch(`${SHEET_URL}/search?sheet=Orders&Game_ID=${gameId}`);
        const orders = await orderResponse.json();
        
        // শুধুমাত্র সফলভাবে জয়েন হওয়া প্যাকেজের নামগুলো ফিল্টার করা
        const joinedPackageNames = orders.map(order => order.Package);

        // সব তথ্য একসাথে ফ্রন্টএন্ডে পাঠানো
        return res.status(200).json({
            packages: packages,         // প্যাকেজ লিস্ট
            coins: latestCoins,         // রিয়েল টাইম কয়েন
            joinedPackages: joinedPackageNames // জয়েন করা প্যাকেজের তালিকা
        });

    } catch (error) {
        console.error("Fetch Error:", error);
        return res.status(500).json({ error: "সার্ভার থেকে ডাটা আনতে সমস্যা হয়েছে" });
    }
                                     }
