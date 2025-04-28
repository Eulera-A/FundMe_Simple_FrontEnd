// the function to fund the contract
import { useWeb3Contract } from "react-moralis"
import { abi, contractAddress } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { useNotification } from "web3uikit"

export default function FundingFundMe() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis() // the moralis gives chainId hex, we need chainId
    const chainId = parseInt(chainIdHex)
    console.log(pchainId)
    const FundMeAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const [ethAmount, setEthAmount] = useState("")
    const [contractBalance, setContractBalance] = useState("")
      
    
    const dispatch = useNotification()
    const { runContractFunction: fund } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "fund",
        params: {},
        //msgValue:,// youtube 17:43:03
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        //try to read raffle entrancefeed
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const NumPlayersFromCall = (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall = await getRecentWinner()

        setEntranceFee(entranceFeeFromCall)
        console.log(entranceFee)
        setNumPlayers(NumPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx) {
        await tx.wait(1) // wait 1 transaction go through
        handleNewNotification(tx) // another helper below
        updateUI()
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div>
            Hi from funding Me !
            {raffleAddress ? (
                <div>
                    <button
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            }) // if success, we need to do something using this helper fucntion
                        }}
                    >
                        Enter Raffle
                    </button>
                    Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH Number Of
                    Players: {NumPlayers}
                    Recent Winner: {recentWinner}
                </div>
            ) : (
                <div> No Raffle Address Deteched </div>
            )}
        </div>
    )
}
