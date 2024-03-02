import * as vscode from 'vscode';
import { COMMANDS } from './constants';

export function activate(context: vscode.ExtensionContext) {

	// Registering the commands from the COMMANDS ENUM. Attaching the launchTerminal event to each command.
	Object.entries(COMMANDS).forEach(([name, command]) => 
	context.subscriptions.push(vscode.commands.registerCommand(`nuvolaris.${name.toLowerCase()}`, () => 
		launchTerminal(command)
	)));
}


function launchTerminal(command: string){
	// If a terminal named "Nuvolaris" already exists, launch the command inside that one.
	const terminal = vscode.window.terminals.find(t=>t.name==="Nuvolaris") || vscode.window.createTerminal("Nuvolaris");
	terminal.show();
	terminal.sendText(command, true);   
}