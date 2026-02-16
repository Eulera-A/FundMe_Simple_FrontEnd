import { useEffect, useState } from "react"

export default function PriceFeedPublic() {
    const [price, setPrice] = useState(null)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchPrice() {
            try {
                const response = await fetch("/api/chainlink_api")
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error)
                }

                setPrice(data.price)
                setLastUpdated(new Date(parseInt(data.updatedAt) * 1000))
            } catch (err) {
                console.error(err)
                setError("Failed to fetch price data")
            }
        }

        fetchPrice()
    }, [])

    return (
        <div style={{ padding: "40px", fontFamily: "Arial" }}>
            <h1>ETH / USD Price (Chainlink)</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {price ? (
                <div>
                    <h2>${price}</h2>
                    <p>Last Updated: {lastUpdated?.toLocaleString()}</p>
                </div>
            ) : (
                <p>Loading price...</p>
            )}
        </div>
    )
}
