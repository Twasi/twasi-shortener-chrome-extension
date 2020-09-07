import {copyFileSync, existsSync, mkdirSync, rmdirSync} from "fs-extra";
import {join} from "path";
import {execSync} from "child_process";

const basePath = join(__dirname, '..');
const path = join(basePath, 'package');

if (existsSync(path)) {
    rmdirSync(path, {recursive: true});
}

mkdirSync(path);

mkdirSync(join(path, 'ui'));
copyFileSync(join(basePath, 'ui'), join(path, 'ui'));
mkdirSync(join(path, 'icons'));
copyFileSync(join(basePath, 'icons'), join(path, 'icons'));
copyFileSync(join(basePath, 'manifest.json'), join(path, 'manifest.json'));

if (!existsSync(join(basePath, 'dist'))) {
    execSync('npm run build', {stdio: 'inherit'});
}

mkdirSync(join(path, 'dist'));
copyFileSync(join(basePath, 'dist'), join(path, 'dist'));

console.log('Package created at ' + path);
