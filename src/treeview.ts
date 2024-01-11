import * as vscode from "vscode";

class TreeDataProvider<T> implements vscode.TreeDataProvider<T> {
  constructor() {}

  getParent(element: unknown): T {
    throw new Error("unimplemented");
  }
  getChildren(element?: T | undefined): vscode.ProviderResult<T[]> {
    throw new Error("unimplemented");
  }
  getTreeItem(element: T): vscode.TreeItem | Thenable<vscode.TreeItem> {
    throw new Error("unimplemented");
  }
}

const viewExplorerTree = vscode.window.createTreeView("tomcode-view-explorer", {
  showCollapseAll: true,
  treeDataProvider: new TreeDataProvider<string>(),
});
