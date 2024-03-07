import * as vscode from 'vscode';
import { COMMANDS, NuvolarisLoginParams } from './constants';
import { LoginPanel } from "./panels/Login";


let nuvLoginParams: NuvolarisLoginParams = {
	nuvUser: '',
	nuvApiHost: '',
	nuvPassword: ''
}
let context: vscode.ExtensionContext | null = null;
export async function activate(ctx: vscode.ExtensionContext) {
	try {
		context = ctx;
		let envUser = context.environmentVariableCollection.get('NUV_USER')?.value
		let envPassword = context.environmentVariableCollection.get('NUV_PASSWORD')?.value
		let envApiHost = context.environmentVariableCollection.get('NUV_APIHOST')?.value

		updateNuvolarisLoginParams(envUser, envPassword, envApiHost)
		Object.entries(COMMANDS).forEach(([name, command]) =>
			context!.subscriptions.push(vscode.commands.registerCommand(`nuvolaris.${name.toLowerCase()}`, () => {
				if (loginIfNotAlreadyLoggedIn()) launchTerminal(command)
			}
			)));

		context!.subscriptions.push(vscode.commands.registerCommand('nuvolaris.changeuser', () => {
			vscode.window.showInformationMessage("Are you sure you want to change user?", "Yes", "No")
				.then(answer => {
					if (answer === "Yes") {
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
		else LoginPanel.render(handleLogin, context!.extensionUri);
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
	context!.environmentVariableCollection.append('NUV_USER', nuvUser + '')
	context!.environmentVariableCollection.append('NUV_PASSWORD', nuvPassword + '')
	context!.environmentVariableCollection.append('NUV_APIHOST', nuvApiHost + '')

}

function clearEnvironmentVariables() {
	nuvLoginParams = {
		nuvUser: '',
		nuvApiHost: '',
		nuvPassword: ''
	}
	context!.environmentVariableCollection.delete('NUV_USER')
	context!.environmentVariableCollection.delete('NUV_PASSWORD')
	context!.environmentVariableCollection.delete('NUV_APIHOST')

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

