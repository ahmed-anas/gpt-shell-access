import express, { Request, Response } from 'express';
import { z } from 'zod';
import { CLIExecutor } from './cli-executor';

enum RunStatus {
    Success = "success",
    Failure = "failure",
    Skipped = "skipped"
}

// Define the single command result schema separately
const CommandResultItemSchema = z.object({
    command: z.string().describe("The command that was attempted to be executed."),
    output: z.string().optional().describe("The combined standard output and standard error output of the executed command."),
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
    private cliExecutor = new CLIExecutor();

    constructor(port: number) {
        this.app = express();
        this.port = port;
        this.setupRoutes();
    }

    private setupRoutes() {
        this.app.use(express.json());

        this.app.get('/', (req: Request, res: Response) => {
            res.status(200).send('hello world');
        })

        this.app.post('/run-commands', async (req: Request, res: Response) => {
            console.log('received request ' + JSON.stringify(req.body));
            try {
                const commandsResult = CommandSchema.safeParse(req.body);
                if (!commandsResult.success) {
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
                        output: result.output
                    });

                    if (!result.success) {
                        lastFailure = true;
                    }
                }

                res.json({ results: commandResults });
            } catch (error) {
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}`);
        });
    }
}
