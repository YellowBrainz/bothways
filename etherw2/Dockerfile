FROM centos:latest
MAINTAINER Maxim B. Belooussov <belooussov@gmail.com> Toon Leijtens <toon.leijtens@ing.com>
RUN yum -y groupinstall "Development Tools"
RUN yum -y install bc
RUN yum -y install golang
RUN git clone https://github.com/ethereum/go-ethereum

# Davy Jones' Locker
ARG ETHVERSION=v1.7.3
RUN cd /go-ethereum && git checkout $ETHVERSION && make geth && cp /go-ethereum/build/bin/* /usr/local/sbin/
RUN yum -y remove golang
RUN rm -rf /go-ethereum

WORKDIR /

ENV DATADIR=/root/.ethereum
WORKDIR $DATADIR

COPY artifacts/genesis.json /root/.ethereum/
COPY artifacts/key.* /root/.ethereum/

ARG NETWORKID=77
ENV NETWORKID $NETWORKID

ARG WS_SECRET
ENV WS_SECRET ${WS_SECRET}

RUN for i in admin user1 user2 user3 user4 user5 user6; do \
	echo $WS_SECRET > credentials.$i; \
    /usr/local/sbin/geth --datadir /root/.ethereum --password /root/.ethereum/credentials.$i account new > /root/.ethereum/$i.id; \
    sed -i "s/Address: {//g" /root/.ethereum/$i.id; \
    sed -i "s/}//g" /root/.ethereum/$i.id; \
    sed -i "s/$i/0x$(cat /root/.ethereum/$i.id)/" /root/.ethereum/genesis.json; \
    done

COPY artifacts/entrypoint.sh /entrypoint.sh
RUN sed -i "s/adminetherbase/0x$(cat /root/.ethereum/admin.id)/" /entrypoint.sh

RUN /usr/local/sbin/geth --networkid $NETWORKID init /root/.ethereum/genesis.json

ARG NETWORKPORT=30304
ENV NETWORKPORT $NETWORKPORT

ARG RPCPORT=8546
ENV RPCPORT $RPCPORT

# Toon has picked the port numbers
EXPOSE $RPCPORT $NETWORKPORT
ENTRYPOINT ["/entrypoint.sh"]
