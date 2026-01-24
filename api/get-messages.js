export default async function handler(req, res) {
    // শুধুমাত্র POST রিকোয়েস্ট অ্যালাউ করা
    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { gameId } = req.body;
    const SHEET_URL = "https://sheetdb.io/api/v1/3dn8ej3m7h685";

    // Game ID না থাকলে এরর পাঠানো
    if (!gameId) {
        return res.status(400).json({ error: "Game ID missing" });
    }

    try {
        /* SheetDB-তে নির্দিষ্ট কলাম (Game_ID) অনুযায়ী সব মেসেজ 
           একসাথে আপডেট করার জন্য এই ইউআরএল ফরম্যাট ব্যবহার করা হয়।
           এটি 'Notifications' শীটে গিয়ে ওই Game_ID এর সব মেসেজকে 'Seen' করে দেবে।
        */
        const response = await fetch(`${SHEET_URL}/Game_ID/${gameId}?sheet=Notifications`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                "Is_Read": "Seen" 
            })
        });

        const result = await response.json();

        if (response.ok) {
            return res.status(200).json({ 
                success: true, 
                message: "Messages marked as seen",
                affected_rows: result.affected 
            });
        } else {
            console.error("SheetDB Error:", result);
            return res.status(500).json({ error: "Failed to update database" });
        }

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
