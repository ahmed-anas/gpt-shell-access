import { spawn } from 'child_process';

export class CLIExecutor {
    public executeCommand(command: string, directory: string): Promise<{ output: string; success: boolean }> {
        return new Promise((resolve) => {
            const proc = spawn(command, [], { stdio: ['pipe', 'pipe', 'pipe'], shell: true, cwd: directory  });
            const outputChunks: { source: 'stdout' | 'stderr'; data: string }[] = [];

            proc.stdout.on('data', (data) => {
                outputChunks.push({ source: 'stdout', data: data.toString() });
            });

            proc.stderr.on('data', (data) => {
                outputChunks.push({ source: 'stderr', data: data.toString() });
            });

            proc.on('close', (code) => {
                const output = outputChunks.map((chunk) => chunk.data).join('');
                const success = code === 0;
                resolve({ output, success });
            });

            proc.on('error', (err) => {
                outputChunks.push({ source: 'stderr', data: err.message });
                const output = outputChunks.map((chunk) => chunk.data).join('');
                resolve({ output, success: false });
            });
        });
    }
}
