import * as vscode from 'vscode';
import { NuvolarisTerminalName } from './constants';
import { LoginPanel } from './login/LoginPanel';
import { CliCommands } from './enumerators';
import * as fs from "fs";
import * as os from "os";
import { exec, execSync } from 'child_process';
import { stderr } from 'process';

let context: vscode.ExtensionContext;

export async function activate(ctx: vscode.ExtensionContext) {
	try {
		context = ctx;
		if (!isLoggedIn()) {
			LoginPanel.render(handleLogin, context.extensionUri);
		} 

		Object.entries(CliCommands).forEach(([name, command]) =>
			context.subscriptions.push(vscode.commands.registerCommand(`nuvolaris.${name.toLowerCase()}`, () => {
					if (!isLoggedIn()) {
						LoginPanel.render(handleLogin, context.extensionUri);
						return;
					}
				launchTerminal(command);
			}
			)));

		context.subscriptions.push(vscode.commands.registerCommand('nuvolaris.login', () => {
						LoginPanel.render(handleLogin, context.extensionUri);
		}));
	} catch (error: any) {
		printError(error);
		throw error;
	}
}

function isLoggedIn(): boolean {
	try {
		execSync('nuv -wsk namespace list');
		return true;
	} catch (error) {
		return false;
	}
	
}

function handleLogin(username: string, password: string, apiHost: string) {
	const loginOutput = vscode.window.createOutputChannel('Nuvolaris Login');
	loginOutput.show();
	try {
		loginOutput.appendLine('Launching login script...');
		const execLogin = execSync(`nuv -login ${apiHost.endsWith('/') ? apiHost.slice(0, -1) : apiHost} ${username}`, {
			env: {...process.env, NUV_PASSWORD: password}
		});
		loginOutput.appendLine(execLogin.toString());
		printInfo("You successfully logged in. You can now use the Nuvolaris command palette.")
	} catch (error: any) {
		loginOutput.appendLine(error);
		printError("An error occurred in the login process. Check the output window for further details.")
		throw error;
	}
}


function launchTerminal(command: string): void {
	try {
		const terminal = vscode.window.createTerminal(NuvolarisTerminalName);
		terminal.show();
		terminal.sendText(command, true);
	} catch (error) {
		printError(error);
		throw error;
	}
}

function printError(error: any) {
	return vscode.window.showErrorMessage("Error occurred", error.toString());
}
function printInfo(info: string) {
	return vscode.window.showInformationMessage("Info", info);

}
