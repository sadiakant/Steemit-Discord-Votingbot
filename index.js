const Discord = require('discord.js')
var steem = require('steem')
var fs = require("fs")
var moment = require("moment")
var whitelistjs = require("./whitelist.js")

var config = {}
var whitelist = []
var times = {}

var token = config["discordToken"]
var prefix = config["prefix"]
var botCommandRoleName = config["botCommandRole"]
var version = config["version"]
var steemAccount = config["accountName"]
var minTimeWhitelisted = config["minTimeWhitelisted"]
var maxTimeWhitelisted = config["maxTimeWhitelisted"]
var minTimeNotWhitelisted = config["minTimeNotWhitelisted"]
var maxTimeNotWhitelisted = config["maxTimeNotWhitelisted"]
var minimumPowerToVote = config["minimumPowerToVote"]

loadConfig()
loadWhitelist()
loadTimes()

const bot = new Discord.Client();

bot.on('ready', () => {
    console.log('Bot has started');
});

bot.on('message', message => {
    if (message.author.bot) return;
    loadConfig()
    loadWhitelist()
    loadTimes()

    var botCommandId = -1
    try {
        botCommandId = message.guild.roles.find("name", botCommandRoleName).id
    } catch (err) {
        console.log("ROLE DOESN't EXIST")
    }

    var isBotCommander = false
    try {
        isBotCommander = message.member.roles.has(botCommandId)
    } catch (err) {
        console.log("Bot Commander Role Failed Somehow")
    }

    if (message.content.indexOf(prefix) === 0) {
        console.log(message.content)
        var afterPrefix = message.content.split(prefix).pop()
        var splitMessage = afterPrefix.split(" ")
        var command = splitMessage[0]
        console.log(command)

        if (command == "help") {
            message.channel.send("<@" + message.author.id + "> To get your post voted by @votefun, just type in `" + prefix + "vote (postlink)`. The postlink can be from steemit, or busy, or any other site that follow the @author/permlink format. " + botCommandRoleName + " can use `" + prefix + "add (steem name)` to add people to the whitelist and `" + prefix + "remove (steem name)` to remove them from the whitelist. `"+ prefix + "value {Vote Weight(Between 0.01 and 100)}` can be used to find the bot's value at a particular percent.")
        }

        if (command == "version" || command == "v") {
            message.channel.send("<@" + message.author.id + "> The bot version that is being used is " + version + ".")
        }

        if (command == "upvote") {
            steem.api.getAccounts([steemAccount], function(err, response) {
                var secondsago = (new Date - new Date(response[0].last_vote_time + "Z")) / 1000;
                var vpow = response[0].voting_power + (10000 * secondsago / 432000);
                var vp = Math.min(vpow / 100, 100).toFixed(2);
                if (vp >= minimumPowerToVote) {
                    var link = splitMessage[1]
                    var whole = link.split("@").pop()
                    whole = whole.split("/")
                    console.log(whole)
                    let wif = config["privatePostingKey"]
                    let voter = steemAccount
                    let author = whole[0].toLowerCase()
                    var permlink = whole[1]
                    try {
                        permlink = permlink.toLowerCase()
                    } catch (err) {
                        console.log(err)
                        message.channel.send("<@" + message.author.id + "> Error. Please try again.")
                        return
                    }
                    let weight = 10000
                    if (whitelist.includes(author)) {
                        steem.api.getContent(author, permlink, function(err, result) {
                            if (err == null) {
                                var time = result["created"]
                                var createdTime = moment.utc(time)
                                var now = moment.utc()
                                var difference = now.diff(createdTime, 'minutes')
                                if (difference > minTimeWhitelisted && difference < maxTimeWhitelisted) {
                                    voteNow(wif, voter, author, permlink, weight, message, true);
                                } else {
                                    message.channel.send("<@" + message.author.id + "> Posts can only be voted between " + minTimeWhitelisted + " minutes and " + (maxTimeWhitelisted / 1440) + " days for whitelisted authors. This post doesn't meet that requirement.")
                                }
                            } else {
                                message.channel.send("<@" + message.author.id + "> We couldn't find your post, do you have the right link?")
                            }
                        })

                    } else {
                        steem.api.getContent(author, permlink, function(err, result) {
                            if (err == null) {
                                var time = result["created"]
                                var createdTime = moment.utc(time)
                                var now = moment.utc()
                                var difference = now.diff(createdTime, 'minutes')
                                if (difference > 30 && difference < 4320) {
                                    voteNow(wif, voter, author, permlink, weight / 10, message, true);
                                } else {
                                    message.channel.send("<@" + message.author.id + "> Posts can only be voted between " + minTimeNotWhitelisted + " minutes and " + (maxTimeNotWhitelisted / 1440) + " days for non-whitelisted authors. This post doesn't meet that requirement.")
                                }
                            } else {
                                message.channel.send("<@" + message.author.id + "> We couldn't find your post, do you have the right link?")
                            }
                        })
                    }
                } else {
                    message.channel.send("<@" + message.author.id + "> " + steemAccount + " has " + vp + "% voting power left. " + steemAccount + " only votes when it has at least " + minimumPowerToVote + "% vp. Please try again once that has been reached. To get the current voting power, use " + prefix + "power.")
                }
            })

        }


        if (command == "power") {
            steem.api.getAccounts([steemAccount], function(err, response) {
                var secondsago = (new Date - new Date(response[0].last_vote_time + "Z")) / 1000;
                var vpow = response[0].voting_power + (10000 * secondsago / 432000);
                var vp = Math.min(vpow / 100, 100).toFixed(2);
                message.channel.send("<@" + message.author.id + "> " + steemAccount + " has " + vp + "% voting power left.")
            })
        }

        if (command == "value")
        {
            var weight = parseFloat(splitMessage[1])
            if (isNaN(weight) || weight > 100 || 0 > weight)
            {
                message.channel.send("<@" + message.author.id + "> The proper waay to use this command is `"+ prefix + "value {Vote Weight(Between 0.01 and 100)}`. Please try again.")
                return
            }
            steem.api.getRewardFund('post', function(errFunds, responseFunds)
            {
                var rewardBalance = responseFunds.reward_balance.split(" ")[0]
                var recentClaims = responseFunds.recent_claims
                steem.api.getAccounts([steemAccount], function(errAccount, responseAccount) {
                    var secondsago = (new Date - new Date(responseAccount[0].last_vote_time + "Z")) / 1000;
                    var vpow = responseAccount[0].voting_power + (10000 * secondsago / 432000);
                    var vp = Math.min(vpow / 100, 100).toFixed(2);
                    var shares = parseFloat(responseAccount[0].vesting_shares.split(" ")[0])
                    var recievedShares = parseFloat(responseAccount[0].received_vesting_shares.split(" ")[0])
                    var sentShares = parseFloat(responseAccount[0].delegated_vesting_shares.split(" ")[0])
                    var totalVestingShares =  shares + recievedShares
                    totalVestingShares = totalVestingShares - sentShares
                    steem.api.getCurrentMedianHistoryPrice(function(errHistory, resultHistory) {
                        var final_vest = totalVestingShares * 1e6
                        var power = (parseFloat(vp) * parseFloat(weight) / 10000) / 50
                        var rshares = power * final_vest / 10000
                        var estimate = null
                        estimate = (rshares / parseFloat(recentClaims) * parseFloat(rewardBalance) * parseFloat(resultHistory.base.split(" ")[0])) * 10000
                        if (estimate != null)
                        {
                            message.channel.send("<@" + message.author.id + "> " + steemAccount + "'s vote value at " + weight + "% vote weight is estimated to be $" + (Math.round(estimate*1000)/1000)+ ".")
                        }
                        else
                        {
                            message.channel.send("<@" + message.author.id + "> The proper waay to use this command is `"+ prefix + "value {Vote Weight(Between 0.01 and 100)}`. Please try again.")
                        }
                })
            })
        })
    }

        if (command == "add") {
            if (isBotCommander) {
                whitelistjs.addToWhitelist(splitMessage[1].toLowerCase(), message)
            } else {
                message.channel.send("<@" + message.author.id + "> Only the people allowed can add to the whitelist.")
            }
        }

        if (command == "remove") {
            if (isBotCommander) {
                whitelistjs.removeFromWhitelist(splitMessage[1].toLowerCase(), message)
            } else {
                message.channel.send("<@" + message.author.id + "> Only the people allowed can remove from the whitelist.")
            }
        }
    }

});

