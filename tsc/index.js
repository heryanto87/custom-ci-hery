"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const child_process_1 = require("child_process"); // For running shell commands securely
const process_1 = require("process");
const app = (0, express_1.default)();
// Replace with your actual application name
const appName = process.env.APP_NAME || '';
const path = process.env.APP_PATH || '/var/www/pacs-live';
app.post('/deploy', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currentDir = (0, process_1.cwd)(); // Get current working directory
    try {
        // Optional: Authentication/authorization logic here
        // If authentication is required, implement a mechanism to validate
        // credentials before proceeding.
        console.log('Deployment initiated...');
        yield (0, process_1.chdir)(path);
        console.log(`Successfully changed directory to: ${path}`);
        // Run 'git pull'
        yield runCommand('git', ['restore', '.']);
        // Run 'git pull'
        yield runCommand('git', ['pull']);
        // Stop the application with pm2 (if running)
        yield runCommand('pm2', ['stop', appName]);
        // Install dependencies
        yield runCommand('npm', ['install']);
        // Build the application
        yield runCommand('npm', ['run', 'build']);
        // Restart the application with pm2
        yield runCommand('pm2', ['reload', appName]);
        console.log('Deployment completed successfully!');
        res.json({ message: 'Deployment successful' });
    }
    catch (error) {
        console.error('Deployment error:', error);
        res.status(500).json({ message: 'Deployment failed' });
    }
    finally {
        // Consider restoring the original working directory
        yield (0, process_1.chdir)(currentDir);
    }
}));
function runCommand(command, args) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const child = (0, child_process_1.spawn)(command, args);
            child.stdout.on('data', (data) => {
                console.log(data.toString());
            });
            child.stderr.on('data', (data) => {
                console.error(data.toString());
            });
            child.on('close', (code) => {
                if (code === 0) {
                    resolve(null);
                }
                else {
                    reject(new Error(`Command '${command} ${args.join(' ')}' failed with exit code ${code}`));
                }
            });
            child.on('error', (error) => {
                reject(error);
            });
        });
    });
}
var server = app.listen(3031, () => {
    console.log('Server listening on port 3031');
    server.timeout = 300000;
});
