import { useEffect, useState } from "react"

export default function StocksPage() {
    const [symbol, setSymbol] = useState("AAPL")
    const [stockData, setStockData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    async function fetchStock() {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`/api/quote?symbol=${symbol}`)
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch")
            }

            setStockData(data)
        } catch (err) {
            setError(err.message)
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchStock()
    }, [])

    return (
        <div style={{ padding: "40px", fontFamily: "Arial" }}>
            <h1>📈 Stock Price Viewer</h1>

            <div style={{ marginBottom: "20px" }}>
                <input
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="Enter symbol (e.g. TSLA)"
                    style={{ padding: "8px", marginRight: "10px" }}
                />
                <button onClick={fetchStock}>Get Quote</button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {stockData && !loading && (
                <div>
                    <h2>{symbol}</h2>
                    <p>Current Price: ${stockData.c}</p>
                    <p>High: ${stockData.h}</p>
                    <p>Low: ${stockData.l}</p>
                    <p>Open: ${stockData.o}</p>
                    <p>Previous Close: ${stockData.pc}</p>
                </div>
            )}
        </div>
    )
}
