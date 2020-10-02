import axios from 'axios';
import { Params, Transactions, checkParams } from '../index';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const watch_address = '0xb5bE4d2510294d0BA77214F26F704d2956a99072';
const custody_address = '0xc350d1EA93258BC789CEc0FbE283Dc0BA5f5A899';
const sender_address = '0x1c10a5aabc2555ee3027d5758c4b7b462605f972';
const timer = 3000

describe('Check service parameters: all fields OK', () => {
    const params = new Params(watch_address, custody_address, timer);

    it('isInterval', () => {
        expect(params.timer).toBe(3000);
    });

    it('isValidAddress', () => {
        expect(checkParams(params)).toBe(true);
    });
});

describe('Check service parameters: all fields KO', () => {
    const params = new Params('foo', 'bar', NaN);

    it('isInterval', () => {
        expect(params.timer).toBe(5000);
    });

    it('isValidAddress', () => {
        expect(checkParams(params)).toBe(false);
    });
});

/*
test(`Check Ropsten transactions correctness`, () => {
    const params = new Params(watch_address, custody_address, timer);
    const tx = [{blockNumber: '1000', from: sender_address, to: watch_address, value: '500000'}];
    const res = {data: {result: tx}};
    
    mockedAxios.get.mockResolvedValue(res);

    return Transactions.fetchTX(params).then(data => expect(data).toEqual(tx));
});
*/



