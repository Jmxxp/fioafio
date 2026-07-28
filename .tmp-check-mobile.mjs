import { spawn } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9333;
const profile = await mkdtemp(join(tmpdir(), "fioafio-cdp-"));
const browser = spawn(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--window-size=390,1000",
    "http://127.0.0.1:8765/"
  ],
  { stdio: "ignore" }
);

async function getPage() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) =>
        response.json()
      );
      const page = targets.find((target) => target.type === "page");
      if (page) {
        return page;
      }
    } catch {
      // Chrome is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Chrome DevTools endpoint did not become available.");
}

const page = await getPage();
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let commandId = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) {
    return;
  }
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) {
    reject(new Error(message.error.message));
  } else {
    resolve(message.result);
  }
});

function send(method, params = {}) {
  commandId += 1;
  return new Promise((resolve, reject) => {
    pending.set(commandId, { resolve, reject });
    socket.send(JSON.stringify({ id: commandId, method, params }));
  });
}

await send("Runtime.enable");
await new Promise((resolve) => setTimeout(resolve, 8000));
const result = await send("Runtime.evaluate", {
  expression: `(() => {
    const categoryGrid = document.querySelector(".category-grid");
    const productGrid = document.querySelector(".product-grid");
    const describe = (element) => {
      if (!element) return null;
      const style = getComputedStyle(element);
      return {
        columns: style.gridTemplateColumns,
        gap: style.gap,
        width: element.getBoundingClientRect().width,
        children: [...element.children].slice(0, 4).map((child) => {
          const rect = child.getBoundingClientRect();
          return { width: rect.width, height: rect.height, x: rect.x, y: rect.y };
        })
      };
    };
    return {
      innerWidth,
      categoryGrid: describe(categoryGrid),
      productGrid: describe(productGrid),
      categories: categoryGrid?.children.length ?? 0,
      products: productGrid?.children.length ?? 0
    };
  })()`,
  returnByValue: true
});

console.log(JSON.stringify(result.result.value, null, 2));
await send("Browser.close").catch(() => {});
socket.close();
browser.kill();
