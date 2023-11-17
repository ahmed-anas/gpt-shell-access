#!/usr/bin/env node
import ngrok from 'ngrok';
import { CliServer } from "./server/cli-server";

async function main() {
    const port = 3000;
    const server = new CliServer(port); // Assuming MyServer is the class you created for the server
    server.listen(); // Start the server

    try {
        const url = await ngrok.connect({
            
        });
        console.log(`
---------------------------------------------------------------
Use this URL and give it to GPT ${url}
---------------------------------------------------------------
`);
    } catch (error) {
        console.error('Error occurred while trying to connect ngrok:', error);
    }
}

main().catch(error => console.error('Error in main:', error));
