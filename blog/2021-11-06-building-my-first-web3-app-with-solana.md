---
slug: web3-app-solana
title: Building my first web3 app with Solana
authors: ae42faf7
tags: [crypto guide]
---

Story short, I saw [this tweet](https://twitter.com/_buildspace/status/1456345221772500999)
talking about building a project on the solana blockchain. One of my goal being
becoming a solana dev, I jumped in. So here's my notes

Buildspace is a great place to learn by doing projects. In this project, you can
learn to build a Solana program (smart contract) and a web app that is able to
connect to a Solana wallet (Phantom) to interact with the solana program deployed
on the solana network.

:::danger

These are my raw notes, it's straight up copy-pasta. Please refer to [the buildspace project's page](https://app.buildspace.so/courses/CObd6d35ce-3394-4bd8-977e-cbee82ae07a3)
for more & better information.

I am not the original author of this content, I don't claim ownership or whatever.

:::

In order for our website to talk to our Solana program, we need to somehow
connect our wallet. Once we connect our wallet to our website, our website will
have permission to run functions from our program, on our behalf.

It's just like authenticating into a website. 

If you have the Phantom Wallet extension installed, it (the phantom wallet
extension) will automatically inject a special object named `solana` into your
`window` object that has some magical functions.

Before we do anything, we need to check to see if this exists. If it doesn't
exist, let's tell our user to go download it

```javascript
/*
* This function holds the logic for deciding if a Phantom Wallet is
* connected or not
*/
const checkIfWalletIsConnected = async () => {
  try {
    const { solana } = window;

    if (solana) {
      if (solana.isPhantom) {
        console.log('Phantom wallet found!');
      }
    } else {
      alert('Solana object not found! Get a Phantom Wallet 👻');
    }
  } catch (error) {
    console.error(error);
  }
};

/*
  * When our component first mounts, let's check to see if we have a connected
  * Phantom Wallet
  */
useEffect(() => {
  window.addEventListener('load', async (event) => {
    await checkIfWalletIsConnected();
  });
}, []);
```

The Phantom Wallet team suggests to wait for the window to fully finish loading
before checking for the solana object.

Next, we need to actually check if we're authorized to actually access the user's
wallet.

All we need to do is add one more line to our `checkIfWalletIsConnectedCheck`
function.

```javascript
/*
* The solana object gives us a function that will allow us to connect
* directly with the user's wallet!
*/
const response = await solana.connect({ onlyIfTrusted: true });
console.log(
  'Connected with Public Key:',
  response.publicKey.toString()
);
```

Calling `connect` tells phantom wallet that our app is authorized to access
information about that wallet.
Using `onlyIfTrusted` allows the app to automatically pull the wallet information
without prompting the user with another connect popup.

The `connect` method will only run if the user has already authorized a
connection to your app

So, let's actually initialize this connection!

We need to create a `connectWallet` button. In the world of web3, connecting
your wallet is literally like signing up or in. But it's much easier to do. With
react we can do something like this:

```jsx
const renderNotConnectedContainer = () => (
  <button
    className="cta-button connect-wallet-button"
    onClick={connectWallet}
  >
    Connect to Wallet
  </button>
)
```

Now the function to connect to the wallet.

```javascript
// we store pub address in state
const [walletAddress, setWalletAddress] = useState(null);

// inside
const checkIfWalletIsConnected = async () => {
  // ... 
  // add this to connect the wallet if it's not the first time
  setWalletAddress(response.publicKey.toString());
  // ... 
}

// Will be triggered when the user clicks the button "Connect to Wallet"
// first time connecting a phantom wallet
const connectWallet = async () => {
  const { solana } = window;

  if (solana) {
    const response = await solana.connect();
    console.log('Connected with Public Key:', response.publicKey.toString());
    setWalletAddress(response.publicKey.toString());
  }
}
```

:::note Note to myself

I always forget how to do  conditional rendering with react, but this is pretty
cool: `{condition && renderComponent()}` then `renderComponent()` is only called
if the `condition` is true.

:::

## Get local solana env running

First make sure rust is installed.

Solana has a super nice CLI that's going to be helpful later when we want to test the programs we write.

Follow instructions [here](https://docs.solana.com/cli/install-solana-cli-tools#use-solanas-install-tool)

check solana is installed `solana --version`

```
solana config set --url localhost
solana config get
```

Solana is set up to talk to our local network.
Then we need to make sure we can get a local Solana node running.
The Solana chain is run by "validators". Well — we can actually set up a validator
on our computer to test our programs with:

```
solana-test-validator
```

Jebaited, We're never going to actually use solana-test-validator manually ourselves again. 
The workflow we're going to follow will actually automatically run the validator in the background for us.

## Anchor

We're going to be using this tool called "Anchor" a lot.
It makes it really easy for us to run Solana programs locally and deploy them to
the actual Solana chain when we're ready!

Anchor is a really early project run by a few core devs.

https://github.com/project-serum/anchor

Install : https://project-serum.github.io/anchor/getting-started/installation.html#install-anchor

Check it's installed with:

    anchor --version

We'll also use Anchor's npm module and Solana Web3 JS — these both will help us connect our web app to our Solana program!

    npm install -g @project-serum/anchor @solana/web3.js

## Create a test project

let's create a test project to make sure it's working

    anchor init my_project --javascript

Next thing we need to do is generate a local Solana wallet to work with.

    solana-keygen new

To get the keypair path : `solana config get`. To get the public key: `solana address`

## Run it

now we want to:

1. Compile the program
2. Spin up `solana-test-validator` and deploy the program to our local solana network
with our wallet
3. Call functions on our deployed program

Anchor lets us do this all in one step with:

:::caution
Be sure you don't have solana-test-validator running, it will conflict w/ Anchor. 
:::

Run (inside your project), This may take a while the first time you run it! 

```bash
anchor test
```

### fixing errors

#### Error 1:

    error: failed to select a version for the requirement `anchor-lang = "^0.18.2"`

find Cargo.toml, change to 0.18.0

#### Error 2

```
Failed to obtain package metadata: Error during execution of `cargo metadata`:  Downloading crates ... 
error: failed to download `solana-sdk-macro v1.8.2`
Caused by:
  unable to get packages from source
Caused by:
  failed to parse manifest at `/home/user/.cargo/registry/src/github.com-1ecc6299db9ec823/solana-sdk-macro-1.8.2/Cargo.toml`
Caused by:
  feature `resolver` is required

  this Cargo does not support nightly features, but if you
  switch to nightly channel you can add
  `cargo-features = ["resolver"]` to enable this feature  
```

to fix it, I updated rust

```
rustup update
```

### error 3

```
Error: Cannot find module '@project-serum/anchor'
```

I think you need to install it globally (it isn't in the guide), or install it
inside the project. I asked the question in discord but got donoWalled :clown_face:.
I installed it with npm. 

## Write first solana program

Delete the **contents** of programs/myepicproject/src/lib.rs and tests/myepicproject.js.
**Don't actually delete the files, just what's in them.**

Let's write our first Solana program! This Rust code is going to live in the lib.rs file.

```rust
// import what we need
use anchor_lang::prelude::*;

// program id, gives info for Solana on how to run the program
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// everything in the module below #[program], is our program that we want to
// create handlers for that other people can call
// this lets us call our Solana program from our frontend via a fetch req
// #[text] is a macro
#[program]
pub mod myepicproject { // pub mod : public module
    use super::*;
    pub fn start_stuff_off(ctx: Context<StartStuffOff>) -> ProgramResult {
        Ok(())
    }
}

// Here, we'll basically be able to specify different account constraints
#[derive(Accounts)]
pub struct StartStuffOff {}
```

We now need to tell Anchor how we want our program to run and what function we
want to call. In `tests/myepicproject.js`:

```javascript
const anchor = require('@project-serum/anchor');

const main = async () => {
  console.log("Starting test");

  // set the provider (gets the data from `solana config get` in the local env)
  // this way anchor knows to run our code locally
  anchor.setProvider(anchor.Provider.env());

  // will automatically compile our code in lib.rs and get it deployed locally
  // on a local validator (naming + folder structure is important)
  const program = anchor.workspace.Myepicproject;

  // finally, we call the function and we wait for our local validator to "mine"
  // the instruction
  const tx = await program.rpc.startStuffOff();
  console.log("Your transaction signature", tx);
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

runMain();
```

In `Anchor.toml` we need to change `[scripts]`

```toml
[scripts]
test = "node tests/myepicproject.js" 
```

## Store basic data on our contract

Solana programs are stateless, they don't hold data permanently.
But they can interact with accounts.

Accounts are basically files that programs can read and write to.
When you create a wallet on Solana — you create an "account".
But, your program can also make an "account" that it can write data to. Programs
themselves are considered "accounts".
Just remember an account isn't just like your actual wallet — it's a general way
for programs to pass data between each other. [more](https://docs.solana.com/developing/programming-model/accounts)

```rust
#[program]
pub mod myepicproject { // pub mod : public module
    use super::*;
    pub fn start_stuff_off(ctx: Context<StartStuffOff>) -> ProgramResult {
        // get a reference to the account
        let base_account = &mut ctx.accounts.base_account;
        // initialize a variable
        base_account.total_quotes = 0;

        Ok(())
    }
}

// Here, we'll basically be able to specify different account constraints
// Attach certain variables to the StartStuffOff context
#[derive(Accounts)]
pub struct StartStuffOff<'info> {

    // 2. we specify how to initialize it and what to hold
    // tell solana how to initialize it
    // init : create a new account owned by the program
    // payer = user : tells who's paying for the account to be created (here: the user calling the function)
    // space = 9000 : allocate 9K bytes for the account
    #[account(init, payer = user, space = 9000)] 
    pub base_account: Account<'info, BaseAccount>,

    // data passed into the program to prove that the user calling it actually owns their wallet account
    #[account(mut)]
    pub user: Signer<'info>,

    // reference to the SystemProgram that runs Solana
    // one of the main things it does is create accounts on Solana
    // it has an id of 11111111111111111111111111111111
    pub system_program: Program <'info, System>,
}

// 1. Tell solana what we want to store on this account
//    we want a "BaseAccount" containing the total number of quotes
//    then in StartStuffOff ...
#[account]
pub struct BaseAccount {
    pub total_quotes: u64,
}

```

One important thing to note is that we need to pay rent for the storage. Remember
accounts are like files, so we need storage to store them.
If we store data on an account, we need to pay for it. Storage rent can be paid
via one of two methods:

* Set it & forget it: **accounts with 2-years worth of rent deposits secured are
exempt from network rent charges**. By maintaining this minimum-balance, the broader
network benefits from reduced liquidity and the account holder can rest assured
that their `Account::data` will be retained for continual access/usage. You can
close an account to reclaim back the deposit.
* Pay per byte: if an account has less than 2-years worth of deposited rent the
network charges rent on a per-epoch basis, in credit for the next epoch.

To know how to calculate them : [here](https://docs.solana.com/developing/programming-model/accounts#calculation-of-rent)

Now inside myepicproject.js

```javascript
const anchor = require('@project-serum/anchor');

// Need the system program, will talk about this soon.
const { SystemProgram } = anchor.web3;

const main = async() => {
  console.log("🚀 Starting test...")

  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Myepicproject;
	
	// Create an account keypair for our program to use.
  const baseAccount = anchor.web3.Keypair.generate();

  // Call start_stuff_off, pass it the params it needs!
  let tx = await program.rpc.startStuffOff({
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
    signers: [baseAccount],
  });

  console.log("📝 Your transaction signature", tx);

  // Fetch data from the account.
  let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('👀 GIF Count', account.totalGifs.toString())
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();
```

Let's add a function to modify the data (in lib.rs):

```rust
// inside myepicproject
pub fn add_quote(ctx: Context<AddQuote>) -> ProgramResult {
    // Get a reference to the account and increment total_quotes.
    let base_account = &mut ctx.accounts.base_account;
    base_account.total_quotes += 1;
    Ok(())
}


// outside, at the end

// Specify what data we want in the AddQuote context
// we create a Context named AddQuote that has access to a mutable ref to base_account
#[derive(Accounts)]
pub struct AddQuote<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
}

```

test in the js

```javascript
await program.rpc.addQuote({
  accounts: {
    baseAccount: baseAccount.publicKey,
  }
});

// fetch data from the account
account = await program.account.baseAccount.fetch(baseAccount.publicKey)
console.log('👀 Quotes Count', account.totalQuotes.toString())
```

## Store structs on our program

let's define a struct to store more data in the rs file:

```rust
// Create a custom struct for us to work with.
#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ItemStruct {
    pub quote: String,
    pub user_address: Pubkey,
}

#[account]
pub struct BaseAccount {
    pub total_quote: u64,
	// Attach a Vector of type ItemStruct to the account.
    pub quote_list: Vec<ItemStruct>,
}
```

then add it to function

```rust
pub fn add_quote(ctx: Context<AddQuote>, quote_u: String) -> ProgramResult {
  let base_account = &mut ctx.accounts.base_account;
  
// Build the struct.
  let item = ItemStruct {
    quote: quote_u.to_string(),
    user_address: *base_account.to_account_info().key,
  };
  
// Add it to the quote_list vector.
  base_account.quote_list.push(item);
  base_account.total_quote += 1;
  Ok(())
}
```

in the js

```javascript
await program.rpc.addQuote("You need to put your name in the hat.", {
  accounts: {
    baseAccount: baseAccount.publicKey,
  },
});

// fetch data from the account
account = await program.account.baseAccount.fetch(baseAccount.publicKey)
console.log('👀 Quotes Count', account.totalQuote.toString());

console.log('Quote List', account.quoteList);
```

## deploy to the devnet

we'll need to do is deploy to the devnet. This is a network run by Solana that runs on fake SOL.
Make sure solana-test-validator is not running anywhere.

switch to devnet: 

    solana config set --url devnet

if you run:

    solana config get

you should see https://api.devnet.solana.com. 

we'll need to airdrop ourselves some SOL on the devnet

    solana airdrop 5

5 is the max you can airdrop yourself at a time right now. 

In `Anchor.toml`, change:

* `[programs.localnet]` to `[programs.devnet]`.
* change `cluster = "localnet"` to `cluster = "devnet"`

now run

  anchor build

This will create a new build for us with a program id. We can access it by running:

    solana address -k target/deploy/myepicproject-keypair.json

Copy it: BmQTd5aycXm8WFJFe3L3LJ3sU84SsEnW5JMg3UFQJsgd

Now in `lib.rs` we can see

    declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

it's an id initially generated by anchor init that specifies our program's id.
That's important because the id of the program specifies how to load and execute
the program and contains info on how the Solana runtime should execute the program.

The program id also helps the Solana runtime see all the accounts created by the
program itself. With this ID, Solana can quickly see all the accounts generated
by the program and easily reference them.

We need to change this program id in `declare_id!` to the one output by
`solana address -k target/deploy/myepicproject-keypair.json`. The one provided
by `anchor init` was just a placeholder.

Now, go to `Anchor.toml` and under `[programs.devnet]` you'll see something like
`myepicproject = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"`. Go ahead and
change this id to the same id output when you run
`solana address -k target/deploy/myepicproject-keypair.json`.

Finally, we need to run the build command again:

    anchor build

Because we want to actually build the project w/ our new program id! Anchor
generates certain files upon a build under the target directory and we want to
make sure those generated files have the latest and greatest program id.

Now deploy to the devnet:

    anchor deploy

it's deployed: https://explorer.solana.com/address/BmQTd5aycXm8WFJFe3L3LJ3sU84SsEnW5JMg3UFQJsgd?cluster=devnet

If we do

    anchor test

We are running our tests directly on the devnet.
When you ran `anchor test`, it'll actually re-deploy the program and then run
all the functions on the script.

Solana programs are upgradeable. When we re-deploy, we're updating the same
program id to point to the latest version of the program we deployed. The accounts
that the programs talk to will stick around — remember, these accounts keep data
related to the program.
That means we can upgrade programs while keeping the data piece separate.

## hooking up the idl file to the web app

The first thing we need is the idl file that was magically output by `anchor build`.

You should see it in target/idl/mysolanaapp.json.

The idl file is actually just a JSON file that has some info about our Solana
program like the names of our functions and the parameters they accept.

You'll also see near the bottom it has our program id! This is how our web app
will know what program to actually connect to. 

Go ahead and copy all the content in target/idl/mysolanaapp.json.

In the src directory of your react app create an empty file named `idl.json`. It
should be in the same directory as `App.js`. Paste it the content.

Finally, in `App.js`, go ahead and drop this in as an import:

```javascript
import idl from './idl.json';
```

Right now, Phantom is probably connected to the Solana Mainnet. We need it to
connect to the Solana Devnet. You can change this by going to the settings (click
the little gear on the bottom right) , click "Change Network", and then click
"Devnet". That's it!

We also need to fund our Phantom wallet w/ some fake SOL.

    solana airdrop 5 INSERT_YOUR_PHANTOM_PUBLIC_ADDRESS_HERE --url https://api.devnet.solana.com

### setup a solana provider on the web app

    npm install @project-serum/anchor @solana/web3.js

First we need a bunch of things:

```javascript
import { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import { Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';
import {
  Program, Provider, web3
} from '@project-serum/anchor';

import idl from './idl.json';

// SystemProgram is a reference to the Solana runtime!
// (the core program that runs Solana)
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
let baseAccount = Keypair.generate();

// Get our program's id form the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devent.
const network = clusterApiUrl('devnet');

// Control's how we want to acknowledge when a transaction is "done".
// we can choose when to receive a confirmation for when the transaction has succeeded
const opts = {
  // In this case, we simply wait for our transaction to be confirmed by the node
  // we're connected to.
  preflightCommitment: "processed"
  //  if you wanna be super super sure you may use something like "finalized" instead
}

// All your other Twitter and GIF constants you had.

const App = () => {
	// All your other code.
}
```

Let's create a function called `getProvider`.
This is basically us creating a provider which is an authenticated connection to
Solana. To make a provider we need a connected wallet.

```javascript
const getProvider = () => {
  const connection = new Connection(network, opts.preflightCommitment);
  const provider = new Provider(
    connection, window.solana, opts.preflightCommitment,
  );
	return provider;
}
```

You can't communicate with Solana at all unless you have a connected wallet. We
can't even retrieve data from Solana unless we have a connected wallet!

// TODO: take notes (starting from last point of section 3)