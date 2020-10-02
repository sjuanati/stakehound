import axios from 'axios';
import { Params } from '../params';
import { Transactions } from '../transactions';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock fs
jest.mock('fs');

// Reset mock function calls before every test
afterEach(() => {
    jest.clearAllMocks();
});

// Default service parameters
const watch_address = '0xb5bE4d2510294d0BA77214F26F704d2956a99072';
const custody_address = '0xc350d1EA93258BC789CEc0FbE283Dc0BA5f5A899';
const sender_address = '0x1c10a5aabc2555ee3027d5758c4b7b462605f972';
const timer = '3';

describe('Check service parameters: correct fields', () => {
    const params = new Params(watch_address, custody_address, timer);

    it('isInterval', () => {
        expect(params.timer).toBe(3000);
    });
    it('isValidAddress', () => {
        expect(params.checkAddress()).toBe(true);
    });
});

describe('Check service parameters: wrong fields', () => {
    const params = new Params('foo', 'bar', '');

    it('isInterval', () => {
        expect(params.timer).toBe(5000);
    });
    it('isValidAddress', () => {
        expect(params.checkAddress()).toBe(false);
    });
});

test('API response: data retrieved', async () => {
    const params = new Params(watch_address, custody_address, timer);
    const transaction = new Transactions();
    const tx = [{ blockNumber: '1000', from: sender_address, to: watch_address, value: '500000' }];
    const res = { status: 200, data: { status: '1', result: tx } };
    mockedAxios.get.mockResolvedValue(res);

    return transaction.fetchTX(params).then(data => {
        expect(data).toEqual(res);
        expect(data).toHaveReturned;
        expect(data.status).toBe(200);
        expect(data.data.result).toHaveLength(1);
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    });
});

test('API response: error', async () => {
    const params = new Params(watch_address, custody_address, timer);
    params.API_URL = 'https://wrong.address';
    const transaction = new Transactions();
    const res = { status: 404, data: 'Error description in HTML' };
    mockedAxios.get.mockResolvedValue(res);

    return transaction.fetchTX(params).then(data => {
        expect(data).toEqual(res);
        expect(data).toHaveReturned;
        expect(data.status).not.toBe(200);
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    });
});


