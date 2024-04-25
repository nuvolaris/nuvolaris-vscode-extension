npm install -g @vscode/vsce
npm install
npm run package
vsce package
vsce publish

VER="$(jq -r .version package.json)"
cp nuvolaris-vscode-extension-$VER.vsix nuvolaris-vscode-extension.vsix
gh release create v$VER -t v$VER nuvolaris-vscode-extension.vsix
