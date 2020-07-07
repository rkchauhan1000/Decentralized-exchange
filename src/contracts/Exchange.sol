pragma solidity ^0.5.0;

import './Token.sol';

contract Exchange {

	address public feeAccount;
	uint256 public feePercent;
	uint256 public orderCount;
	address constant ETHER = address(0);

	mapping(address=>mapping(address=>uint256)) public tokens;
	
	mapping(uint256 => _Order) public orders;
	
	mapping(uint256 => bool) public orderCancelled;  
	
	mapping(uint256 => bool) public orderFilled; 

	event Deposit(
		address token,
	    address user,
	    uint256 amount,
	    uint256 balance
	    );
	event Withdraw(
		address token, 
		address user, 
		uint256 amount, 
		uint256 balance
		);
	event Order(
		uint256 id, 
		address user, 
		address tokenGet,
		uint256 amountGet,
		address tokenGive,
		uint256 amountGive,
		uint256 timestamp
		);
	event Cancel(
		uint256 id, 
		address user, 
		address tokenGet,
		uint256 amountGet,
		address tokenGive,
		uint256 amountGive,
		uint256 timestamp
		);
	event Trade(
		uint256 id, 
		address user, 
		address tokenGet,
		uint256 amountGet,
		address tokenGive,
		uint256 amountGive,
		address userfill,
		uint256 timestamp
		);
	
	struct _Order {
		uint256 id ;
		address user;
		address tokenGet;
		uint256 amountGet;
		address tokenGive;
		uint256 amountGive;
		uint256 timestamp;
	}

	constructor (address _feeAccount,uint256 _feePercent) public {
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}	


	function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

  
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
       
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

   
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }
     
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
      
        require(b > 0, errorMessage);
        uint256 c = a / b;
       

        return c;
    }

    
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

  
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
	function() external {
		revert();
	}

	function depositEther() payable public {
		tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender]+msg.value;
		emit Deposit(ETHER,msg.sender,msg.value,tokens[ETHER][msg.sender]);
	}

	function withdrawEther(uint256 _amount) public {
		require(tokens[ETHER][msg.sender] >= _amount);
		tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender]- _amount;
		msg.sender.transfer(_amount);
		emit Withdraw(ETHER,msg.sender,_amount,tokens[ETHER][msg.sender]);
	}

	function depositToken(address _token, uint256 _amount) public {
		require(_token != ETHER);
		
		require(Token(_token).transferFrom(msg.sender,address(this),_amount));
		tokens[_token][msg.sender] = tokens[_token][msg.sender]+_amount;
		emit Deposit(_token,msg.sender,_amount,tokens[_token][msg.sender]);
	}

	function withdrawToken(address _token, uint256 _amount) public {
		require(_token!= ETHER);
		require(tokens[_token][msg.sender]>=_amount);
		tokens[_token][msg.sender]= tokens[_token][msg.sender]-_amount;
		require(Token(_token).transfer(msg.sender,_amount));
		emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}

	function balanceOf(address _token, address _user) public view returns(uint256){
		return tokens[_token][_user];
	}

	function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
		orderCount = orderCount + 1;
		orders[orderCount] = _Order(orderCount,msg.sender,_tokenGet,_amountGet,_tokenGive,_amountGive,now);
		emit Order(orderCount,msg.sender,_tokenGet,_amountGet,_tokenGive,_amountGive,now);
	}

	function cancelOrder(uint256 _id) public {
		_Order storage _order = orders[_id];
		require(msg.sender == address(_order.user));
		require(_order.id == _id);
		orderCancelled[_id] = true;
		emit Cancel(_order.id, msg.sender , _order.tokenGet, _order.amountGet, _order.tokenGive ,_order.amountGive ,_order.timestamp);
	}

	function fillOrder(uint256 _id) public {
		require(_id >0 && _id <= orderCount);
		require(!orderFilled[_id]);
		require(!orderCancelled[_id]);
		_Order storage _order = orders[_id];
		_trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive ,_order.amountGive);
		orderFilled[_order.id] = true;
	}

	function _trade(uint256 _orderId,address _user,address _tokenGet,uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal {
		uint256 abc= mul(_amountGive,feePercent);
		uint256 _feeAmount = div(abc,100);
		uint256 _cd =add(_amountGet,_feeAmount);
		tokens[_tokenGet][msg.sender] = sub(tokens[_tokenGet][msg.sender], _cd);
		tokens[_tokenGet][_user] = add(tokens[_tokenGet][_user],_amountGet);
		tokens[_tokenGet][feeAccount] = add(tokens[_tokenGet][feeAccount],_feeAmount) ;
		tokens[_tokenGive][_user] = sub(tokens[_tokenGive][_user],_amountGive);
		tokens[_tokenGive][msg.sender] = add(tokens[_tokenGive][msg.sender],_amountGive);

		emit Trade(_orderId, _user, _tokenGet, _amountGet, _tokenGive, _amountGive,msg.sender,now);
	}
}