function voteNow(wif, voter, author, permlink, weight, message, member) {
    steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
        console.log(result, err);
        if (err == null) {
            var user = message.author.username
            var comment = config["comment"]
            comment = comment.replace(/\{user\}/g, user)
            steem.broadcast.comment(wif, author, permlink, voter, "re-" + permlink, "title", comment, JSON.stringify({
                app: 'Discord'
            }), function(err, result) {
                console.log(err, result);
                times[author] = moment.utc()
                writeTimes()
            });

            if (member) {
                message.channel.send("<@" + message.author.id + "> Sucessfully voted on your post.")
            } else {
                message.channel.send("<@" + message.author.id + "> Sucessfully voted on your post. You aren't a member of cryptowithincin bot. Become a member to get full benefit of this bot.")
            }
        } else {
            message.channel.send("<@" + message.author.id + "> There was an error. We don't know why(yet). Hopefully we will soon.")
        }
    })
}

function loadConfig() {
    config = JSON.parse(fs.readFileSync("config.json"));
    token = config["discordToken"]
    prefix = config["prefix"]
    botCommandRoleName = config["botCommandRole"]
    version = config["version"]
    steemAccount = config["accountName"]
    minTimeWhitelisted = config["minTimeWhitelisted"]
    maxTimeWhitelisted = config["maxTimeWhitelisted"]
    minTimeNotWhitelisted = config["minTimeNotWhitelisted"]
    maxTimeNotWhitelisted = config["maxTimeNotWhitelisted"]
    minimumPowerToVote = config["minimumPowerToVote"]
}

function loadWhitelist() {
    whitelist = JSON.parse(fs.readFileSync("whitelist.json"));
}

function loadTimes() {
    times = JSON.parse(fs.readFileSync("times.json"));
}

function writeTimes() {
    fs.writeFile('times.json', JSON.stringify(times, null, 2), function(err) {})
}

bot.login(token);