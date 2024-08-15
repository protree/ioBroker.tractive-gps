const fs = require('node:fs');
const path = require('node:path');

function deleteFoldersRecursive(path, exceptions) {
    if (fs.existsSync(path)) {
        const files = fs.readdirSync(path);
        for (const file of files) {
            const curPath = `${path}/${file}`;
            const stat = fs.statSync(curPath);
            if (exceptions && exceptions.find(p => curPath.endsWith(p))) {
                continue;
            }

            if (stat.isDirectory()) {
                deleteFoldersRecursive(curPath);
                fs.rmdirSync(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        }
    }
}

function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((item) => {
        const srcPath = path.join(src, item);
        if (item === 'socket.io.js' || item === 'vendor' || item === 'media') {
            return;
        }
        const destPath = path.join(dest, item === 'index.html' ? 'tab_m.html' : item);
        if (fs.lstatSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

const dest = `${__dirname}/../admin`;
function patchIndex() {
    return new Promise(resolve => {
        if (fs.existsSync(`${dest}/tab_m.html`)) {
            let code = fs.readFileSync(`${dest}/tab_m.html`).toString('utf8');
            // replace code
            code = code.replace(
                /<script>const script=document[^<]+<\/script>/,
                '<script type="text/javascript" onerror="setTimeout(function(){window.location.reload()}, 5000)" src="./lib/js/socket.io.js"></script>'
            );
            code = code.replace(
                /<script>var script=document[^<]+<\/script>/,
                '<script type="text/javascript" onerror="setTimeout(function(){window.location.reload()}, 5000)" src="./lib/js/socket.io.js"></script>'
            );
            fs.writeFileSync(`${dest}/tab_m.html`, code);
            resolve();
        } else {
            // wait till finished
            setTimeout(() => {
                if (fs.existsSync(`${dest}/tab_m.html`)) {
                    let code = fs.readFileSync(`${dest}/tab_m.html`).toString('utf8');
                    // replace code
                    code = code.replace(
                        /<script>const script=document[^<]+<\/script>/,
                        '<script type="text/javascript" onerror="setTimeout(function(){window.location.reload()}, 5000)" src="./lib/js/socket.io.js"></script>'
                    );
                    code = code.replace(
                        /<script>var script=document[^<]+<\/script>/,
                        '<script type="text/javascript" onerror="setTimeout(function(){window.location.reload()}, 5000)" src="./lib/js/socket.io.js"></script>'
                    );
                    fs.writeFileSync(`${dest}/tab_m.html`, code);
                }
                resolve();
            }, 2000);
        }
    });
}

// deleteFoldersRecursive(`${dest}/static`, ['node_modules', 'package.json', 'package-lock.json']);

copyDir(`${__dirname}/build`, dest);
patchIndex()
    .then(() => {
        console.log('Admin UI is updated');
    });
