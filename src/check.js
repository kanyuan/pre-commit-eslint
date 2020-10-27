const { ESLint } = require("eslint");
const gitUtils = require("./utils/git");
const eslintUtils = require("./utils/eslint");

async function checkFiles(files) {
    if (files.length === 0) {
        return;
    }
    const eslint = new ESLint();
    let results = await eslint.lintFiles(files);
    results = eslintUtils.filterPassError(results);

    const allErrorNum = results.reduce((total, current) => {
        return current.errorCount + current.warningCount + total;
    }, 0);

    if (allErrorNum > 0) {
        const formatter = await eslint.loadFormatter("stylish");
        let formatterInfo = formatter.format(results);
        // 移出eslint关于修复的提示
        formatterInfo = formatterInfo.replace(
            /([^\n]*)potentially fixable with the `--fix` option./,
            ""
        );
        console.info(formatterInfo);
        process.exit(1);
    }
}

module.exports = function () {
    if (gitUtils.isMergeConflicts()) {
        return;
    }
    const changedFiles = gitUtils.getChangedFiles();

    const jsFiles = changedFiles.filter((file) => {
        return /(\.js|\.jsx|\.vue|\.ts\.tsx)$/.test(file);
    });

    checkFiles(jsFiles).catch((error) => {
        process.exitCode = 1;
        console.error(error);
    });
};
