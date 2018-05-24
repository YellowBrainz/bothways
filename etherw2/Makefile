AUTHOR=banking
NAME=bothways2
NETWORKID=15998
NETWORKPORT=30304
SUBNET=10.1.77
VERSION=latest
PWD=/dockerbackup
NETWORKNAME=bothways2
RPCPORT=8546
FULLDOCKERNAME=$(AUTHOR)/$(NAME):$(VERSION)

build:
	docker build -t $(FULLDOCKERNAME) --build-arg WS_SECRET=$(PASSWD) .

start: eth_2

stop:
	docker stop -t 0 eth_2

clean:
	docker rm -f eth_2

cleanrestart: clean start

network:
	docker network create --subnet $(SUBNET).0/16 --gateway $(SUBNET).254 $(NETWORKNAME)

datavolume:
	docker run -d -v ethereumeth_2:/root/.ethereum --name data-eth_eth_2 --entrypoint /bin/echo $(AUTHOR)/$(NAME):$(VERSION)

rmvolume:
	docker rm -f data-eth_eth_2
	docker volume rm ethereumeth_2

rmnetwork:
	docker network rm $(NETWORKNAME)

help:
	docker run -i $(AUTHOR)/$(NAME):$(VERSION) help

eth_2:
	docker run -d --name=eth_2 -h eth_2 --net $(NETWORKNAME) --ip $(SUBNET).2 -e SUBNET=$(SUBNET) --volumes-from data-eth_eth_2 -p $(NETWORKPORT):$(NETWORKPORT) -p $(RPCPORT):$(RPCPORT) $(AUTHOR)/$(NAME):$(VERSION) eth_2

console:
	docker exec -ti eth_2 /usr/local/sbin/geth attach ipc:/root/.ethereum/geth.ipc

