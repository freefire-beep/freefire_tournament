// api/mark-read.js
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send();

    const { gameId } = req.body;
    const SHEET_URL = "https://sheetdb.io/api/v1/3dn8ej3m7h685";

    try {
        const response = await fetch(`${SHEET_URL}/all?sheet=Notifications&Game_ID=${gameId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "Is_Read": "Seen" })
        });

        if (response.ok) {
            return res.status(200).json({ success: true });
        } else {
            throw new Error("Update failed");
        }
    } catch (error) {
        return res.status(500).json({ error: "Server Error" });
    }
}
