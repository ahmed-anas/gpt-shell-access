import express, { Request, Response } from 'express';
import { z } from 'zod';
import { CLIExecutor } from './cli-executor';

enum RunStatus {
    Success = "success",
    Failure = "failure",
    Skipped = "skipped"
}

const CommandSchema = z.object({
    command: z.string().describe("The command to be executed."),
    workingDir: z.string().optional().default(process.cwd()).describe("The working directory in which the command is executed. Defaults to the current working directory of the application.")
});

const CommandResultSchema = z.object({
    command: z.string().describe("The command that was attempted to be executed."),
    output: z.string().optional().describe("The combined standard output and standard error output of the executed command."),
    runStatus: z.nativeEnum(RunStatus).describe("The status of the command execution: 'success' if the command exited with code 0, 'failure' if it exited with a non-zero code, and 'skipped' if the command was not executed due to a failure in a previous command.")
});

type Command = z.infer<typeof CommandSchema>;
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

        this.app.post('/run-commands', async (req: Request, res: Response) => {
            try {
                const commandsResult = CommandSchema.array().safeParse(req.body);
                if (!commandsResult.success) {
                    return res.status(400).json({ error: "Invalid command format" });
                }

                const commands = commandsResult.data;
                let lastFailure = false;
                const results: CommandResult[] = [];

                for (const cmd of commands) {
                    if (lastFailure) {
                        // Placeholder for command execution logic
                        results.push({
                            command: cmd.command,
                            runStatus: RunStatus.Skipped
                        });
                        continue;
                    }

                    const result = await this.cliExecutor.executeCommand(cmd.command, cmd.workingDir);

                    results.push({
                        command: cmd.command,
                        runStatus: result.success ? RunStatus.Success : RunStatus.Failure,
                        output: result.output
                    });

                    if (!result.success) {
                        lastFailure = true;
                    }
                }

                res.json(CommandResultSchema.array().parse(results));
            } catch (error) {
                // Here you can handle any unexpected errors that occurred in the async operation
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
