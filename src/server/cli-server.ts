import express from 'express';

export class CliServer {
    private app: express.Application;
    private port: number;

    constructor(port: number) {
        this.app = express();
        this.port = port;
        this.setupRoutes();
    }

    private setupRoutes() {
        this.app.use(express.json());

        this.app.post('/a', (req, res) => {
            res.send('Hello World from endpoint A');
        });

        this.app.post('/b', (req, res) => {
            res.send('Hello World from endpoint B');
        });

        this.app.post('/c', (req, res) => {
            res.send('Hello World from endpoint C');
        });
    }

    public listen() {
        this.app.listen(this.port, () => {
        });
    }
}
