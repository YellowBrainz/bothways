
// DEPLOYED ON NETWORK 1
contract Token {
    
    address oracle_key = 0xdd870fa1b7c4700f2bd7f44238821c26f7392148;
    int THIS_NETWORK = 1;


    address public owner = msg.sender;
    event TokenMoved(address indexed token, int indexed destNet, address indexed destOwner);
    event Exchange(address indexed token, address indexed exchangeToken, address indexed destOwner);
    
    function transfer(address newOwner) {
        require (msg.sender == owner);
        owner = newOwner;
    }
    
    function send(address newOwner, int newNetwork) {
        transfer(address(0));
        TokenMoved(this, newNetwork, newOwner);
    }

    // TODO: This should be subscribed to the TokenMoved from network 2
    function receive(address newOwner) {
        require (/*msg.sender == oracle_key && */ owner == address(0));
        owner = newOwner;
    }
    
    function proposeTrade(address newOwner, address conditionToken) {
        transfer(address(0));
        Exchange(this, conditionToken, newOwner);
    }
}