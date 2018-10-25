// MATH STUFF
function isInRangeInclusinve(min, max, num) {
    if (num >= min && num <= max){
        return true
    } else {
        return false
    }
}

//STEEM STUFF
var steem = require("steem")

function getVPOfAccount(account, callback){
    steem.api.getAccounts([account], function (err, response) {
        var secondsago = (new Date - new Date(response[0].last_vote_time + "Z")) / 1000;
        var vpow = response[0].voting_power + (10000 * secondsago / 432000);
        var vp = Math.min(vpow / 100, 100).toFixed(2);
        callback(vp)
    })
}

module.exports = {
    isInRangeInclusinve : isInRangeInclusinve,
    getVPOfAccount: getVPOfAccount
}