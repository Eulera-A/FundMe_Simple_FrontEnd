export default async function handler(req, res) {
    const { symbol } = req.query
    const apiKey = process.env.FINNHUB_API_KEY
    const url = `https://...&token=${apiKey}`

    try {
        const response = await fetch(url)
        const data = await response.json()
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ error: "Fail to fetch data" })
    }
}
