https://bitcoin.stackexchange.com/questions/2847/how-long-would-it-take-a-large-computer-to-crack-a-private-key

# type of wallets

* cold/hot
* soft/hard
* light/full
* burner
* contract wallet



# Hierarchical deterministic (HD) wallets

To preserve privacy, stay anonymous, it is recommended to use different addresses
for every transactions.

<!-- TODO maybe add a quote from satoshi -->

In the early days, wallets would simply randomly generate private keys and stored
them in a file inside the wallet. Users were responsible to backup the file.
But users would forget to back the keys up, or if they did back them up, they
would lose them, get corrupted, or the devices they were stored on (like usb stick)
would fail. A lot of bitcoin were lost this way.

To solve this issue, [BIP 32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#Specification_Key_derivation) introduced the concept of hierarchical
deterministic wallets, that allows to generate an unlimited number of public and
private keys, from a single number called "seed".

HD wallets create a set of "master keys" known as:

* **xpriv** (Extended Private Key)
* **xpub** (Extended Public Key)

Using **xpriv** a HD wallet can generate an unlimited number of private & public
keys, in a deterministic manner. Which means that knowing **xpriv** is sufficient
to generate the same private keys in the same order every single time.

So whenever, you need to make a transaction, a HD wallet will generate a new set
of keys and address. All generated addresses can be reused, you can give the
same address to multiple people and they can send you money on this same address
multiple times. (You are not going to lose anything).

**xpub** can be used to view the balance of all different addresses. Even though
it's public, to stay anonymous, it should stay private.

HD wallets also increases security: if one of the private keys is compromised,
all others are not.

<!-- -->
One great feature of HD wallets is that they allow to use a single master keypair,
to generate keys for different cryptocurrencies.
[BIP44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) describe
the way to generate the keys from the "derivation path".

seed phrase + derivation path => private key

<!-- TODO complete with info from https://ethereum.stackexchange.com/a/70029 -->
The [derivation path](https://ethereum.stackexchange.com/a/70029) looks like this:

    m / purpose' / coin_type' / account' / change / address_index

It is made of:

* `m` 
* `purpose` is set to 44, to indicates that it is following BIP44.
* `coin_type` is a number corresponding a blockchain. Bitcoin is 0. Cardano is
1815. Click [here](https://github.com/satoshilabs/slips/blob/master/slip-0044.md)
to see the full list of registered blockchains.
* `account` is a number starting at 0, allows to subdivide the wallet into
seperate logical subaccounts, for accounting or organizational purpose.
* `change` is 0 (external chain) or 1 (internal chain also known as change addresses)
External chain is used for addresses meant to be visible outside the wallet (receiving addresses).
Internal chain is used for addresses which are not meant to be visible outside of the wallet
and is used for return transaction change. (<- taken from BIP44)
* `address_index` addresses are numbered from index 0 in sequentially increasing manner.


Examples:

* `m / 44' / 0' / 0' / 1 / 0` Bitcoin first change first
* `m / 44'/ 60' / 1' / 0 / 3` Ethereum second external third


# Seed/Recovery Phrase

Most crypto wallets will give you a recovery phrase, also known as seed phrase,
upon creation. This seed phrase is generally made of 12 or 24 words. The number
of words and the words themself depends of the wallet, however, in an effort for
wallets to be compatible with each other, most of them use the standard described
in [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
(Bitcoin Improvement Proposal 39).

:::info
BIPs (Bitcoin Improvement Proposal) are documents describing new features or
utilities for Bitcoin, its processes or environment. You can read them on
[gitbub](https://github.com/bitcoin/bips).
:::

import {SeedPhraseGenerator} from '../../src/components/SeedPhraseGenerator.jsx';

<SeedPhraseGenerator />

# Interact with dApps

maybe do a part where we show how you can connect metamask or phantom, like
create a button, to connect 

put a warning to tell people not to accept transaction right here, because we
are not asking any