- Quick Pick tricks
  - Cmd-P has interactive buttons and stuff - how does that work??
  - Look here https://github.com/microsoft/vscode/blob/c1496443c09fc9de289ff0ac97db0e350902641f/src/vs/workbench/contrib/search/browser/symbolsQuickAccess.ts#L33

## new features

- "edit tomcode" (open a new vscode window editing the extension src)

## Coming up

- "install live tomcode to this workspace"

## science projects

- got a working escape hatch!

  - look for a way to make an "escape hatch"
    - like, can we load a `tomcode.js` file (or
      even `tomcode.ts`!!), dynamically import
      it and execute it?
    - comes down to: can we dynamically import
      an esmodule from the filesystem/workspace?
    - simple `await import("/path/to/foo.js")` failed ![screenshot](<Screenshot 2024-01-12 at 1.05.25 PM.png>)
      - https://github.com/microsoft/vscode/blob/c1496443c09fc9de289ff0ac97db0e350902641f/src/bootstrap-amd.js

- move into ~/.vscode/init.js
- "rehash" commands + other UI items… want to be able to specify those on the fly
  - should be possible for the extension to overwrite its own package.json
    - e.g. read from ~/.vscode/contributes.json
    - merge it with package.json contributes key
  - but how do we get vscode windows to reload those…
    - maybe we can't avoid having to reload vscode window
- clean up resources from previous eval
  - problem: if you register
- escape hatch w/ typescript (init.ts)
  - what we need is the TS compiler API
  - override module resolution to make `import * as vscode from "vscode"` work
    - should also work: `import { foo } from "./bar"`
  - _avoid_ producing transpiled output on the filesystem!!
    - if we have to, set the output dir to a temporary directory, not ~
