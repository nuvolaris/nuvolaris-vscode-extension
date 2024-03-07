import * as vscode from 'vscode';
import { COMMANDS, NuvolarisLoginParams } from './constants';
import { LoginPanel } from "./panels/Login";


let nuvLoginParams: NuvolarisLoginParams = {
	nuvUser: process.env.NUV_USER,
	nuvApiHost: process.env.NUV_APIHOST,
	nuvPassword: process.env.NUV_PASSWORD
}
export async function activate(context: vscode.ExtensionContext) {
	try {
		Object.entries(COMMANDS).forEach(([name, command]) =>
			context.subscriptions.push(vscode.commands.registerCommand(`nuvolaris.${name.toLowerCase()}`, () => {
				if (loginIfNotAlreadyLoggedIn(context)) launchTerminal(command)
			}
			)));
	} catch (error: any) {
		printError(error);
		throw error;
	}
}

function loginIfNotAlreadyLoggedIn(context: vscode.ExtensionContext) {
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
		storeNuvolarisCredentials(username, apiHost, password);
	} catch (error) {
		printError(error);
		throw error;
	}
}

function validateNuvolarisCredentials() {
	try {
		return nuvLoginParams.nuvUser && nuvLoginParams.nuvApiHost && nuvLoginParams.nuvPassword
	} catch (error) {
		printError(error);
		throw error;
	}
}

function storeNuvolarisCredentials(nuvUser: string | undefined, nuvApiHost: string | undefined, nuvPassword: string | undefined) {
	try {
		updateNuvolarisLoginParams(nuvUser, nuvApiHost, nuvPassword);
		launchLoginTerminal();
	} catch (error) {
		printError(error);
		throw error;
	}
}

function updateNuvolarisLoginParams(nuvUser: string | undefined, nuvApiHost: string | undefined, nuvPassword: string | undefined) {
	nuvLoginParams = {
		nuvUser: nuvUser,
		nuvApiHost: nuvApiHost,
		nuvPassword: nuvPassword
	}
	process.env.NUV_USER = nuvUser;
	process.env.NUV_APIHOST = nuvApiHost;
	process.env.NUV_PASSWORD = nuvPassword
}

function launchLoginTerminal() {
	// launchTerminal('nuv -login')
	try {
		launchTerminal(`nuv -login ${nuvLoginParams.nuvApiHost} ${nuvLoginParams.nuvUser} ${nuvLoginParams.nuvPassword}`)
	} catch (error) {
		printError(error);
		throw error;
	}
}

function launchTerminal(command: string) {
	try {
		// If a terminal named "Nuvolaris" already exists, launch the command inside that one.
		const terminal = vscode.window.terminals.find(t => t.name === "Nuvolaris") || vscode.window.createTerminal("Nuvolaris");
		terminal.show();
		terminal.sendText(command, true);
	} catch (error) {
		printError(error);
		throw error;
	}
}


function printError(error: any) {
	return vscode.window.showErrorMessage("Si è verificato un errore", error.toString());
}
