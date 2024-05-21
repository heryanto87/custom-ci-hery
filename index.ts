import express from 'express';
import { spawn } from 'child_process'; // For running shell commands securely
import { cwd, chdir } from 'process';

const app = express();

// Replace with your actual application name
const appName = process.env.APP_NAME || ''
const path = process.env.APP_PATH || '/var/www/pacs-live'

app.post('/deploy', async (req, res) => {
  const currentDir = cwd(); // Get current working directory
  try {
    // Optional: Authentication/authorization logic here
    // If authentication is required, implement a mechanism to validate
    // credentials before proceeding.

    console.log('Deployment initiated...');

    await chdir(path);
    console.log(`Successfully changed directory to: ${path}`);

    // Run 'git pull'
    await runCommand('git', ['pull']);

    // Stop the application with pm2 (if running)
    await runCommand('pm2', ['stop', appName]);

    // Install dependencies
    await runCommand('npm', ['install']);

    // Build the application
    await runCommand('npm', ['run', 'build']);

    // Restart the application with pm2
    await runCommand('pm2', ['reload', appName]);

    console.log('Deployment completed successfully!');
    res.json({ message: 'Deployment successful' });
  } catch (error) {
    console.error('Deployment error:', error);
    res.status(500).json({ message: 'Deployment failed' });
  } finally {
    // Consider restoring the original working directory
    await chdir(currentDir);
  }
});

async function runCommand(command: string, args: string[]) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);

    child.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    child.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(null);
      } else {
        reject(new Error(`Command '${command} ${args.join(' ')}' failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

app.listen(3031, () => console.log('Server listening on port 3031'));
