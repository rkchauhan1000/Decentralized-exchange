const Token = artifacts.require("./Token");
import { tokens ,message} from './helpers';



require('chai')
	.use(require('chai-as-promised'))
	.should()

contract('Token',([deployer,exchange,receiver]) =>{
	const name = 'RITIK'
	const symbol = 'RK'
	const decimals = '18'
	const totalSupply = tokens(1000000).toString()

	let token

	beforeEach(async () => {
		token = await Token.new()
	})
	describe('deployment',() =>{
		it('track the name', async () =>{

		const result = await token.name()
		result.should.equal(name)
		})

		it('track the symbol', async () =>{

		const result = await token.symbol()
		result.should.equal(symbol)

		})

		it('track the decimals', async () =>{

		const result = await token.decimals()
		result.toString().should.equal(decimals)

		})

		it('track the Total Supply', async () =>{

		const result = await token.totalSupply()
		result.toString().should.equal(totalSupply)

		})


		it('assigns the Total Supply to the deployer', async () =>{

		const result = await token.balanceOf(deployer)
		result.toString().should.equal(totalSupply)

		})

    })

	describe('sending tokens', () => {
		let amount
		let result

		describe('success',async () =>{

			beforeEach(async () => {
			amount = await tokens(100)
			result = await token.transfer(receiver,amount ,{from : deployer})
		    })
		
			it('transfers token balances', async () =>{
				let balanceOf
		    	balanceOf = await token.balanceOf(deployer)
				balanceOf.toString().should.equal(tokens(999900).toString())
				balanceOf = await token.balanceOf(receiver)
				balanceOf.toString().should.equal(tokens(100).toString())
			})

			it('emits transfer event',async () =>{
				const log =result.logs[0]
				log.event.should.equal('Transfer')
				const event = log.args
				event.from.toString().should.equal(deployer,'from is correct')
				event.to.toString().should.equal(receiver,'to is correct')
				event.value.toString().should.equal(amount.toString(),'value is correct')
			})
		
		})

		describe('failure',async () =>{
      
        	it('rejects insufficient balances', async () =>{
        		let invalidAmount
        		invalidAmount = tokens(10000000)
        		await token.transfer(receiver,invalidAmount,{from: deployer}).should.be.rejectedWith(message); 
         		invalidAmount = tokens(1000)
        		await token.transfer(deployer,invalidAmount,{from: receiver}).should.be.rejectedWith(message); 

      		})

      		it('rejects invalid recipients', async () => {
      			await token.transfer(0x0,amount, {from :deployer}).should.be.rejected
      		})
	
		})
	
	})

	describe('approving tokens', () => {
		let result
		let amount

		beforeEach(async () =>{
			amount = tokens(100)
			result = await token.approve(exchange, amount,{from :deployer})
		})
		
		describe('success', () => {
			it('allocates an allowance for delegated token spending on exchange',async () =>{
				const allowance = await token.allowance(deployer,exchange)
				allowance.toString().should.equal(amount.toString())
			})

			it('emits approval event',async () =>{
				const log =result.logs[0]
				log.event.should.equal('Approval')
				const event = log.args
				event.owner.toString().should.equal(deployer,'owner is correct')
				event.spender.toString() .should.equal(exchange,'spender is correct')
				event.value.toString().should.equal(amount.toString(),'value is correct')
			})
		})

		describe('failure', () => {
			it('rejects invalid spenders', async () => {
				await token.approve(0x0,amount, {from : deployer}).should.be.rejected
			})

		})

	})
	describe('delegated token transfers',() => {
		let result 
		let amount

		beforeEach(async () => {
			amount = tokens(100)
			await token.approve(exchange,amount, {from :deployer})

		})

		describe('success', async () => {
			beforeEach(async () => {
				result = await token.transferFrom(deployer,receiver,amount,{from : exchange})

			})

			it('transfers token balances', async () => {
				let balanceOf
				balanceOf = await token.balanceOf(deployer)
				balanceOf.toString().should.equal(tokens(999900).toString())
				balanceOf = await token.balanceOf(receiver)
				balanceOf.toString().should.equal(tokens(100).toString())
			})

			it('resets the allowance',async () =>{
				const allowance = await token.allowance(deployer,exchange)
				allowance.toString().should.equal('0')
			})

			it('it emits a transfer event', async () => {
				const log = result.logs[0]
				log.event.should.equal('Transfer')
				const event = log.args
				event.from.toString().should.equal(deployer)
				event.to.toString().should.equal(receiver)
				event.value.toString().should.equal(amount.toString())
			})			

		})

		describe('failure', async () => {
			it('rejects insufficient amounts',async () => {
				const invalidAmount = tokens(10000000)
				await token.transferFrom(deployer,receiver,invalidAmount,{from: exchange}).should.be.rejectedWith(message);
			})

			it('it rejects invalid recipients',async () => {
				await token.transferFrom(deployer,0x0,amount, {from: exchange}).should.be.rejected
			})
		})

	})

}) 
	
	
 
    