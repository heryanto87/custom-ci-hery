import express, { Request, Response } from 'express';
import { spawn } from 'child_process';

const app = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3031;
const appName = process.env.APP_NAME;
const path = process.env.APP_PATH;

// List of commands to execute
const commands: string[] = [
  `cd ${path}`,
  'git pull',
  `pm2 stop ${appName}`,
  'npm install',
  'npm run build',
  `pm2 reload ${appName}`
];

// Function to execute commands iteratively
function executeCommands(commands: string[], index: number, callback: (error: Error | null, result?: string) => void) {
  if (index >= commands.length) {
    // All commands executed successfully
    callback(null, 'Deployment successful');
    return;
  }

  const command: string = commands[index];
  const options = { shell: true }; // Run command within a shell environment
  const childProcess = spawn(command, options);

  childProcess.on('error', (error) => {
    // Error executing the command
    callback(error);
  });

  childProcess.on('exit', (code) => {
    if (code !== 0) {
      // Non-zero exit code indicates an error
      const errorMessage = `Command '${command}' exited with code ${code}`;
      callback(new Error(errorMessage));
      return;
    }

    console.log(`${command} successful`);

    // Execute the next command recursively
    executeCommands(commands, index + 1, callback);
  });
}

// Endpoint to trigger the commands
app.get('/deploy', (req: Request, res: Response) => {
  executeCommands(commands, 0, (error, result) => {
    if (error) {
      console.error(`Error during deployment: ${error.message}`);
      return res.status(500).send('Deployment failed');
    }

    res.send(result);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
