import { ethers } from "ethers"
import { abi } from "../../constants/constants_Sepolia"
import contractAddresses from "../../constants/contractAddresses.json"

export default async function handler(req, res) {
    try {
        const provider = new ethers.providers.JsonRpcProvider(process.env.JSON_RPC_PROVIDER)

        const network = await provider.getNetwork()
        const contractAddress = contractAddresses[network.chainId]?.[0]

        if (!contractAddress) {
            return res.status(400).json({ error: "Contract not deployed on this network" })
        }

        const contract = new ethers.Contract(contractAddress, abi, provider)

        const balance = await provider.getBalance(contractAddress)
        const timeLeft = await contract.timeLeft()

        res.status(200).json({
            address: contractAddress,
            balance: ethers.utils.formatEther(balance),
            timeLeft: timeLeft.toString(),
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to read FundMe contract" })
    }
}
