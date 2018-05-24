#!/bin/sh

OPTIONS="--nodiscover --networkid $NETWORKID --port $NETWORKPORT --rpc --rpcport $RPCPORT --etherbase adminetherbase --verbosity 6"
HELP="This is a help page. \
Available modes are: eth_1 help."
case $1 in
	eth_1)
	cp /root/.ethereum/key.eth_1 /root/.ethereum/geth/nodekey
	/usr/local/sbin/geth --rpccorsdomain "*" --rpcapi admin,debug,shh,txpool,miner,personal,db,eth,net,web3 --identity $1 --rpcaddr $SUBNET.1 --mine --minerthreads "1" $OPTIONS
	;;
	help)
	echo $HELP
	;;
	"")
	echo $HELP
esac
