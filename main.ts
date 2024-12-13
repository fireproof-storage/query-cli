import { parseArgs } from "https://deno.land/std/cli/parse_args.ts";
import { connect } from "https://fireproof.storage/esm/cloud";
import { fireproof } from "https://fireproof.storage/esm/core";

const args = parseArgs(Deno.args, {
  string: ["localName", "remoteName", "shareURL"],
  default: {
    localName: "__z11",
    remoteName: "todos"
  }
});

// Parse shareURL if provided
if (args.shareURL) {
  try {
    const url = new URL(args.shareURL);
    const params = new URLSearchParams(url.search);
    const endpoint = params.get("endpoint");
    if (endpoint) {
      args.localName = params.get("localName") || args.localName;
      args.remoteName = params.get("remoteName") || args.remoteName;
    }
  } catch (err) {
    console.error("Invalid shareURL format");
  }
}


const db = fireproof(args.localName);
// Initialize connection
await connect(db, args.remoteName);

var __EVAL = (s: string) => eval(`
  void (__EVAL = ${__EVAL.toString()});
  ${s}
`);

async function evaluate(expr: string) {
  try {
    const result = await __EVAL(expr);
    console.log('<', result);
  } catch (err) {
    console.log(expr, 'ERROR:', err.message);
  }
}

console.log("JavaScript REPL for Fireproof (press Ctrl+C to exit)");
console.log("The 'db' variable is available for use. Enter expressions to evaluate:");

const history: string[] = [];
let historyIndex = 0;
let cursorPos = 0;

// Configure raw mode to handle keypresses
Deno.stdin.setRaw(true);

const decoder = new TextDecoder();
let currentInput = "";

// Helper to redraw the current line
function redrawLine() {
  Deno.stdout.writeSync(new TextEncoder().encode(`\r\x1b[K> ${currentInput}`));
  if (cursorPos < currentInput.length) {
    // Move cursor back to position
    Deno.stdout.writeSync(new TextEncoder().encode(`\x1b[${currentInput.length - cursorPos}D`));
  }
}

// Display initial prompt
Deno.stdout.writeSync(new TextEncoder().encode("> "));

while (true) {
  const buf = new Uint8Array(1);
  await Deno.stdin.read(buf);
  const key = decoder.decode(buf);

  if (key === "\x1b") { // ESC sequence
    const seqBuf = new Uint8Array(2);
    await Deno.stdin.read(seqBuf);
    const seq = decoder.decode(seqBuf);

    if (seq === "[A") { // Up arrow
      if (historyIndex > 0) {
        historyIndex--;
        currentInput = history[historyIndex];
        cursorPos = currentInput.length;
        redrawLine();
      }
    } else if (seq === "[B") { // Down arrow
      if (historyIndex < history.length) {
        historyIndex++;
        currentInput = historyIndex === history.length ? "" : history[historyIndex];
        cursorPos = currentInput.length;
        redrawLine();
      }
    } else if (seq === "[C") { // Right arrow
      if (cursorPos < currentInput.length) {
        cursorPos++;
        Deno.stdout.writeSync(new TextEncoder().encode("\x1b[C"));
      }
    } else if (seq === "[D") { // Left arrow
      if (cursorPos > 0) {
        cursorPos--;
        Deno.stdout.writeSync(new TextEncoder().encode("\x1b[D"));
      }
    }
  } else if (key === "\x01") { // Ctrl+A - move to start
    cursorPos = 0;
    redrawLine();
  } else if (key === "\x05") { // Ctrl+E - move to end
    cursorPos = currentInput.length;
    redrawLine();
  } else if (key === "\r") { // Enter
    Deno.stdout.writeSync(new TextEncoder().encode("\n"));
    if (currentInput.trim()) {
      history.push(currentInput);
      historyIndex = history.length;
      await evaluate(currentInput);
    }
    currentInput = "";
    cursorPos = 0;
    Deno.stdout.writeSync(new TextEncoder().encode("> "));
  } else if (key === "\x03") { // Ctrl+C
    Deno.stdout.writeSync(new TextEncoder().encode("\n"));
    Deno.stdin.setRaw(false);
    Deno.exit(0);
  } else if (key === "\x7f") { // Backspace
    if (cursorPos > 0) {
      currentInput = currentInput.slice(0, cursorPos - 1) + currentInput.slice(cursorPos);
      cursorPos--;
      redrawLine();
    }
  } else {
    currentInput = currentInput.slice(0, cursorPos) + key + currentInput.slice(cursorPos);
    cursorPos++;
    redrawLine();
  }
}
