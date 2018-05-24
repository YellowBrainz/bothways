// DEPLOYED ON NETWORK 2
contract ExternalTokens {
    
    address oracle_key = 0xdd870fa1b7c4700f2bd7f44238821c26f7392148;
    int THIS_NETWORK = 2;
    int SOURCE_NETWORK = 1;
    
    mapping (address => address) public owner;
    event TokenMoved(address indexed token, int indexed destNet, address indexed destOwner);
    event Exchange(address indexed token, address indexed exchangeToken, address indexed destOwner);

    function transfer(address token, address newOwner) {
        require (msg.sender == owner[token]);
        owner[token] = newOwner;
    }
    
    function send(address token, address newOwner) {
        transfer(token, address(0));
        TokenMoved(token, SOURCE_NETWORK, newOwner);
    }
    
    // TODO: This should be subscribed to the TokenMoved from network 1
    function receive(address token, address newOwner) {
        require (/*msg.sender == oracle_key && */owner[token] == address(0));
        owner[token] = newOwner;
    }
    
    function proposeTrade(address token, address newOwner, address conditionToken) {
        transfer(token, address(0));
        Exchange(token, conditionToken, newOwner);
    }
}
