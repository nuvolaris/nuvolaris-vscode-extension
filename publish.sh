npm install -g @vscode/vsce
npm install
npm run package
vsce package
vsce publish

VER="$(jq -r .version package.json)"
gh release create v$VER -t v$VER nuvolaris-vscode-extension.vsix