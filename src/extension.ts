// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// https://github.com/microsoft/vscode/blob/c72ffc8cd8fe11f6708f34129741d5fecf6dee5a/src/vs/workbench/contrib/themes/browser/themes.contribution.ts
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
  console.log("hello [tomcode]");
  const config = vscode.workspace.getConfiguration();

  const setTheme = (name: string | undefined) => {
    // TODO: Can we support "preview" for config?
    // As used here (and in built-in theme picker) https://github.com/microsoft/vscode/blob/80bb443f663a70c45ef87ce44f3c68b3dee2b58e/src/vs/workbench/services/themes/common/themeConfiguration.ts#L327-L352
    // Worst case, to fake "preview" we could just "remember" the original value (before the quickpick is shown),
    // and restore the setting on cancel.
    config.update(
      "workbench.colorTheme",
      name,
      vscode.ConfigurationTarget.Workspace
    );
  };
  let disposable = vscode.commands.registerCommand(
    "tomcode.select-window-theme",
    async () => {
      const currentTheme = config.get<string>("workbench.colorTheme");
      const allThemes = getAllThemes().filter((v) => v !== currentTheme);
      let result: "selected" | null = null;

      // https://github.com/microsoft/vscode/blob/c72ffc8cd8fe11f6708f34129741d5fecf6dee5a/src/vs/workbench/contrib/themes/browser/themes.contribution.ts#L159
      const qp = vscode.window.createQuickPick();
      qp.title = "[tomcode] Select workspace theme";
      qp.placeholder = "type a theme name…";
      qp.canSelectMany = false;
      qp.items = allThemes.map((name) => ({ label: name }));
      const pick = new Promise<vscode.QuickPickItem>((resolve) =>
        qp.onDidAccept((_) => {
          const themeItem = qp.selectedItems[0];
          result = "selected";
          qp.hide();
          resolve(themeItem);
        })
      );
      qp.onDidChangeActive((themes) => {
        setTheme(themes[0].label);
      });
      qp.onDidHide((_) => {
        if (result === null) {
          setTheme(currentTheme);
        }
      });
      qp.show();
      const newTheme = (await pick).label;
      setTheme(newTheme);
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
