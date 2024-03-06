import * as vscode from 'vscode';
import { COMMANDS, NuvolarisLoginParams } from './constants';
import { LoginPanel } from "./panels/Login";


let nuvLoginParams: NuvolarisLoginParams = {
	nuvUser: process.env.NUV_USER,
	nuvApiHost: process.env.NUV_APIHOST,
	nuvPassword: process.env.NUV_PASSWORD
}
export async function activate(context: vscode.ExtensionContext) {

	vscode.window.showInformationMessage('Credenziali ' + nuvLoginParams.nuvUser + ' ' + nuvLoginParams.nuvApiHost + ' ' + nuvLoginParams.nuvPassword);

	if (!validateNuvolarisCredentials()){
		LoginPanel.render(handleLogin, context.extensionUri);
	} else {
		launchLoginTerminal()
	}

	// Check ENV variables

	// Registering the commands from the COMMANDS ENUM. Attaching the launchTerminal event to each command.
	Object.entries(COMMANDS).forEach(([name, command]) => 
	context.subscriptions.push(vscode.commands.registerCommand(`nuvolaris.${name.toLowerCase()}`, () => 
		launchTerminal(command)
	)));

	
	

	
}
function handleLogin(username: string, password: string, apiHost: string) {
	// Do something with the login details
	storeNuvolarisCredentials(username, apiHost, password)
}

function launchTerminal(command: string){
	// If a terminal named "Nuvolaris" already exists, launch the command inside that one.
	const terminal = vscode.window.terminals.find(t=>t.name==="Nuvolaris") || vscode.window.createTerminal("Nuvolaris");
	terminal.show();
	terminal.sendText(command, true);   
}

function validateNuvolarisCredentials(){
	return nuvLoginParams.nuvUser && nuvLoginParams.nuvApiHost && nuvLoginParams.nuvPassword

}

function storeNuvolarisCredentials(nuvUser: string | undefined, nuvApiHost: string | undefined, nuvPassword: string | undefined){
	vscode.window.showInformationMessage('Salvo credenziali ' + nuvUser + ' ' + nuvApiHost + ' ' + nuvPassword);

	
	updateNuvLoginParams(nuvUser, nuvApiHost, nuvPassword);
	vscode.window.showInformationMessage('Credenziali OBJ ' + nuvLoginParams.nuvUser + ' ' + nuvLoginParams.nuvApiHost + ' ' + nuvLoginParams.nuvPassword);
	vscode.window.showInformationMessage('Credenziali ENV' + process.env.NUV_USER + ' ' + process.env.NUV_APIHOST + ' ' + process.env.NUV_PASSWORD);

	launchLoginTerminal()
	
}

function updateNuvLoginParams(nuvUser: string | undefined, nuvApiHost: string | undefined, nuvPassword: string | undefined){

	nuvLoginParams = {
		nuvUser: nuvUser,
		nuvApiHost: nuvApiHost,
		nuvPassword: nuvPassword
	}

	process.env.NUV_USER = nuvUser;
	process.env.NUV_APIHOST = nuvApiHost;
	process.env.NUV_PASSWORD = nuvPassword
}

function launchLoginTerminal(){
	// launchTerminal('nuv -login')
	launchTerminal(`nuv -login ${nuvLoginParams.nuvApiHost} ${nuvLoginParams.nuvUser} ${nuvLoginParams.nuvPassword}`)

}