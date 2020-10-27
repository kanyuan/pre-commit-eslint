const path = require("path");
const fs = require("fs");
const gitUtils = require("./utils/git");

const data = fs.readFileSync(path.join(__dirname, "./pre-commit"), "utf-8");
const precommitPath = gitUtils.getPrecommitPath();

if (precommitPath) {
    fs.writeFileSync(precommitPath, data);
    fs.chmodSync(precommitPath, parseInt("0755", 8));
}
