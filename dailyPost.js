var dsteem = require("dsteem")
var fs = require("fs")
var moment = require("moment")

var stats = {}
var config = {}
var privatePostingKey = ""
var account = ""

var basePost = `This is the daily votefun log for {date}.

<center><img src="https://cdn.pixabay.com/photo/2018/04/11/08/59/seemed-3309912_1280.jpg"></center>

<br>
<h4>Stats for past 24 hours.</h4>
We voted {amountOfPostsVoted} posted in the last 24 hour making the total number of votes that we have given to be {totalVotesGiven}.
<br>
We sumbitted {amountOfDrottoBids} bids to @drotto.
<br>

<hr>
As always, our goal is to grow as much as we can so we can help everyone grow. Every vote on these posts help us gain SteemPower and also liquid reward which can be used to pay for those drotto votes(and hopefully bigger bots later on as we can afford them). 

If you are a bot owner that accepts small bids (0.001 SBD/STEEM - 0.005 SBD/STEEM) please leave a comment or send a message and we could add you to our list of bots that we submit a bid for. This means that your bot grows and our users get more rewards(paid for by us). Even if you own a bigger bot but can give us a discount(refund of some sort on bids or however we decide to do it) contact us. Our discord is: https://discord.gg/KgYdq7h. 

If you are a regular user, you can send us a delegation or upvote this post to support us. Anything that you can do is really appreciated. We even need a logo, so if you are an artist, we are looking for a permanent right now and would really appreciate anything that you can do.`

var client = new dsteem.Client('https://api.steemit.com')

function makePost() {
    loadStats()
    loadConfig()
    var post = basePost
    var currentDate = moment.utc().format("MMM Do YY")
    console.log("curreneDate:", currentDate)
    console.log("stats date: ", stats["lastPostedDate"])
    if (stats["lastPostedDate"] != currentDate) {
        post = post.replace(/\{date\}/g, moment.utc().format("MMM Do YY"))
        post = post.replace(/\{amountOfPostsVoted\}/g, stats["amountOfPostsVoted"])
        post = post.replace(/\{totalVotesGiven\}/g, stats["totalVotesGiven"])
        post = post.replace(/\{amountOfDrottoBids\}/g, stats["amountOfDrottoBids"])
        
        var key = dsteem.PrivateKey.fromString(privatePostingKey)

        var postBody = post
        var jsonMetadata = JSON.stringify({
            tags: [account],
            app: "Discord"
        })
        var permLink = account + "-log-" + moment.utc()
        var postTitle = account + " Daily Log: " + moment.utc().format("MMM Do YY")

        client.broadcast.commentWithOptions({
            author: account,
            body: postBody,
            json_metadata: jsonMetadata,
            parent_author: "",
            parent_permlink: account,
            permlink: permLink,
            title: postTitle
        }, {
            allow_curation_rewards: true,
            allow_votes: true,
            author: account,
            extensions: [
                [0, {
                    beneficiaries: [{
                        "account": "rishi556",
                        "weight": 1000
                    }]
                }]
            ],
            max_accepted_payout: "100.000 SBD",
            percent_steem_dollars: 10000,
            permlink: permLink
        }, key).then(function(result) {
            loadStats()
            stats["amountOfPostsVoted"] = 0
            stats["amountOfDrottoBids"] = 0
            stats.lastPostedDate = currentDate
            writeStats()
        }, function(error) {
            console.log(error)
        })
    }

}

function loadStats() {
    stats = JSON.parse(fs.readFileSync("dailyStats.json"));
}

function loadConfig() {
    config = JSON.parse(fs.readFileSync("config.json"))
    account = config.accountName
    privatePostingKey = config.privatePostingKey
}

function writeStats() {
    fs.writeFile('dailyStats.json', JSON.stringify(stats, null, 2), function(err) {})
}

function loadConfig() {
    config = JSON.parse(fs.readFileSync("config.json"));
    account = config["accountName"]
    privatePostingKey = config["privatePostingKey"]
}

module.exports = {
    makePost: makePost
}