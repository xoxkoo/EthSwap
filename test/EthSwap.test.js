/* eslint-disable no-undef */
const { assert } = require('chai');
const { default: Web3 } = require('web3');

const EthSwap = artifacts.require("EthSwap");
const Token = artifacts.require("Token");

require('chai')
    .use(require('chai-as-promised'))
    .should()

// convert number of tokens to human readable number
// 18 decimals same as ether
function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}

contract('EthSwap', ([deployer, investor]) => {
    
    let token, ethSwap

    // here we can initialize the variables and use them later    
    before( async() => {
        token = await Token.new()
        ethSwap = await EthSwap.new(token.address)

    })
    
    // token deployment
    describe('Token deployment', async() => {
        it('contract has a name', async() => {
            const name = await token.name()
            assert.equal(name, 'DApp Token')
        })
    })

    // ethswap deployment
    describe('EthSwap deployment', async() => {
        
        it('contract has a name', async() => {
            const name = await ethSwap.name()
            assert.equal(name, 'EthSwap Instant Exchange')
        })

        it('contract has tokens', async() => {
            // transfer 1 milion tokens to ethswap
            // 1 milion because it has 18 decimals
            await token.transfer(ethSwap.address, tokens('1000000'))
            
            let balance = await token.balanceOf(ethSwap.address)
            
            assert.equal(balance, tokens('1000000'))
        })
    })

    describe('Buy tokens', async () => {

        let result;

        before(async() => {
            // 1 ether
            result = await ethSwap.buyTokens({from: investor, value: web3.utils.toWei('1', 'ether')})
        })

        it('Allows user to purchase tokens from EthSwap for fixed price', async () => {
            // check for investor balance after purchase
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('100'))
            // check ethSwap balance after purchase
            let ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('999900'))
        
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('1'))
        

            const event = result.logs[0].args

            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount, tokens('100'))
            assert.equal(event.rate, 100)
        })
    })

    // describe('Sell tokens', async () => {

    //     let result;

    //     before(async() => {
    //         // we need to aprove it
    //         await token.approve(ethSwap.address, tokens('100'), {from: investor})
    //         result = await ethSwap.sellTokens(tokens('100'), {from: investor})
    //     })

    //     it('Allows user to sell tokens to EthSwap for fixed price', async () => {
    //         // check for investor balance after purchase
    //         let investorBalance = await token.balanceOf(investor)
    //         assert.equal(investorBalance.toString(), tokens('0'))
    //         // check ethSwap balance after purchase
    //         let ethSwapBalance = await token.balanceOf(ethSwap.address)
    //         assert.equal(ethSwapBalance.toString(), tokens('1000000'))
        
    //         ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
    //         assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0', 'Ether'))
        

    //         // check logs to ensure event was emmited with correct data
    //         const event = result.logs[0].args

    //         assert.equal(event.account, investor)
    //         assert.equal(event.token, token.address)
    //         assert.equal(event.amount, tokens('100'))
    //         assert.equal(event.rate, 100)
    //     })
    // })
    describe('Sell tokens', async () => {

        let result;

        before(async() => {
            // we need to aprove it
            await token.approve(ethSwap.address, tokens('100'), {from: investor})
            result = await ethSwap.sellTokens(tokens('100'), {from: investor})
        })

        it('Allows user to sell tokens to EthSwap for fixed price', async () => {
            // check for investor balance after purchase
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), '0')
            // check ethSwap balance after purchase
            let ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('1000000'))

            // check logs to ensure event was emmited with correct data
            const event = result.logs[0].args
            
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount, tokens('100'))
            assert.equal(event.rate, 100)

            // ivestor can't sell more tokens that they have
            await ethSwap.sellTokens(tokens('500'), {from: investor}).should.be.rejected
        })
    })
})