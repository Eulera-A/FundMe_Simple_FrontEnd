export default async function handler(req, res) {
    const { symbol } = req.query
    const apiKey = process.env.FINNHUB_API_KEY

    if (!symbol) {
        return res.status(400).json({ error: "Symbol is required" })
    }

    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`

    try {
        const response = await fetch(url)
        const data = await response.json()

        if (!response.ok) {
            return res.status(500).json({ error: "Finnhub error", details: data })
        }

        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data" })
    }
}
