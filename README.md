
# Bothways

Welcome to the [bothways](https://github.com/yellowbrainz/bothways/)
project, a centos:latest with a configurable version of geth. It will build
two full fletched Ethereum networks, ideal for nerdy cross ledger developments.

In the box you will find a minernode in each network (eth_1 and eth_2) both
implemented as virtual machines in two separated virtual docker-lans.

## Prerequisites

GNU make and Docker version 1.18 (or higher) are required. Internet connection
is needed only for building the docker image. The project has been tested to
work on Linux and MacOS High Sierra.

## Bootstrapping

### Step 1: get the source code

From git, clone the project:

```
git clone https://github.com/yellowbrainz/bothways.git
```

### Step 2: build the docker image

Enter the source subdirectory and build the image:

```
cd etherway1
PASSWD="<YourPasswordForPlatform1>" make build
cd ../etherway2
PASSWD="<YourPasswordForPlatform2>" make build
```

Note that this will set all the passwords of the ethereum accounts.

#### The folder structure and key files

```
.
|
+-- artifacts
|   +-- app.json
|   +-- entrypoint.sh
|   +-- genesis.json
|   +-- key.eth_1
|   +-- key.eth_2
|   +-- static-nodes_1.json
|   +-- static-nodes_2.json
+-- Dockerfile
+-- Makefile
```

`Dockerfile` : the receipe to build the ing-bank/bothways1 or
ing-bank/bothways2 docker image, depending onn which module is build.
`Makefile` : to build the image, initialize- and start and stop Ethereum nodes.

Most of the files found in `./artifacts` folder will be copied to the Docker
container and are used by the different containers.
`genesis.json` : this is the genesis block used to initialize the Ethereum nodes,
contains network id and difficulty setting for Proof-of-Work.
`key.eth_*` : a pseudo random seed used to arrive at the same node addresses that we have captured in the `static-nodes_*.json` files. When changing this, please remember to read the generated node addresses from the `geth` prompt and update the `static-nodes_*.json` files with these. You will need to rebuild the container and restart.
`static-nodes_*.json` : the configuration files, which contains the nodes address and associated ip
addresses to connect to on startup.
`entrypoint.sh` : the shell script executed by docker upon startup of the
container, takes the "role" parameter, returns help page when no role parameter
is provided.

### Step 3: create the persistent data volume

Create a persistent data volume for the miner.

```
make datavolume
```

The miner node requires a DAG file, that is generated if it does not exist.
Datavolumes are created per node and meant to retain all data (chaindata and
keyfiles).

To completely remove all the data volumes from your disk (and lose all data on
these volumes for forever), use this command:

```
docker volume rm `docker volume ls -q`
```

### Step 4: start up the environment

To start up your personal Ethereum network, start all the components with one command:

```
make start
```

This will create a separate virtual network called "etherway" in Docker, will
launch one miner node, two normal nodes, the monitoring client, and the
monitoring server nodes, all from a single docker image. The network range for
the virtual docker network is defined in the Makefile. Each container has its
own pre-configured ip address within the specified network range. Ethereum
miner and two nodes cross-connect to each other, as configured in
`static-nodes.json` file. The miner node is the only one mining, using a single
cpu core. The monitoring node polls the miner and the nodes via the rpc port
30303, and publishes its results to the monitoring server.

The topology of the virtual network is reflected in the following diagram:

```
|-----(corp. lan)-----------+-----|
                            |
                         (bridge)
                            |
   |--(virt. docker lan1)---+
                            |
                          miner
                         (eth_1)

|-----(corp. lan)-----------+-----|
                            |
                         (bridge)
                            |
   |--(virt. docker lan2)---+
                            |
                          miner
                         (eth_2)
```

To inspect the network and see what's in there simply run the following docker
command:

```
docker network inspect bothways1
docker network inspect bothways2
```

### Step 5: interact with the environment

Geth console (on the miner node) can be envoked by a simple make command:

```
make console
```

Now you will see the Ethereum prompt '> ' this is where you can run geth
(go-Ethereum) commands. Run the command below to get the basic Node information:

```
admin.nodeInfo
```

See how many peers are connected to the node:

```
admin.peers
```

Create an Ethereum account (password-protected by default):

```
personal.newAccount("<the_password_of_your_choice>")
```

Stop the geth console and return to shell:

```
> exit
```

Note1: There is no account name in this construct. All account in the Ethereum
node are identified through an index (0, 1, 2, ...). You will need to keep
track in your application which (functional)account is mapped to which index.

Note2: The password that you provide is the private key for the account.
Please record this key, as it will be required when you would like to do
something usefull with the account. Every transaction on Ethereum requires you
to unlock that account first, and for this step you do need to specify this
private key.

To stop the environment, run this command:

```
make stop
```

To remove the temporary docker containers and the network (but not the
persistent volume), run this command:

```
make clean
```

## Admin and advanced stuff

### Show all accounts and balances in Ether

Copy-paste the following script your geth console and then run this script to
see the balances (in Ether) of all the accounts that live in the network:

```
function checkAllBalances() {var i =0;eth.accounts.forEach( function(e){console.log
("eth.accounts["+i+"]: " +  e + " \tbalance: " + web3.fromWei(eth.getBalance(e),
"ether") + " ether");i++;})};
```

### Transferring ether between accounts

Step 1 - Enter the geth console

```
make console
```

Step 2 - Unlock the account (0) you want to transfer funds from

```
> personal.unlockAccount(eth.accounts[0],"<YourPassword>")
```

Step 3 - Transfer the funds from account 0 to account 1

```
> eth.sendTransaction({from:eth.accounts[0],to:eth.accounts[1],value:1e10})
```

See [https://github.com/ethereum/go-ethereum/wiki/geth](https://github.com/ethereum/go-ethereum/wiki/geth)
how to use geth console and transfer Ether from one account to another.

### Adjust the genesis file

The Ethereum network settings are highly configurable, and most settings are
set in the `./artifacts/genesis.json` file:

```
vi artifacts/genesis.json
```

`genesis.json` file contains settings you can change:

* `nonce` - unique network id
* `difficulty` - how difficult the initial mining of ether should be
* `gasLimit` - how much gas is given to the network to run programs
* `alloc` - names of the accounts and how much Ether each account gets

Note: every account will be initialized with 5000 Ether
(5000 * 10000000000000000000 Wei) at the outset.

If you change `genesis.json` file, you will need to stop + remove all dockers,
delete all datavolumes and rebuild your Docker image.

Also when updating the network-id in the `genesis.json` file, also visit the
`Dockerfile` and `Makefile`.

# Disclaimer

This is a development toolkit to quickly build Ethereum network in Docker.
This is not meant to be a bases for the production project.
All RPC interfaces are exposed!

## Contact

This concludes this mini tutorial. Your feedback and corrections are appreciated.

Toon Leijtens <toon.leijtens@ing.com> and Maxim B. Belooussov <belooussov@gmail.com>
