import { Params } from './params';
import { Transactions } from './transactions';

// Service parameters
const in_watchAddress: string = process.argv[2];    // Account address to receive ETH tokens
const in_custodyAddress: string = process.argv[3];  // Account address to transfer ETH tokens
const in_timer: string = process.argv[4];           // Time interval to listen for transactions

// Core service
const main = async () => {

    console.log('Service is running...')
    const params = new Params(in_watchAddress, in_custodyAddress, in_timer);
    
    if (params.checkAddress()) {

        const tx = new Transactions();

        const manageTX = async () => {
            const res = await tx.fetchTX(params);
            (res.status === 404) 
                ? tx.stopTX('Error: URL not found / no connection -> Service stopped')
                : (res.data.status) 
                    ? (res.data.status === '1')
                        ? tx.processTX(params, res.data.result)
                        : null
                    : console.log('Warning: invalid data retrieved');
        };
       
        setInterval(function () { manageTX() }, params.timer);
    };
};

main();
