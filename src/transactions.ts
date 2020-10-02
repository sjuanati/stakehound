import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { Transaction } from './interfaces/transaction';
import { Params } from './params';

// Set streams in overwrite mode (reloading history when service is launched)
const streamMINT = fs.createWriteStream(path.join(__dirname, 'out/MINT.txt'));
const streamSEND = fs.createWriteStream(path.join(__dirname, 'out/SEND.txt'));

// Manage transactions
export class Transactions {

    constructor() { };

    // Fetch transactions by watch address & block number from Ropsten API
    async fetchTX(p: Params) {
        return new Promise<any>(async (resolve) => {
            await axios.get(`${p.API_URL}?module=account&action=txlist&address=${p.watch_address}&startblock=${p.last_block}&endblock=${p.MAX_BLOCK}&sort=asc`)
                .then(res => resolve(res))
                .catch(err => (!err.response) ? resolve({ status: 404 }) : resolve(err.response))
        });
    };

    // Write transaction data into MINT & SEND files
    writeTX(p: Params, elem: Transaction): void {
        streamMINT.write(`MINT ${elem.value} ${elem.from}` + '\n');
        streamSEND.write(`SEND ${elem.value} ${p.custody_address}` + '\n');
        console.log(`Tx from sender ${elem.from} and value ${elem.value} has been recorded`);
    };

    // Save block+1 from latest transaction as starting point for the next API fetch (optimization)
    getLastBlock(elem: Transaction[]): number {
        return Number.parseInt(elem[elem.length - 1].blockNumber, 10) + 1;
    };

    // Go through all incoming transactions at the watch address
    processTX(p: Params, elem: Transaction[]): void {
        //Discard potential API returns with wrong data
        if (elem.length > 0) {
            for (let i = 0; i < elem.length; i++) {
                // Check if API returns the expected fields: 'from', 'to', 'value'
                if (elem[i].blockNumber && elem[i].from && elem[i].to) {
                    // Only incoming transactions
                    if (p.watch_address.toLowerCase() === elem[i].to) {
                        this.writeTX(p, elem[i]);
                        // Update latest block
                        if (i === elem.length - 1) {
                            p.last_block = this.getLastBlock(elem);
                        }
                    };
                };
            };
        };
    };

    // When any critical error, stop the application (e.g.: wrong API URL)
    stopTX(error: string): void {
        console.log(error);
        streamMINT.end;
        streamSEND.end;
        process.exit();
    }
};
