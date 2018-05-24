AUTHOR=banking
NAME=bothways1
NETWORKID=15997
NETWORKPORT=30303
SUBNET=10.0.66
VERSION=latest
PWD=/dockerbackup
NETWORKNAME=bothways1
RPCPORT=8545
FULLDOCKERNAME=$(AUTHOR)/$(NAME):$(VERSION)

build:
	docker build -t $(FULLDOCKERNAME) --build-arg WS_SECRET=$(PASSWD) .

start: eth_1

stop:
	docker stop -t 0 eth_1

clean:
	docker rm -f eth_1

cleanrestart: clean start

network:
	docker network create --subnet $(SUBNET).0/16 --gateway $(SUBNET).254 $(NETWORKNAME)

datavolume:
	docker run -d -v ethereumeth_1:/root/.ethereum --name data-eth_eth_1 --entrypoint /bin/echo $(AUTHOR)/$(NAME):$(VERSION)

rmnetwork:
	docker network rm $(NETWORKNAME)

rmvolume:
	docker rm -f data-eth_eth_1
	docker volume rm ethereumeth_1

help:
	docker run -i $(AUTHOR)/$(NAME):$(VERSION) help

eth_1:
	docker run -d --name=eth_1 -h eth_1 --net $(NETWORKNAME) --ip $(SUBNET).1 -e SUBNET=$(SUBNET) --volumes-from data-eth_eth_1 -p $(NETWORKPORT):$(NETWORKPORT) -p $(RPCPORT):$(RPCPORT) $(AUTHOR)/$(NAME):$(VERSION) eth_1

console:
	docker exec -ti eth_1 /usr/local/sbin/geth attach ipc:/root/.ethereum/geth.ipc
