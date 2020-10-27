const fs = require("fs");
const gitUtils = require("./utils/git");

const precommitPath = gitUtils.getPrcomiitPath();
if (precommitPath && fs.existsSync(precommitPath)) {
    const data = fs.readFileSync(precommitPath, "utf-8");
    if (data.indexOf("#precommit-eslint") !== -1) {
        fs.unlinkSync(precommitPath);
    }
}
