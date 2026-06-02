const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let serverProcess = null;
const NEXT_PORT = 3456;

function startNextServer() {
  return new Promise((resolve, reject) => {
    const nextCli = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');

    serverProcess = spawn('node', [nextCli, 'start', '-p', String(NEXT_PORT)], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PORT: String(NEXT_PORT),
        NODE_ENV: 'production',
      },
    });

    serverProcess.stdout.on('data', (d) => {
      if (process.env.DEBUG) process.stdout.write(`[next] ${d}`);
    });
    serverProcess.stderr.on('data', (d) => {
      if (process.env.DEBUG) process.stderr.write(`[next] ${d}`);
    });
    serverProcess.on('exit', (code) => {
      console.log(`Next.js server exited with code ${code}`);
      serverProcess = null;
    });

    const timeout = setTimeout(() => {
      if (serverProcess) { serverProcess.kill(); serverProcess = null; }
      reject(new Error('Server startup timed out after 30s'));
    }, 30000);

    const poll = () => {
      const req = http.get(`http://localhost:${NEXT_PORT}/api/health`, (res) => {
        clearTimeout(timeout);
        resolve();
      });
      req.on('error', () => setTimeout(poll, 500));
      req.end();
    };

    setTimeout(poll, 1500);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (!app.isPackaged) {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadURL(`http://localhost:${NEXT_PORT}`);
  }

  win.once('ready-to-show', () => win.show());
  return win;
}

app.whenReady().then(async () => {
  if (app.isPackaged) {
    try {
      await startNextServer();
    } catch (err) {
      console.error('Failed to start server:', err);
      app.quit();
      return;
    }
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) { serverProcess.kill(); serverProcess = null; }
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) { serverProcess.kill(); serverProcess = null; }
});
