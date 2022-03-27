pragma solidity >=0.4.21 <0.6.0;

import './Token.sol';

contract EthSwap {
    string public name = 'EthSwap Instant Exchange';
    Token public token;
    // 1 eth is 100 tokens
    uint public rate = 100;

    event TokenPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );
    event TokenSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {
        uint tokenAmount = msg.value * rate;

        // amount of tokens someone wants to purchase cannot be bigger than balance of ethSwapb
        require(tokenAmount <= token.balanceOf(address(this)));

        // transfer tokens to user
        token.transfer(msg.sender, tokenAmount);

        // emit an event
        emit TokenPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public {
        // user must have enough tokens
        require(token.balanceOf(msg.sender) >= _amount);

        // calculate amount of eher to redeem
        uint etherAmount = _amount / rate;

        // require that ethSwap has enough ether
        require(etherAmount <= address(this).balance);

        // transfer ether
        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(etherAmount);

        // trigger event
        emit TokenSold(msg.sender, address(token), _amount, rate);

    }
}