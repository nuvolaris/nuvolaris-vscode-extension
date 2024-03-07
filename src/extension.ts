import * as vscode from 'vscode';
import { NuvolarisTerminalName } from './constants';
import { NuvolarisLoginParams } from './interfaces';
import { LoginPanel } from './login/LoginPanel';
import { Commands } from './enumerators';
let nuvLoginParams: NuvolarisLoginParams = {
	nuvUser: '',
	nuvApiHost: '',
	nuvPassword: ''
}
let context: vscode.ExtensionContext;

export async function activate(ctx: vscode.ExtensionContext) {
	try {
		context = ctx;
		
		Object.entries(Commands).forEach(([name, command]) =>
			context.subscriptions.push(vscode.commands.registerCommand(`nuvolaris.${name.toLowerCase()}`, () => {
				if (loginIfNotAlreadyLoggedIn()) launchTerminal(command);
			}
			)));

		context.subscriptions.push(vscode.commands.registerCommand('nuvolaris.changeuser', () => {
			let yes = "Yes";
			let no = "No";
			vscode.window.showInformationMessage("Are you sure you want to change user?", yes, no)
				.then(answer => {
					if (answer === yes) {
						clearEnvironmentVariables();
						loginIfNotAlreadyLoggedIn();
					}
				})
		}));
	} catch (error: any) {
		printError(error);
		throw error;
	}
}

function loginIfNotAlreadyLoggedIn() {
	try {
		let validCredentials = validateNuvolarisCredentials();
		if (validCredentials) launchLoginTerminal();
		else LoginPanel.render(handleLogin, context.extensionUri);
		return validCredentials;
	} catch (error) {
		printError(error);
		throw error;
	}
}


function handleLogin(username: string, password: string, apiHost: string) {
	try {
		updateNuvolarisLoginParams(username, password, apiHost);
		let loginTerminalStatus = launchLoginTerminal();
		// if (loginTerminalStatus?.code){
		// 	LoginPanel.currentPanel?.dispose();

		// }

	} catch (error) {
		printError(error);
		throw error;
	}
}

function validateNuvolarisCredentials() {
	try {
		let { nuvUser, nuvApiHost, nuvPassword } = nuvLoginParams;
		return nuvUser && nuvApiHost && nuvPassword;
	} catch (error) {
		printError(error);
		throw error;
	}
}

function updateNuvolarisLoginParams(nuvUser: string, nuvPassword: string, nuvApiHost: string) {
	try {
		nuvLoginParams = {
			nuvUser: nuvUser,
			nuvApiHost: nuvApiHost,
			nuvPassword: nuvPassword
		}
		
	} catch (error) {
		printError(error);
		throw error;
	}
}

function clearEnvironmentVariables() {
	try {
		nuvLoginParams = {
			nuvUser: '',
			nuvApiHost: '',
			nuvPassword: ''
		}
		
	} catch (error) {
		printError(error);
		throw error;
	}
}

function launchLoginTerminal() {
	// launchTerminal('nuv -login')
	try {
		return launchTerminal(`nuv -login ${nuvLoginParams.nuvApiHost} ${nuvLoginParams.nuvUser} ${nuvLoginParams.nuvPassword}`)
	} catch (error) {
		printError(error);
		throw error;
	}
}

function launchTerminal(command: string) {
	try {
		// If a terminal named "Nuvolaris" already exists, launch the command inside that one.
		const terminal = vscode.window.terminals.find(t => t.name === NuvolarisTerminalName) || vscode.window.createTerminal(NuvolarisTerminalName);
		terminal.show();
		terminal.sendText(command, true);
		return terminal
	} catch (error) {
		printError(error);
		throw error;
	}
}





function printError(error: any) {
	return vscode.window.showErrorMessage("Error occurred", error.toString());
}