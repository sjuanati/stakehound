import axios from 'axios';
//import fs from 'fs';
import { Params } from '../params';
import { Transactions } from '../transactions';
import { elems } from './data';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock fs
// @ts-ignore
jest.mock('fs', () => ({
    createWriteStream: jest.fn(() => ({
        write: jest.fn(),
        end: jest.fn()
    }))
}));

// Reset mock function calls on every test
afterEach(() => {
    jest.clearAllMocks();
});

// Default service parameters
const watch_address = '0xb5bE4d2510294d0BA77214F26F704d2956a99072';
const custody_address = '0xc350d1EA93258BC789CEc0FbE283Dc0BA5f5A899';
const sender_address = '0x1c10a5aabc2555ee3027d5758c4b7b462605f972';
const timer = '3';

describe('Check service parameters: correct fields', () => {
    const p = new Params(watch_address, custody_address, timer);

    it('constructor', () => {
        expect(p.watch_address).toBe(watch_address);
        expect(p.custody_address).toBe(custody_address);
        expect(p.timer).toBe(3000);
        expect(p.last_block).toBe(0);
        expect(p.DEFAULT_TIMER).toBe(60000);
        expect(p.MAX_BLOCK).toBe(99999999);
    });
    it('isInterval', () => {
        expect(p.timer).toBe(3000);
    });
    it('isValidAddress', () => {
        expect(p.checkAddress()).toBe(true);
    });
});

describe('Check service parameters: wrong fields', () => {
    const p = new Params('foo', 'bar', '');

    it('isInterval', () => {
        expect(p.timer).toBe(60000);
    });
    it('isValidAddress', () => {
        expect(p.checkAddress()).toBe(false);
    });
});

test('API response: data retrieved', async () => {
    const p = new Params(watch_address, custody_address, timer);
    const tx = new Transactions();
    const tx_sample = [{ blockNumber: '1000', from: sender_address, to: watch_address, value: '500000' }];
    const res = { status: 200, data: { status: '1', result: tx_sample } };
    mockedAxios.get.mockResolvedValue(res);

    return tx.fetchTX(p).then(data => {
        expect(data).toEqual(res);
        expect(data).toHaveReturned;
        expect(data.status).toBe(200);
        expect(data.data.result).toHaveLength(1);
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    });
});

test('API response: error', async () => {
    const p = new Params(watch_address, custody_address, timer);
    p.API_URL = 'https://wrong.address';
    const tx = new Transactions();
    const res = { status: 404, data: 'Error description in HTML' };
    mockedAxios.get.mockResolvedValue(res);

    return tx.fetchTX(p).then(data => {
        expect(data).toEqual(res);
        expect(data).toHaveReturned;
        expect(data.status).not.toBe(200);
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    });
});

describe('Transaction: Get last block', () => {
    const p = new Params(watch_address, custody_address, timer);
    const tx = new Transactions();

    it('getLastBlock', () => {
        expect(tx.getLastBlock(elems)).toBeGreaterThan(p.last_block);
        expect(tx.getLastBlock(elems)).toBe(8802783);
        expect(tx.getLastBlock(elems)).toHaveReturned;
    });
});

describe('Transaction: Process tx', () => {
    const p = new Params(watch_address, custody_address, timer);
    const tx = new Transactions();

    tx.processTX(p, elems);

    it('processTX', () => {
        expect(p.last_block).toBe(8802783);
    });
});
