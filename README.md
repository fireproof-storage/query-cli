### Requirements

- Install Deno: https://deno.land/#installation

### Example

```bash
$ deno run -A main.ts --shareURL https://dashboard.fireproof.storage/fp/databases/connect\?endpoint\=fireproof%3A%2F%2Fcloud.fireproof.direct%2F\&localName\=fireproof\&remoteName\=0192b09a-150a-7a53-bd9b-cd6e9783bb69
```

### Bundle all to a single binary
```bash
$ deno compile -A -o query main.ts
```

### Run
```bash
 ./query --shareURL https://dashboard.fireproof.storage/fp/databases/connect\?endpoint\=fireproof%3A%2F%2Fcloud.fireproof.direct%2F\&localName\=fireproof\&remoteName\=0192b09a-150a-7a53-bd9b-cd6e9783bb69
```

