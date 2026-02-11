import { useEffect, useState } from "react"
import { ethers } from "ethers"

export default function PriceFeedPublic() {
    const [price, setPrice] = useState(null)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchPrice() {
            try {
                // 1️⃣ Connect to RPC (NO MetaMask needed)
                const provider = new ethers.providers.JsonRpcProvider(
                    process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER,
                )

                // 2️⃣ Price Feed Address
                const priceFeedAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306"

                // 3️⃣ Minimal ABI
                const abi = [
                    "function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)",
                ]

                // 4️⃣ Create contract instance
                const priceFeed = new ethers.Contract(priceFeedAddress, abi, provider)

                // 5️⃣ Call latestRoundData()
                const roundData = await priceFeed.latestRoundData()

                const rawPrice = roundData[1]
                const updatedAt = roundData[3]

                // 6️⃣ Format price (8 decimals for Chainlink)
                const formattedPrice = ethers.utils.formatUnits(rawPrice, 8)

                setPrice(formattedPrice)
                setLastUpdated(new Date(updatedAt.toNumber() * 1000))
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
