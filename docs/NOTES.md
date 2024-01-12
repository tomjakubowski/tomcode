- Quick Pick tricks
  - Cmd-P has interactive buttons and stuff - how does that work??
  - Look here https://github.com/microsoft/vscode/blob/c1496443c09fc9de289ff0ac97db0e350902641f/src/vs/workbench/contrib/search/browser/symbolsQuickAccess.ts#L33

## new features

- "edit tomcode" (open a new vscode window editing the extension src)

## Coming up

- "install live tomcode to this workspace"

## science projects

- look for a way to make an "escape hatch"
  - like, can we load a `tomcode.js` file (or
    even `tomcode.ts`!!), dynamically import
    it and execute it?
  - comes down to: can we dynamically import
    an esmodule from the filesystem/workspace?
  - simple `await import("/path/to/foo.js")` failed ![screenshot](<Screenshot 2024-01-12 at 1.05.25 PM.png>)
    - https://github.com/microsoft/vscode/blob/c1496443c09fc9de289ff0ac97db0e350902641f/src/bootstrap-amd.js
