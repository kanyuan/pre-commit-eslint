const gitUtils = require("./git");

// 修正eslint文件的统计数字
function fixFileStats(fileResult) {
    fileResult.errorCount = 0;
    fileResult.warningCount = 0;

    fileResult.fixableErrorCount = 0;
    fileResult.fixableWarningCount = 0;

    fileResult.messages.forEach((message) => {
        if (message.fatal || message.severity === 2) {
            fileResult.errorCount++;
            if (message.fix) {
                fileResult.fixableErrorCount++;
            }
        } else {
            fileResult.warningCount++;
            if (message.fix) {
                fileResult.fixableWarningCount++;
            }
        }
    });
}

// 修正eslint report的统计
function fixAllStats(report) {
    report.errorCount = 0;
    report.warningCount = 0;
    report.fixableErrorCount = 0;
    report.fixableWarningCount = 0;

    report.results.forEach((result) => {
        report.errorCount += result.errorCount;
        report.warningCount += result.warningCount;
        report.fixableErrorCount += result.fixableErrorCount;
        report.fixableWarningCount += result.fixableWarningCount;
    });
}

// 是否eslint忽略的文件
function isIgnoreFile(result) {
    if (result.warningCount !== 1 || result.errorCount !== 0) {
        return false;
    }
    if (result.messages.length !== 1) {
        return false;
    }
    if (result.messages[0].message.indexOf("File ignored by default") !== 0) {
        return false;
    }
    return true;
}

// 过滤提交中之前就有的错误
function filterPassError(results) {
    let newResults = results.slice();

    newResults = newResults.filter((result) => {
        if (isIgnoreFile(result)) {
            return false;
        }

        const changeLinesMap = gitUtils.getMyChangedLines(result.filePath);

        result.messages = result.messages.filter((message) => {
            return changeLinesMap[message.line || 0];
        });

        fixFileStats(result);

        return result.messages.length !== 0;
    });

    return newResults;
}

module.exports = {
    filterPassError,
};
