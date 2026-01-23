export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send();

    const { gameId, fee, packageName, userName } = req.body;
    const SHEETDB_URL = "https://sheetdb.io/api/v1/3dn8ej3m7h685";

    try {
        // ১. সার্ভার সাইড থেকে পুনরায় ইউজারের বর্তমান কয়েন চেক (নিরাপত্তার জন্য)
        const userRes = await fetch(`${SHEETDB_URL}/search?Game_ID=${gameId}`);
        const users = await userRes.json();
        const user = users[0];

        if (!user || parseInt(user.Coins) < fee) {
            return res.status(400).json({ message: "পর্যাপ্ত কয়েন নেই!" });
        }

        const newBalance = parseInt(user.Coins) - fee;

        // ২. কয়েন আপডেট করা (Users Sheet)
        const updateRes = await fetch(`${SHEETDB_URL}/Game_ID/${gameId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "Coins": newBalance })
        });

        if (!updateRes.ok) throw new Error("Coin update failed");

        // ৩. অর্ডার লিস্টে এন্ট্রি করা (Orders Sheet)
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

        // ৪. ইনবক্সে মেসেজ পাঠানো (Notifications Sheet)
        await fetch(`${SHEETDB_URL}?sheet=Notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "Game_ID": gameId,
                "Message": `আপনি সফলভাবে ${packageName} প্যাকেজটি কিনেছেন।`,
                "Time": new Date().toLocaleTimeString(),
                "Is_Read": "Unseen"
            })
        });

        return res.status(200).json({ message: "Purchase successful", newBalance });

    } catch (error) {
        console.error(error);
        // এখানে আপনি চাইলে একটি 'Rollback' লজিক যোগ করতে পারেন যদি কয়েন কাটার পর অর্ডার ফেইল হয়
        return res.status(500).json({ message: "ট্রানজেকশন সম্পন্ন হয়নি। পরে চেষ্টা করুন।" });
    }
              }
              
