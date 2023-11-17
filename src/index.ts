#!/usr/bin/env node
import localtunnel from 'localtunnel';
import axios from 'axios';
import { CliServer } from "./server/cli-server";
const opn = require('better-opn');
import readline from 'readline';

async function main() {
    const port = 3000;
    const server = new CliServer(port);
    server.listen();

    const lt = await localtunnel({ port });
    
    const url = lt.url;

    try {
        const publicIpResponse = await axios.get('https://httpbin.org/ip');
        const publicIp = publicIpResponse.data.origin;

        server.init(url, publicIp);

        console.log(`
---------------------------------------------------------------
This is your Public IP, please copy it: ${publicIp}
We will open a the following URL and you will need to paste it there: ${url}
Press any key to continue...
---------------------------------------------------------------
`);

        await promptKeyPress();
        opn(url); // Open the browser window

        await new Promise(() => {
            lt.on('close', (resolve, reject) => {
                reject(new Error('local tunnel closed'));
            })

         })
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

function promptKeyPress() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question('', () => {
            rl.close();
            resolve(true);
        });
    });
}

main().catch(error => console.error('Error in main:', error));
