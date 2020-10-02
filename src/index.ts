import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

interface Transaction {
    blockNumber: string,
    timeStamp: string,
    hash: string,
    nonce: string,
    blockHash: string,
    transactionIndex: string,
    from: string,
    to: string,
    value: string,
    gas: string,
    gasPrice: string,
    isError: string,
    txreceipt_status: string,
    input: string,
    contractAddress: string,
    cumulativeGasUsed: string,
    gasUsed: string,
    confirmations: string,
}

// Service parameters
const in_watchAddress: string = process.argv[2];   // Account address to receive ETH tokens
const in_custodyAddress: string = process.argv[3]; // Account address to transfer ETH tokens
const in_timer = Number.parseInt(process.argv[4]) * 1000; // Interval to listen for transactions

// Set streams in append mode
const streamMINT = fs.createWriteStream(path.join(__dirname, 'out/MINT.txt')/*, { flags: 'a' }*/);
const streamSEND = fs.createWriteStream(path.join(__dirname, 'out/SEND.txt')/*, { flags: 'a' }*/);

// Manage service parameters
export class Params {

    DEFAULT_TIMER: number = 5 * 1000;
    MAX_BLOCK: number = 99999999;
    last_block: number = 0;
    timer: number;
    watch_address: string;
    custody_address: string;

    constructor(in_watch: string, in_custody: string, in_timer: number) {
        this.timer = (in_timer) ? in_timer : this.DEFAULT_TIMER;
        this.watch_address = in_watch;
        this.custody_address = in_custody;
    };
}

// Manage transactions
export class Transactions {

    constructor() { };

    async fetchTX(p: Params) {
        return new Promise<any>(async (resolve) => {
            await axios.get(`https://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${p.watch_address}&startblock=${p.last_block}&endblock=${p.MAX_BLOCK}&sort=asc`)
                .then(res => resolve(res.data))
                .catch(err => resolve(err))
        });
    };

    writeTX(p: Params, elem: Transaction) {
        streamMINT.write(`MINT ${elem.value} ${elem.from}` + '\n');
        streamSEND.write(`SEND ${elem.value} ${p.custody_address}` + '\n');
    }

    updateBlock(p: Params, i: number, elem: [Transaction]) {
        if (i === elem.length - 1) {
            console.log('Last block - before', p.last_block);
            p.last_block = Number.parseInt(elem[elem.length - 1].blockNumber, 10) + 1;
            console.log('Last block - after B', p.last_block);
        }
    }

    processTX(p: Params, elem: [Transaction]) {
        if (elem.length > 0) {
            for (let i = 0; i < elem.length; i++) {
                // Check if API returns the expected fields: 'from', 'to', 'value'
                if (elem[i].blockNumber && elem[i].from && elem[i].to) {
                    // Only incoming transactions
                    if (p.watch_address.toLowerCase() === elem[i].to) {
                        // Write result/s in files MINT.txt and SEND.txt
                        this.writeTX(p, elem[i]);
                        // Optimization: Save last block + 1 as starting point for the next API query
                        this.updateBlock(p, i, elem);
                    }
                }
            };
        }
    }
};

// Check whether input parameters are valid
export const checkParams = (p: Params) => {

    const isValidAddress = (addr: string): boolean => {
        return (/^(0x)?[0-9a-f]{40}$/i.test(addr));
    }

    if (!isValidAddress(p.watch_address)) {
        console.log('Error: Invalid watch address: ', p.watch_address);
        return false;
    } else if (!isValidAddress(p.custody_address)) {
        console.log('Error: Invalid custody address: ', p.custody_address);
        return false;
    } else {
        return true;
    }
}

const main = async () => {

    const params = new Params(in_watchAddress, in_custodyAddress, in_timer);

    if (checkParams(params)) {

        const tx = new Transactions();

        const manageTX = async () => {
            const res = await tx.fetchTX(params);
            (res.status)
                ? (res.status === '1')
                    ? tx.processTX(params, res.result) 
                    : null
                : console.log('Error: ', res);
        }

        setInterval(function () { manageTX() }, params.timer); // Obs: el 1er cop tb trigarà timer segons en executar-se
    }
};

main();

// 1st execution vs. later executions (append, ....)



// ENHANCEMENTS
// Verify address checksum with web3.toChecksumAddress(address)
// Write errors into log file
// web3 listening to smart contract logs instead of API calls every N seconds









// Retrieve Transactions through Ropsten API and write them into MINT & SEND files
/*
const handleTX = (p: Params) => {
    return new Promise<boolean>(async (resolve) => {
        await axios.get(`https://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${p.watch_address}&startblock=${p.last_block}&endblock=${p.MAX_BLOCK}&sort=asc`
        ).then(res => {
            const elem = res.data.result;
            if (elem.length > 0) {
                for (let i = 0; i < elem.length; i++) {
                    //console.log(elem[i]);
                    // Check if API returns the expected fields: 'from', 'to', 'value'
                    if (elem[i].blockNumber && elem[i].from && elem[i].to) {

                        // Only incoming transactions
                        if (in_watchAddress.toLowerCase() === elem[i].to) {

                            // Write result/s in files MINT.txt and SEND.txt
                            streamMINT.write(`MINT ${elem[i].value} ${elem[i].from}` + '\n');
                            streamSEND.write(`SEND ${elem[i].value} ${in_custodyAddress}` + '\n');

                            // Optimization: Save last block + 1 as starting point for the next API query
                            if (i === elem.length - 1) {
                                console.log('Last block - before', p.last_block);
                                p.last_block = Number.parseInt(elem[elem.length - 1].blockNumber, 10) + 1;
                                console.log('Last block - after B', p.last_block);
                            }
                        }
                    }
                };
            }
            resolve(true);
        }).catch(err => {
            console.log('Error in handleTX(): ', err);
            resolve(false);
        });
    });
};
*/