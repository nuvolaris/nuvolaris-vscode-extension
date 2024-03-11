import * as vscode from 'vscode';
import { NuvolarisTerminalName } from './constants';
import { NuvolarisLoginParams } from './interfaces';
import { LoginPanel } from './login/LoginPanel';
import { CliCommands } from './enumerators';
import * as fs from "fs";
import * as os from "os";

let context: vscode.ExtensionContext;

export async function activate(ctx: vscode.ExtensionContext) {
	try {
		context = ctx;
		let loggedIn = isLoggedIn();
		if (!loggedIn) LoginPanel.render(handleLogin, context.extensionUri);

		Object.entries(CliCommands).forEach(([name, command]) =>
			context.subscriptions.push(vscode.commands.registerCommand(`nuvolaris.${name.toLowerCase()}`, () => {
				if (!loggedIn) LoginPanel.render(handleLogin, context.extensionUri);
				launchTerminal(command);
			}
			)));

		context.subscriptions.push(vscode.commands.registerCommand('nuvolaris.changeuser', () => {
			let yes = "Yes";
			let no = "No";
			vscode.window.showInformationMessage("Are you sure you want to change user?", yes, no)
				.then(answer => {
					if (answer === yes) {
						LoginPanel.render(handleLogin, context.extensionUri);
					}
				})
		}));
	} catch (error: any) {
		printError(error);
		throw error;
	}
}

function isLoggedIn() {
	try {
		let isLoggedIn = false;
		switch (os.platform().toLowerCase()) {
			case "linux": {
				isLoggedIn = fs.existsSync("/root/.wskprops");
				break;
			}
			case "win32": {
				isLoggedIn = fs.existsSync(os.userInfo().homedir + "/.wskprops");
				break;
			}
			case 'aix': {
				throw new Error("Not implemented yet.")
				break;
			}
			case 'darwin': {
				throw new Error("Not implemented yet.")
				break;
			}
			case 'freebsd': {
				throw new Error("Not implemented yet.")
				break;
			}
			case 'openbsd': {
				throw new Error("Not implemented yet.")
				break;
			}
			case 'sunos': {
				throw new Error("Not implemented yet.")
				break;
			}
		}
		return isLoggedIn;
	} catch (error) {
		printError(error);
		throw error;
	}
}

function handleLogin(username: string, password: string, apiHost: string) {
	try {
		launchTerminal(`nuv -login ${apiHost} ${username} ${password}`)
	} catch (error) {
		printError(error);
		throw error;
	}
}

function launchTerminal(command: string): void {
	try {
		// If a terminal named "Nuvolaris" already exists, launch the command inside that one.
		const terminal = vscode.window.terminals.find(t => t.name === NuvolarisTerminalName) || vscode.window.createTerminal(NuvolarisTerminalName);
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