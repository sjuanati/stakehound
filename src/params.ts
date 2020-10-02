// Manage service parameters
export class Params {

    DEFAULT_TIMER: number = 60 * 1000;
    MAX_BLOCK: number = 99999999;
    API_URL: string = 'https://api-ropsten.etherscan.io/api';
    last_block: number = 0;
    timer: number;
    watch_address: string;
    custody_address: string;

    constructor(in_watch: string, in_custody: string, in_timer: string) {
        const parsed_timer = Number.parseInt(in_timer) * 1000;
        this.timer = (parsed_timer) ? parsed_timer : this.DEFAULT_TIMER;
        this.watch_address = in_watch;
        this.custody_address = in_custody;
    };

    // Check if syntaxis for account address is OK
    isValidAddress(addr: string): boolean {
        return (/^(0x)?[0-9a-f]{40}$/i.test(addr));
    };

    // Check syntaxis for both watch and account addresses before start listening to tx's
    checkAddress(): boolean {
        if (!this.isValidAddress(this.watch_address)) {
            console.log('Error: Invalid watch address: ', this.watch_address);
            return false;
        } else if (!this.isValidAddress(this.custody_address)) {
            console.log('Error: Invalid custody address: ', this.custody_address);
            return false;
        } else {
            return true;
        };
    };
};
