import express, { Request, Response } from 'express';
import { z } from 'zod';
import { CLIExecutor } from './cli-executor';

const outputLimit = 3000;

enum RunStatus {
    Success = "success",
    Failure = "failure",
    Skipped = "skipped"
}

// Define the single command result schema separately
const CommandResultItemSchema = z.object({
    command: z.string().describe("The command that was attempted to be executed."),
    output: z.string().optional().describe(`The combined standard output and standard error output of the executed command. if the length is more than ${outputLimit} charactesr, it will be trimmed.`),
    runStatus: z.nativeEnum(RunStatus).describe("The status of the command execution: 'success' if the command exited with code 0, 'failure' if it exited with a non-zero code, and 'skipped' if the command was not executed due to a failure in a previous command.")
});

// Now reference CommandResultItemSchema within an array for the CommandResultSchema
const CommandResultSchema = z.object({
    results: z.array(CommandResultItemSchema).describe("The array of results for the executed commands.")
});

const CommandSchema = z.object({
    commands: z.array(z.object({
        command: z.string().describe("The command to be executed."),
        workingDir: z.string().optional().default(process.cwd()).describe("The working directory in which the command is executed. Defaults to the current working directory of the application.")
    })).describe("The array of commands to be executed.")
}).passthrough();

// Infer the types from the schemas
type Command = z.infer<typeof CommandSchema>;
type CommandResultItem = z.infer<typeof CommandResultItemSchema>;
type CommandResult = z.infer<typeof CommandResultSchema>;


export class CliServer {
    private app: express.Application;
    private port: number;
    private finalUrl: string = "not yet updated, refresh page and try again"
    private publicIp: string = "not yet updated, refresh page and try again"
    private cliExecutor = new CLIExecutor();

    constructor(port: number) {
        this.app = express();
        this.port = port;
        this.setupRoutes();
    }

    private setupRoutes() {
        this.app.use(express.json());

        this.app.get('/', (req: Request, res: Response) => {
            res.status(200).send(`<pre>
            Hello!
            Your public IP is ${this.publicIp}

            Your finalUrl is ${this.finalUrl}

            if you are encountering any issues, open the final URL and give it the public IP
            make sure to give chatgpt you final URL that is displayed here.
            `);
        })

        this.app.post('/run-commands', (req, res) => this.mainHandler(req, res));
        this.app.post('/', (req, res) => this.mainHandler(req, res));
    }

    public init(finalUrl: string, publicIp: string) {
        this.finalUrl = finalUrl;
        this.publicIp = publicIp;
    }

    private async mainHandler(req: Request, res: Response) {
        console.log('received request ' + JSON.stringify(req.body));
        try {
            const commandsResult = CommandSchema.safeParse(req.body);
            if (!commandsResult.success) {
                console.log(`sending response: Invalid command format`)
                return res.status(400).json({ error: "Invalid command format" });
            }

            const commands = commandsResult.data.commands;
            let lastFailure = false;
            const commandResults: CommandResultItem[] = [];

            for (const cmd of commands) {
                if (lastFailure) {
                    commandResults.push({
                        command: cmd.command,
                        runStatus: RunStatus.Skipped
                    });
                    continue;
                }

                const result = await this.cliExecutor.executeCommand(cmd.command, cmd.workingDir);

                commandResults.push({
                    command: cmd.command,
                    runStatus: result.success ? RunStatus.Success : RunStatus.Failure,
                    output: result.output.length > outputLimit
                        ? result.output.substring(0, outputLimit) + `... rest of output trimmed because it is greater than ${outputLimit} characters.`
                        : result.output
                });

                if (!result.success) {
                    lastFailure = true;
                }
            }

            console.log(`sending response: ${JSON.stringify(commandResults)}`)
            res.json({ results: commandResults });
        } catch (error) {
            console.log(`sending response: Internal server error`)
            res.status(500).json({ error: "Internal server error" });
        }
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}`);
        });
    }
}
