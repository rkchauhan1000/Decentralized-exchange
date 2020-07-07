
import { tokens ,ether,message,ETHER_ADDRESS} from './helpers';

const Exchange = artifacts.require("./Exchange");
const Token = artifacts.require("./Token");

require('chai')
	.use(require('chai-as-promised'))
	.should()

contract('Exchange',([deployer,feeAccount,user1,user2]) =>{
	let token
	let exchange
	const feePercent = 10

	beforeEach(async () => {
		token = await Token.new()
		token.transfer(user1,tokens(100), {from:deployer})
		exchange = await Exchange.new(feeAccount,feePercent) 

	})
	describe('deployment',() =>{
		it('it tracks the fee account', async () => {
			const result = await exchange.feeAccount()
			result.should.equal(feeAccount)
		})

		it('it tracks the fee percent', async () => {
			const result = await exchange.feePercent()
			result.toString().should.equal('10')
		})
    })

    describe('fallback', () => {
    	it('reverts when Ether is send',async () => {
    		await exchange.sendTransaction({value :1, from: user1 }).should.be.rejectedWith(message);
    	})
    })

    describe('depositing ether',async () => {
    	let result
    	let amount

    	beforeEach(async () => {
    		amount = ether(1)
    		result = await exchange.depositEther({from:user1 ,value: amount })
    	})

    	it('tracks the Ether deposit',async () => {
    		const balance = await exchange.tokens(ETHER_ADDRESS,user1)
    		balance.toString().should.equal(amount.toString())
    	})

    	it('emits a Deposit event', async () => {
				const log = result.logs[0]
				log.event.should.equal('Deposit')
				const event = log.args
				event.token.should.equal(ETHER_ADDRESS)
				event.user.should.equal(user1)
				event.amount.toString().should.equal(amount.toString())
				event.balance.toString().should.equal(amount.toString())

		})
    })

    describe('withdrawing ether', async () => {
    	let result
    	let amount

    	beforeEach(async () => {
    		amount =ether(1)
    		await exchange.depositEther({from: user1, value :amount})
    	})

    	describe('success', async () => {
    		beforeEach(async () =>{
    			result = await exchange.withdrawEther(ether(1),{from : user1})
    		})

    		it('withdraws Ether funds', async () => {
    			const balance = await exchange.tokens(ETHER_ADDRESS,user1)
    			balance.toString().should.equal('0')

    		})

    		it('emits a Withdraw event', async () => {
				const log = result.logs[0]
				log.event.should.equal('Withdraw')
				const event = log.args
				event.token.should.equal(ETHER_ADDRESS)
				event.user.should.equal(user1)
				event.amount.toString().should.equal(amount.toString())
				event.balance.toString().should.equal('0')

			})

    	})

    	describe('failure', async () => {
    		it('rejects withdraws for insufficient balances', async () => {
    			await exchange.withdrawEther(ether(200), {from:user1}).should.be.rejectedWith(message);
    		})

    	})
    })

    describe('withdrawing tokens', async () => {
    	let result
    	let amount

    	describe('success', async () => {
    		beforeEach(async () =>{
    			amount = tokens(10)
    			await token.approve(exchange.address, amount, {from :user1})
    			await exchange.depositToken(token.address,amount, {from :user1})

    			result = await exchange.withdrawToken(token.address, amount, {from:user1})
    		})

    		it('withdraws Token funds', async () => {
    			const balance = await exchange.tokens(token.address,user1)
    			balance.toString().should.equal('0')

    		})

    		it('emits a Withdraw event', async () => {
				const log = result.logs[0]
				log.event.should.equal('Withdraw')
				const event = log.args
				event.token.should.equal(token.address)
				event.user.should.equal(user1)
				event.amount.toString().should.equal(amount.toString())
				event.balance.toString().should.equal('0')

			})

    	})

    	describe('failure', async () => {
    		it('rejects token withdraws', async () => {
    			await exchange.withdrawToken(token.address,tokens(10), {from:user1}).should.be.rejectedWith(message);
    		})

    		it('fails for insufficient balance', async () => {
    			await exchange.withdrawToken(token.address, tokens(10) , {from : user1}).should.be.rejectedWith(message);
    		})

    	})
    })
    
    describe('depositing tokens',() =>{
    	let result

    	
		describe('success', () => {

			beforeEach(async () => {
    		await token.approve(exchange.address, tokens(10),{from : user1})
    	    result = await exchange.depositToken(token.address,tokens(10),{from :user1})
    		})
			
			it('tracks the token deposit', async () => {
				let balance
				balance = await token.balanceOf(exchange.address)
				balance.toString().should.equal(tokens(10).toString())
				balance = await exchange.tokens(token.address,user1)
				balance.toString().should.equal(tokens(10).toString())
			})

			it('emits a Deposit event', async () => {
				const log = result.logs[0]
				log.event.should.equal('Deposit')
				const event = log.args
				event.token.should.equal(token.address)
				event.user.should.equal(user1)
				event.amount.toString().should.equal(tokens(10).toString())
				event.balance.toString().should.equal(tokens(10).toString())

			})

		})

		describe('failure', () => {

			it('rejects ether deposits', async () => {
				await exchange.depositToken(ETHER_ADDRESS,tokens(10),{from: user1}).should.be.rejectedWith(message);
			})
			it('fails when no tokens are approved',async () =>{
				await exchange.depositToken(token.address,tokens(10),{from :user1}).should.be.rejectedWith(message);

			})
			
		})
    })

 	describe('Checking Balances', async () => {
 		beforeEach(async () => {
 			exchange.depositEther({from :user1, value:ether(1) })
 		})

 		it('returns user balances',async () => {
 			const result = await exchange.balanceOf(ETHER_ADDRESS,user1)
 			result.toString().should.equal(ether(1).toString())
 		})
 	})

 	describe('Making Order', async () => {
 		let result

 		beforeEach(async () => {
 			result = await exchange.makeOrder(token.address,tokens(1),ETHER_ADDRESS,ether(1),{from :user1})
 		})

 		it('tracks the newly created order',async () => {
 			const orderCount = await exchange.orderCount()
 			orderCount.toString().should.equal('1')
 			const order = await exchange.orders('1')
 			order.id.toString().should.equal('1')	
 			order.user.should.equal(user1)
 			order.tokenGet.should.equal(token.address)
 			order.amountGet.toString().should.equal(tokens(1).toString())
 			order.tokenGive.should.equal(ETHER_ADDRESS)
 			order.amountGive.toString().should.equal(ether(1).toString())
 			order.timestamp.toString().length.should.be.at.least(1)
 		})

 		it('emits Order Event ',async () => {
 			const log = result.logs[0]
 			log.event.should.equal('Order')
 			const event = log.args
 			event.id.toString().should.equal('1')	
 			event.user.should.equal(user1)
 			event.tokenGet.should.equal(token.address)
 			event.amountGet.toString().should.equal(tokens(1).toString())
 			event.tokenGive.should.equal(ETHER_ADDRESS)
 			event.amountGive.toString().should.equal(ether(1).toString())
 			event.timestamp.toString().length.should.be.at.least(1)

 		})
 	})

 	describe('Order actions', async () => {

 		beforeEach(async () => {
 			
 			await exchange.depositEther({ from :user1 , value: ether(1)})
 			await token.transfer(user2, tokens(100),{from :deployer})
 			await token.approve(exchange.address, tokens(2), {from :user2})
 			await exchange.depositToken(token.address, tokens(2),{from :user2})
 			await exchange.makeOrder(token.address,tokens(1),ETHER_ADDRESS,ether(1),{from :user1})

 		})

 		describe('filling orders', async () => {
 			let result

 			describe('success', async () => {
 				beforeEach(async () => {
 					result = await exchange.fillOrder('1',{from:user2})
 				})

 				it('executes the trade & charges fees', async () => {
 					let balance
 					balance = await exchange.balanceOf(token.address,user1)
 					balance.toString().should.equal(tokens(1).toString())

 					balance = await exchange.balanceOf(ETHER_ADDRESS,user2)
 					balance.toString().should.equal(ether(1).toString())

 					balance = await exchange.balanceOf(ETHER_ADDRESS,user1)
 					balance.toString().should.equal('0')

 					balance = await exchange.balanceOf(token.address,user2)
 					balance.toString().should.equal(tokens(0.9).toString())
 					
 					const feeAccount = await exchange.feeAccount()

 					balance = await exchange.balanceOf(token.address,feeAccount)
 					balance.toString().should.equal(tokens(0.1).toString())
 				})

 				it('updates filled orders', async () => {
 					const orderFilled = await exchange.orderFilled(1)
 					orderFilled.should.equal(true)
 				})

 				it('emits a "Trade" event', async () => {
 					const log = result.logs[0]
 					log.event.should.equal('Trade')
 					const event = log.args
 					event.id.toString().should.equal('1')	
 					event.user.should.equal(user1)
 					event.tokenGet.should.equal(token.address)
 					event.amountGet.toString().should.equal(tokens(1).toString())
 					event.tokenGive.should.equal(ETHER_ADDRESS)
 					event.amountGive.toString().should.equal(ether(1).toString())
 					event.userfill.should.equal(user2)
 					event.timestamp.toString().length.should.be.at.least(1)

 				})
 			})

 			describe('failure', async () => {
 				
 				it('rejects inavlid order ids', async () => {
 					const invalidOrderId = 9999
 					await exchange.cancelOrder(invalidOrderId, {from: user1}).should.be.rejectedWith(message);
 				})

 				it('rejects already filled orders', async () => {
 					await exchange.fillOrder('1',{from :user2}).should.be.fulfilled;
 					await exchange.fillOrder('1',{from :user2}).should.be.rejectedWith(message);
 				})

 				it('rejects cancelled orders', async () => {
 					await exchange.cancelOrder('1',{from :user1}).should.be.fulfilled;
 					await exchange.fillOrder('1',{from :user2}).should.be.rejectedWith(message);
 				})


 			})


 		})

 		describe('cancelling order', async () => {
 			let result

 			describe('success', async () => {
 				beforeEach(async () => {
 					result = await exchange.cancelOrder('1',{from: user1})
 				})

 				it('updates cancelled orders', async () => {
 					const orderCancelled = await exchange.orderCancelled(1)
 					orderCancelled.should.equal(true)
 				})

 				it('emits Trade Event ',async () => {
 					const log = result.logs[0]
 					log.event.should.equal('Cancel')
 					const event = log.args
 					event.id.toString().should.equal('1')	
 					event.user.should.equal(user1)
 					event.tokenGet.should.equal(token.address)
 					event.amountGet.toString().should.equal(tokens(1).toString())
 					event.tokenGive.should.equal(ETHER_ADDRESS)
 					event.amountGive.toString().should.equal(ether(1).toString())
 					event.timestamp.toString().length.should.be.at.least(1)

 				})
 			})

 			describe('failure', async () => {
 				
 				it('rejects inavlid order ids', async () => {
 					const invalidOrderId = 9999
 					await exchange.cancelOrder(invalidOrderId, {from: user1}).should.be.rejectedWith(message);
 				})

 				
 			})
 		})
 	})

}) 
	
	