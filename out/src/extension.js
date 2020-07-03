'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const win32 = process.platform === 'win32';
const child_process = require("child_process");
const fs = require("fs");
function showWarningMessage(message) {
    vscode.window.showWarningMessage(message);
}
function getAePath() {
    return new Promise((resolve, reject) => {
        if (win32) {
            const ps = child_process.spawn('powershell.exe', ['-Command', `(Get-WmiObject -class Win32_Process -Filter 'Name="AfterFX.exe"').path`]);
            let output = '';
            ps.stdout.on('data', (chunk => {
                output += chunk.toString();
            }));
            ps.on('exit', () => {
                const aePaths = [];
                for (let aePath of output.split(/\r\n|\r|\n/)) {
                    if (aePath) {
                        aePaths.push(aePath);
                    }
                }
                if (aePaths.length) {
                    resolve(aePaths[0]);
                }
                else {
                    reject('请启动 After Effects.');
                }
            });
            ps.on('error', (err) => {
                reject(err);
            });
            ps.stdin.end();
        }
        else {
            reject(`暂不支持该系统`);
        }
    });
}
function activate(context) {
    const disposable = vscode.commands.registerCommand('run.JSXScript', () => {
        getAePath().then((aePath) => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            const document = editor.document;
            const fileName = document.fileName;
            if (fs.existsSync(fileName)) {
                aePath = aePath.indexOf(' ') === -1 ? aePath : `"${aePath}"`;
                child_process.exec(`${aePath} -r ${fileName}`, () => { });
            }
            else {
                throw '请保存文件';
            }
        }).catch(err => {
            showWarningMessage(err);
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map