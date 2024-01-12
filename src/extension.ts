// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { commands, Uri } from "vscode";
import { import_ } from "@brillout/import";
import * as ts from "typescript";
import { emit } from "process";

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

  disposable = vscode.commands.registerCommand(
    "tomcode.edit-self",
    async () => {
      let uri = Uri.file("/Users/tom/projects/tomcode");
      let success = await commands.executeCommand("vscode.openFolder", uri);
    }
  );

  function doTypescript() {
    let program = ts.createProgram({
      rootNames: ["/Users/tom/tomcode.ts"],
      // TODO: merge with our tsconfig.json (or a "standard" tsconfig.json which is compatible w/ vscode extension API surface)
      // TODO: make "vscode" import work.  maybe allow for a package.json in ~/.vscode/init/.  lol.
      options: {
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.CommonJS,
        noEmitOnError: true,
        noImplicitAny: true,
      },
    });
    let emitResult = program.emit();
    let allDiagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(emitResult.diagnostics);

    allDiagnostics.forEach((diagnostic) => {
      if (diagnostic.file) {
        let { line, character } = ts.getLineAndCharacterOfPosition(
          diagnostic.file,
          diagnostic.start!
        );
        let message = ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          "\n"
        );
        console.log(
          `${diagnostic.file.fileName} (${line + 1},${
            character + 1
          }): ${message}`
        );
      } else {
        console.log(
          ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
        );
      }
    });

    let exitCode = emitResult.emitSkipped ? 1 : 0;
    console.log("emitResult", emitResult);
    console.log("files emitted:", emitResult.emittedFiles?.length);
  }

  disposable = vscode.commands.registerCommand(
    "tomcode.eval-tomcode.js",
    async () => {
      // TODO: Make .mjs work
      // TODO: make .ts work!!! (compile to js in-memory? to a temp dir? no se)
      // bypass tsc compiling `import()` of our module to commonjs import
      // https://github.com/microsoft/TypeScript/issues/43329
      // const _importDynamic = new Function(
      //   "modulePath",
      //   "return import(modulePath)"
      // );
      // let home = await import_("/Users/tom/tomcode.mjs");
      const commonjs = "/Users/tom/tomcode.js";
      delete require.cache[require.resolve(commonjs)];
      let home2 = require(commonjs);
      console.log(home2);
      doTypescript();
    }
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
