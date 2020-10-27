const execSync = require("child_process").execSync;
const path = require("path");
const fs = require("fs");

// git是否处于冲突中
function isMergeConflicts() {
    const stdout = execSync("git status", { encoding: "utf8" });
    return (
        stdout.indexOf("You have unmerged paths") >= 0 ||
        stdout.indexOf("All conflicts fixed but you are still merging") >= 0
    );
}

// 寻找git所在的目录
function getGitDir() {
    const dirs = __dirname.split(path.sep);
    while (dirs.pop()) {
        const dir = dirs.join(path.sep);

        if (fs.existsSync(path.join(dir, ".git"))) {
            return path.join(dir, ".git");
        }
    }
}

function getPrecommitPath() {
    const gitDir = getGitDir();
    if (gitDir) {
        return path.join(gitDir, "hooks/pre-commit");
    }
}

function getGitUsername() {
    const stdout = execSync("git config user.name", { encoding: "utf8" });
    return stdout.trim().replace("\n", "");
}

// 获取文件中我编辑的行
function getMyLines(filePath) {
    const stdout = execSync(`git blame ${filePath}`, { encoding: "utf8" });
    const allLines = stdout.split("\n");
    const gitUsername = getGitUsername();
    const result = {};
    allLines.forEach((line, index) => {
        if (
            line.indexOf(gitUsername) === 10 ||
            line.indexOf("Not Committed Yet") === 10
        ) {
            result[index] = true;
        }
    });
    return result;
}

// 获取文件中发生变化的行
function getChangedLines(filePath) {
    const stdout = execSync(`git diff HEAD ${filePath} `, { encoding: "utf8" });
    const lines = stdout.trim().split("\n");
    const result = {};

    let currentLine;
    lines.forEach((line) => {
        if (line.indexOf("@@") === 0) {
            const execResult = line.match(/\+(\d+)/);
            currentLine = +execResult[1];
            return;
        }

        if (currentLine === undefined) {
            return;
        }

        switch (line[0]) {
            case " ":
                currentLine++;
                break;
            case "-":
                break;
            case "+":
                result[currentLine] = true;
                currentLine++;
                break;
        }
    });

    return result;
}

// 获取发生变化的文件
function getChangedFiles() {
    const stdout = execSync("git diff HEAD --name-only --diff-filter=ACMR", {
        encoding: "utf8",
    });
    return stdout.trim().split("\n");
}

// 获取文件中，发生变化且是我编辑的行
function getMyChangedLines(filePath) {
    const myLines = getMyLines(filePath);
    const changedLines = getChangedLines(filePath);
    const result = {};
    Object.keys(changedLines).forEach((lineNumber) => {
        if (myLines[lineNumber]) {
            result[lineNumber] = true;
        }
    });
    return result;
}

module.exports = {
    isMergeConflicts,
    getPrecommitPath,
    getMyChangedLines,
    getChangedFiles,
};
