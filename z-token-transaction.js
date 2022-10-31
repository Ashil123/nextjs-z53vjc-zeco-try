import { config } from '@constants';
import ztokenAbi from './ztoken_abi.json';

    export const ZTokenContract = (web3, contractAddress = config.ZTOKEN_AVAX_CONTRACT_ADDRESS) => {
        const contract = new web3.eth.Contract(
            ztokenAbi,
            contractAddress,
            // '0x4C8A788F9523f240C0F0FC9D3d12cd5db5E48853', // cp token
            // '0xE41B7e4A7D9D8a6673f0CC66c0d8b5003CDAAb72', // TA token
            // config.ZTOKEN_AVAX_CONTRACT_ADDRESS, // 0x070Bf11f241fe01990e0C86575b7C29d537f747c
        );

    const recordOnBlockchain = async (fromAccount, email, data) => (
            contract.methods
            .recordOnBlockchain(fromAccount, email, data, '')
            .send({ from: fromAccount })
    );
    // const key = 'jWnZr4u7x!A%D*G-KaPdSgVkXp2s5v8y';
    const safeTransferFrom = async (from, to, id, amount, data = '0x6a75737420612074657374', key_auth = '') => (
        contract.methods.safeTransferFrom(from, to, id, amount, data, key_auth)
            .send({ from })// , gasPrice: '10000'
    );

    const burnToken = async (address, token_Id, token_amount, key_auth = '') => (
        contract.methods.burnToken(address, token_Id, token_amount, key_auth)
        .send({ from: address }));

    const isApprovedForAll = async (acAddress, htlcContractAddress = '0xDE1Ac85c1fEE0d98840684C7cB8AfaB93FA5D99b') => (
        contract.methods.isApprovedForAll(acAddress, htlcContractAddress).call()
    );

    // const setApprovalForAll = async (address = '0xDE1Ac85c1fEE0d98840684C7cB8AfaB93FA5D99b') => (
    //     contract.methods.setApprovalForAll(address, true).send({ from: '0x6Cb3AF3728e1f645585999CA0C31022Ca4c7b7AB' })
    // );

    const setApprovalForAll = async (address = '0xDE1Ac85c1fEE0d98840684C7cB8AfaB93FA5D99b') => (
        contract.methods.setApprovalForAll('0xDE1Ac85c1fEE0d98840684C7cB8AfaB93FA5D99b', true).send({ from: '0x6848febC571Cba3c4D5540aDA18C4eEAeE254f2c' })
    );

    // const setApprovalForAll = async ('0xDE1Ac85c1fEE0d98840684C7cB8AfaB93FA5D99b', true)

    const createOfferRequest = async (
        cpTokenAddress,
        taTokenAddress,
        cpTokenId,
        taTokenId,
        cpTokenAmt,
        taTokenAmt,
        withdrawelExpDate,
        reqOfferId,
        keyAuth,
    ) => (
        contract.methods.createOfferRequest(
            cpTokenAddress,
            taTokenAddress,
            cpTokenId,
            taTokenId,
            cpTokenAmt,
            taTokenAmt,
            withdrawelExpDate,
            reqOfferId,
            keyAuth,
        )
    );

    const partySubmitsOfferRequest = async (
        cpTokenAmt,
        cpTokenId,
        withdrawelExpDate,
        counterAddress = '0x6848febC571Cba3c4D5540aDA18C4eEAeE254f2c',
        reqId,
        keyAuth = 'access',
        fromAddress = '0x6Cb3AF3728e1f645585999CA0C31022Ca4c7b7AB',
    ) => (
        contract.methods.partySubmitsOfferRequest(
            cpTokenAmt,
            cpTokenId,
            withdrawelExpDate,
            counterAddress,
            // '0x6Cb3AF3728e1f645585999CA0C31022Ca4c7b7AB',
            // '0x6848febC571Cba3c4D5540aDA18C4eEAeE254f2c', // counter party Address
            // '0x6848febC571Cba3c4D5540aDA18C4eEAeE254f2c', // counterAddress,
            reqId,
            keyAuth,
            fromAddress,
        ).send({ from: fromAddress })
        // ).send({ from: '0x6848febC571Cba3c4D5540aDA18C4eEAeE254f2c' })
    );

    return {
        recordOnBlockchain,
        safeTransferFrom,
        isApprovedForAll,
        createOfferRequest,
        partySubmitsOfferRequest,
        setApprovalForAll,
        burnToken,
    };
};
