const got = require('got')
const axios = require('axios')
const cheerio = require("cheerio")

const Problem = require('./problem.js')
const options = require('../options.json')
const crawler = require('./crawler.js')
const saveFile = require('./saveProblem')

const getCodeforcesSubmissions = async () => {
    if (!options.codeforcesHandle || typeof (options.codeforcesHandle) !== "string" || options.codeforcesHandle.length == 0) return
    try {
        var submissions = await axios.get(`https://codeforces.com/api/user.status?handle=${options.codeforcesHandle}`); // '&from=1&count=10'
        submissions = submissions.data.result
        for (var i = 0; i < submissions.length; i++) {

            var problem = new Problem()
            problem.isAC = submissions[i].verdict === 'OK' ? true : false
            if (problem.isAC === false && options.onlyAC === true) continue

            problem.fileExtension = options.defaultExtension
            if (submissions[i].programmingLanguage in options.extensionMapping
                && options.extensionMapping[submissions[i].programmingLanguage].length > 0) {
                problem.fileExtension = options.extensionMapping[submissions[i].programmingLanguage]
            }

            problem.name = submissions[i].problem.index + ' - ' + submissions[i].problem.name
            problem.groupName = submissions[i].contestId
            problem.url = `https://codeforces.com/contest/${submissions[i].contestId}/submission/${submissions[i].id}`

            await crawler.scrapeCodeforces(problem)

            problem.fileName = problem.name + (options.giveUniqueNames ? "-" + submissions[i].id : "") + problem.fileExtension
            problem.filePath = `./exported_codes/${options.codeforcesHandle}/${problem.groupName}`
            saveFile.saveProblem(problem)
        }

    } catch (error) {
        console.error(error.message)
    }
};

module.exports = {
    getCodeforcesSubmissions,
}
