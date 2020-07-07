export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'
export const tokens = (n) => {
	return new web3.utils.BN(
	web3.utils.toWei(n.toString(),'ether'))}

export const message='VM Exception while processing transaction: revert'

export const ether = (n) => {
	return new web3.utils.BN(
		web3.utils.toWei(n.toString(),'ether')
		)
}