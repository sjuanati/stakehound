# StakeHound Challenge


## Goal

The goal of this application is to continuously listen for transactions of the ETH token on the Ethereum blockchain (Ropsten) going to a specified address, and perform a set of actions for every incoming transaction.


## Installation and Running

This application requires [Node.js](https://nodejs.org/) to run.

Install the dependencies and start the server:

```sh
$ npm update
$ nodemon @param1 @param2 @param3
```

where:

@param1 = 'watch' address to listen for incoming transactions. It must be a valid address (0x...)

@param2 = 'custody' address to transfer ETH tokens. It must be a valid address (0x...)

@param3 = time interval in seconds to fetch the incoming transactions to the 'watch address'. It will be 60 seconds by default if no value is defined by parameter.

Execution example:

```sh
$ nodemon 0xb5bE4d2510294d0BA77214F26F704d2956a99072 0xc350d1EA93258BC789CEc0FbE283Dc0BA5f5A899 5
```

The output files will be stored in `root\out`:

* MINT.txt with the following content: `MIND [amount] [sender_address]`

* SEND.txt with the following content: `SEND [amount] [custody_address]`


## Testing

In order to launch the tests:

```sh
$ npm test
```

At the time of writing, 9 tests have been performed in 1,7s:

* Test Suites: 1 passed, 1 total
* Tests:       8 passed, 8 total
* Snapshots:   0 total
* Time:        1.723 s, estimated 2 s


## Technical Considerations

* In order to listen for incoming transactions, a 'setInterval' is executed every N seconds:

    `setInterval(function () { manageTX() }, params.timer);`
* The application will be always up & running execept if the URL for fetching transactions gives an 404 error.
* If the application stops due to any unforeseen event (server down, atomic bomb, space invaders...), all transactions will be retrieved from block 0 when restarting the app; therefore, files MINT.txt and SEND.txt will be recreated including any transaction between the downtime period and the current date.
    * Depending on the services that listen for changes in files MINT.txt and SEND.txt, it might be recommended to have a log to track all transactions already handled in order to avoid any potential double processing when the two files are recreated.
* In order to ensure the application availability, it is highly recommended to use a process manager such as 'pm2' to launch the process in background and restart it in case the server reboots:
```sh
$ npm i pm2 -g
$ pm2 start nodemon --name "stakehound deamon"
$ pm2 startup
$ pm2 save
```


## Identified Enhancements

* If the application is launched in background, all 'console.log' should be replaced by logging errors and warnings into files to further analysis.
* The tests cover a set of overall cases, but a few more are probably recommended (e.g.: mocking fs.createWriteStream)
* Verify the address checksum with web3.toChecksumAddress(address);


## Conclusion

It's been a great challenge!! Looking forward for new ones 😃

