// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// https://stackoverflow.com/questions/58479188/can-i-get-a-list-of-all-vscode-themes-installed
const getAllThemes = () =>
  vscode.extensions.all.flatMap((ext) => {
    const contributesThemes = ext.packageJSON.contributes?.themes;
    if (contributesThemes) {
      const themes: string[] = [];
      for (const theme of contributesThemes) {
        const label = theme.label;
        const uiTheme = theme.uiTheme === "vs-dark" ? "dark" : "light";
        const extensionType = ext.packageJSON.isBuiltin
          ? "Built-in"
          : "External";
        console.log(
          `${extensionType} extension '${ext.id}' contributes ${uiTheme} theme '${label}'`
        );
        themes.push(label);
      }
      themes.sort();
      return themes;
    } else {
      return [];
    }
  });

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "tomcode" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "tomcode.select-window-theme",
    async () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user

      // set it to "Edge Dark" as POC
      const activeTheme = vscode.window.activeColorTheme;
      const config = vscode.workspace.getConfiguration();
      const theme = config.get("workbench.colorTheme");
      console.log("current theme is", theme);
      const allThemes = getAllThemes();
      const newTheme = await vscode.window.showQuickPick(allThemes, {
        canPickMany: false,
      });
      console.log("chose", newTheme);
      config.update(
        "workbench.colorTheme",
        newTheme,
        vscode.ConfigurationTarget.Workspace
      );
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
