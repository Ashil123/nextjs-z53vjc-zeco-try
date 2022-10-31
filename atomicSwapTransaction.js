import { useEffect, useState } from 'react';
import { useMetamask } from 'use-metamask';
import Web3 from 'web3';
import {
	func,
	object,
} from 'prop-types';
import { ZTokenContract } from '@utils/smartcontract/ztoken-contract';
import moment from 'moment';

export default function AtomicSwapTransaction(props) {
	const { blockChainAddress, addSnackBarItem, close } = props;
	const {
		connect, getChain, metaState, getAccounts,
	} = useMetamask();
	const [loading, setLoading] = useState(false);

	// TA TOKEN

	const TA_TOKEN_ADDRESS = '0xE41B7e4A7D9D8a6673f0CC66c0d8b5003CDAAb72';
	const T2CHTLC_ADDRESS = '0x1029738c846Be9293c3B5859cb1d8E2361882Cf6';
	const T2THTLC_ADDRESS = '0xD56e7bc55374F14792fC2a968C18E6d454fa1847';

	// CP TOKEN
	const CP_TOKEN_ADDRESS = '0x4C8A788F9523f240C0F0FC9D3d12cd5db5E48853';
	const C2THTLC_ADDRESS = '0xb14Fc84D3219dA89392F17b0CB80Cf3Fc04E9715';
	const C2CHTLC_ADDRESS = '0xDE1Ac85c1fEE0d98840684C7cB8AfaB93FA5D99b';

	const metamaskOperation = async () => {
		setLoading(true);
		try {
			if (metaState.isConnected) {
				const chain = await getChain();
				const ac = await getAccounts();
				console.log('chain ID', blockChainAddress, ac[0], C2CHTLC_ADDRESS);
				if (chain.id !== '43113' || chain.id !== 43113) {
					throw Error('Please select the Avalanche C CHAIN network.');
				}
				const resp = await ZTokenContract(metaState.web3, CP_TOKEN_ADDRESS)
					.isApprovedForAll(ac[0], C2CHTLC_ADDRESS);
				console.log('responbsee ==', resp);
				const a = moment().unix();
				if (!resp) {
					console.log('IN 2');
					try {
						const resp2 = await ZTokenContract(metaState.web3, CP_TOKEN_ADDRESS).setApprovalForAll('0xDE1Ac85c1fEE0d98840684C7cB8AfaB93FA5D99b', true);
						console.log('TRUEE', resp2);
						if (resp2.status) {
							const conteact = await ZTokenContract(metaState.web3, CP_TOKEN_ADDRESS)
								.partySubmitsOfferRequest(
									1,
									2000,
									a,
									blockChainAddress,
									metaState?.web3?.utils?.asciiToHex('Ashil'),
									ac[0],
								);
							console.log('METAMASKKKK', conteact);
						}
					} catch (e) {
						console.log('ERRO2', e);
					}
				} else {
					const conteact = await ZTokenContract(metaState.web3, CP_TOKEN_ADDRESS)
						.partySubmitsOfferRequest(
							1,
							2451,
							a,
							blockChainAddress, // ? this one ?
							metaState?.web3?.utils?.asciiToHex('Ashil'),
							ac[0],
						);
					console.log('METAMASKKKK', conteact);
				}
				// console.log('response ==>', resp,
				// 1,
				// 2451,
				// a,
				// blockChainAddress,
				// metaState?.web3?.utils?.asciiToHex('Ashil'));
				// console.log('AAA', a);
			} else {
				await connect(Web3);
			}
		} catch (error) {
			console.log('Error Block', error, '\n\n');
			addSnackBarItem({
				theme: 'error',
				text: error?.message || 'Unexpected error, please try again later.',
			});
			close();
		}
	};
	const onConnect = async () => {
		setLoading(true);
		try {
			if (!metaState.isAvailable) {
				throw Error('Please install metamask.');
			}
			if (!metaState.isConnected) {
				await connect(Web3);
			}
			setTimeout(() => metamaskOperation(), 100);
		} catch (error) {
			// addSnackBarItem({
			// 	theme: 'error',
			// 	text: error?.message || 'Unexpected error, please try again later.',
			// });
		}
		setLoading(false);
	};
	useEffect(() => {
		if (!loading) {
			onConnect();
		}
	});
	return null;
}
AtomicSwapTransaction.propTypes = {
	zeconomyUser: object.isRequired,
	addSnackBarItem: func.isRequired,
};
