const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function findPhp() {
    // 1. Try system PATH
    try {
        const out = execSync(process.platform === 'win32' ? 'where php' : 'which php', { stdio: 'pipe' }).toString().trim().split(/\r?\n/)[0];
        if (out && fs.existsSync(out)) return out;
    } catch {}

    // 2. Try Winget packages directory on Windows
    if (process.platform === 'win32' && process.env.LOCALAPPDATA) {
        const wingetDir = path.join(process.env.LOCALAPPDATA, 'Microsoft', 'WinGet', 'Packages');
        if (fs.existsSync(wingetDir)) {
            try {
                const dirs = fs.readdirSync(wingetDir);
                for (const d of dirs) {
                    if (d.toLowerCase().includes('php.php')) {
                        const candidate = path.join(wingetDir, d, 'php.exe');
                        if (fs.existsSync(candidate)) return candidate;
                    }
                }
            } catch {}
        }
    }

    // 3. Common fallback locations on Windows
    const candidates = [
        'C:\\php\\php.exe',
        'C:\\tools\\php\\php.exe',
        'C:\\xampp\\php\\php.exe'
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }

    return 'php';
}

const phpPath = findPhp();
const args = process.argv.slice(2);

const child = spawn(phpPath, args, { stdio: 'inherit', shell: true });

child.on('error', (err) => {
    console.error('❌ Failed to start PHP process:', err.message);
    console.error('Please ensure PHP 8.2+ is installed.');
    process.exit(1);
});

child.on('exit', (code) => {
    process.exit(code ?? 0);
});
