import express, { Request, Response } from 'express';
import { exec } from 'child_process';

const app = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3031;

// List of commands to execute
const commands: string[] = [
  'git pull',
  'pm2 stop pacs-live',
  'npm run build',
  'pm2 reload pacs-live'
];

// Function to execute commands iteratively
function executeCommands(commands: string[], index: number, callback: (error: Error | null, result?: string) => void) {
  if (index >= commands.length) {
    // All commands executed successfully
    callback(null, 'Deployment successful');
    return;
  }

  const command: string = commands[index];
  exec(command, (error, stdout, stderr) => {
    if (error) {
      // Error executing the command
      callback(error);
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
