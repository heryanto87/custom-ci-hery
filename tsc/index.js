"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const child_process_1 = require("child_process");
const app = (0, express_1.default)();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3031;
const appName = process.env.APP_NAME;
const path = process.env.APP_PATH;
// List of commands to execute
const commands = [
    `cd ${path}`,
    'git pull',
    `pm2 stop ${appName}`,
    'npm install',
    'npm run build',
    `pm2 reload ${appName}`
];
// Function to execute commands iteratively
function executeCommands(commands, index, callback) {
    if (index >= commands.length) {
        // All commands executed successfully
        callback(null, 'Deployment successful');
        return;
    }
    const command = commands[index];
    (0, child_process_1.exec)(command, (error, stdout, stderr) => {
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
app.get('/deploy', (req, res) => {
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
