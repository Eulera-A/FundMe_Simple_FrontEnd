import { ethers } from "ethers"
import { abi } from "../../constants/constants_Sepolia"
import contractAddresses from "../../constants/contractAddresses.json"

let cache = {
    data: null,
    timestamp: 0,
}

const CACHE_DURATION = 10000 // 10 seconds

export default async function handler(req, res) {
    try {
        const now = Date.now()

        // ✅ Return cached response if fresh
        if (cache.data && now - cache.timestamp < CACHE_DURATION) {
            return res.status(200).json(cache.data)
        }

        const provider = new ethers.providers.JsonRpcProvider(process.env.JSON_RPC_PROVIDER)

        const network = await provider.getNetwork()
        const contractAddress = contractAddresses[network.chainId]?.[0]

        if (!contractAddress) {
            return res.status(400).json({ error: "Contract not deployed" })
        }

        const contract = new ethers.Contract(contractAddress, abi, provider)

        const balance = await provider.getBalance(contractAddress)
        const timeLeft = await contract.timeLeft()

        const responseData = {
            address: contractAddress,
            balance: ethers.utils.formatEther(balance),
            timeLeft: timeLeft.toString(),
        }

        // ✅ Save to cache
        cache = {
            data: responseData,
            timestamp: now,
        }

        res.status(200).json(responseData)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to read contract" })
    }
}
