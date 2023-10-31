const axios = require('axios')
const cheerio = require("cheerio");
const options = require('../options.json')

const scrapeCodeforces = async (problem) => {
    try {
        // scrap problem source code
        const solutionPage = await axios.get(problem.url);
        var $ = cheerio.load(solutionPage.data);
        problem.sourceText = $("#program-source-text").text();

        let contestHomePage = ""
        let arr = problem.url.split('/')
        for(let i=1;i<arr.length-1;i++) {
            if(arr[i-1]==='contest' && arr[i+1]=='submission') {
                contestHomePage = "https://codeforces.com/contest/" + arr[i]
                break
            }
        }

        // scrap problem contest name
        const contestPage = await axios.get(contestHomePage);
        $ = cheerio.load(contestPage.data);
        var contestName = $("head > title").text();

        // s1 - contestname(which can contain '-') - s2
        contestName = contestName.split('-')
        contestName.shift()
        contestName.pop()
        contestName = contestName.join('-')
        contestName = contestName.trim()
        problem.groupName = 'Codeforces - ' + contestName

    } catch (error) {
        console.error(`[error in scraping ${problem.url} from codeforces]\t` + error.message)
    }
};

module.exports = {
    scrapeCodeforces
}