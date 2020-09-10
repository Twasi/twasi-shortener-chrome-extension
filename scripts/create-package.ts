import {copyFileSync, copySync, existsSync, mkdirSync, rmdirSync} from "fs-extra";
import {join} from "path";
import {execSync} from "child_process";
import {ArgumentParser} from "merlins-argument-parser";
import {readFileSync, writeFileSync} from "fs";

const argParser = new ArgumentParser(process.argv.slice(2));

const basePath = join(__dirname, '..');
const path = join(basePath, 'package');

if(!argParser.get('noVersionIncrement').asBool()) {
    const manifest = JSON.parse(readFileSync(join(basePath, 'manifest.json')).toString());
    let version: Array<string> = manifest.version.split('.');
    version[version.length - 1] = (1 + parseInt(version[version.length - 1])).toString();
    manifest.version = version.join('.');
    writeFileSync(join(basePath, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

if (existsSync(path)) {
    rmdirSync(path, {recursive: true});
}

mkdirSync(path);

mkdirSync(join(path, 'ui'));
copySync(join(basePath, 'ui'), join(path, 'ui'));
mkdirSync(join(path, 'icons'));
copySync(join(basePath, 'icons'), join(path, 'icons'));
copyFileSync(join(basePath, 'manifest.json'), join(path, 'manifest.json'));

if (!existsSync(join(basePath, 'dist'))) {
    execSync('npm run build', {stdio: 'inherit'});
}

mkdirSync(join(path, 'dist'));
copySync(join(basePath, 'dist'), join(path, 'dist'));

console.log('Package created at ' + path);
