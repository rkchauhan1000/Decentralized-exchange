pragma solidity ^0.5.0;

//ERC20 Token 

contract Token {
	
	string public name = "RITIK";
	string public symbol = "RK";
	uint public decimals = 18;
	uint public totalSupply;

	mapping(address => uint256) public balanceOf;
	mapping(address =>mapping(address =>uint256)) public allowance;

	event Transfer(address indexed from, address indexed to,uint256 value);
	event Approval(address indexed owner,address indexed spender,uint256 value);

	constructor() public {

		totalSupply = 1000000 * (10 ** decimals);
		balanceOf[msg.sender]=totalSupply;

	}

	function transfer(address _to, uint256 _value) public returns (bool success) {
		
		require(_to!= address(0));
		require(_value>=0);
		require(balanceOf[msg.sender]>=_value);
		balanceOf[msg.sender]=balanceOf[msg.sender]-_value;
		balanceOf[_to]=balanceOf[_to]+_value;
		emit Transfer(msg.sender,_to,_value);
		return true;

	}

	function _transfer(address _from ,address _to, uint256 _value) internal{
		require(_to!= address(0));
		balanceOf[_from]=balanceOf[_from]-_value;
		balanceOf[_to]=balanceOf[_to]+_value;
		emit Transfer(_from,_to,_value);
	}

	function approve(address _spender, uint256 _value) public returns (bool success) {

		require(_spender!= address(0));
		require(_value>=0);
		allowance[msg.sender][_spender]=_value;
		emit Approval(msg.sender,_spender,_value);
		return true;
	}

	function transferFrom(address _from ,address _to, uint256 _value) public returns(bool success){
		require(_value <= balanceOf[_from]);
		require(_value <= allowance[_from][msg.sender]);
		allowance[_from][msg.sender] = allowance[_from][msg.sender]-_value;
		_transfer(_from,_to,_value);
		return true;
	} 
} 