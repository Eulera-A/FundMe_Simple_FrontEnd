import { ethers } from "ethers"

export default async function handler(req, res) {
    try {
        // 1️⃣ Secure RPC (server-side only)
        const provider = new ethers.providers.JsonRpcProvider(process.env.JSON_RPC_PROVIDER)

        // 2️⃣ ETH / USD Sepolia Price Feed
        const priceFeedAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306"

        const abi = [
            "function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)",
        ]

        const priceFeed = new ethers.Contract(priceFeedAddress, abi, provider)

        const roundData = await priceFeed.latestRoundData()

        const rawPrice = roundData[1]
        const updatedAt = roundData[3]

        const formattedPrice = ethers.utils.formatUnits(rawPrice, 8)

        res.status(200).json({
            price: formattedPrice,
            updatedAt: updatedAt.toString(),
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to fetch Chainlink price" })
    }
}
