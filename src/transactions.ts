import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { Transaction } from './interfaces/transaction';
import { Params } from './params';

// Set streams in append mode
const streamMINT = fs.createWriteStream(path.join(__dirname, 'out/MINT.txt')/*, { flags: 'a' }*/);
const streamSEND = fs.createWriteStream(path.join(__dirname, 'out/SEND.txt')/*, { flags: 'a' }*/);

// Manage transactions
export class Transactions {

    constructor() { };

    async fetchTX(p: Params) {
        return new Promise<any>(async (resolve) => {
            await axios.get(`${p.API_URL}?module=account&action=txlist&address=${p.watch_address}&startblock=${p.last_block}&endblock=${p.MAX_BLOCK}&sort=asc`)
                .then(res => resolve(res))
                .catch(err => resolve(err.response))
        });
    };

    writeTX(p: Params, elem: Transaction) {
        streamMINT.write(`MINT ${elem.value} ${elem.from}` + '\n');
        streamSEND.write(`SEND ${elem.value} ${p.custody_address}` + '\n');
    };

    updateBlock(p: Params, i: number, elem: [Transaction]) {
        if (i === elem.length - 1) {
            console.log('Last block - before', p.last_block);
            p.last_block = Number.parseInt(elem[elem.length - 1].blockNumber, 10) + 1;
            console.log('Last block - after B', p.last_block);
        };
    };

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
                    };
                };
            };
        };
    };

    stopTX(error: string) {
        console.log(error);
        streamMINT.end;
        streamSEND.end;
        process.exit();
    }
};