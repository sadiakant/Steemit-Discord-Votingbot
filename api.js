var express = require('express');
const bodyParser = require('body-parser');
var fs = require("fs")
var whitelist = require("./whitelist.js")
var app = express();
var router = express.Router()
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json());

app.use(router)

var password = ""

router.get('', function(req, res) {
    if (req.headers.password == password) {
        res.json({
            "message": "Success"
        })
    } else {
        res.json({
            "message": "Incorrect Password"
        })
    }
})

router.get('/whitelist', function(req, res) {
    if (req.headers.password == password) {
        fs.readFile("whitelist.json", function(err, data) {
            if (!err) {
                var jsonWhitelist = JSON.parse(data)
                res.json(jsonWhitelist)

            }
        })
    } else {
        res.json({
            "message": "Incorrect Password"
        })
    }
})

router.post("/whitelist", function(req, res) {
    if (req.headers.password == password) {

        if (req.body.activity == "add") {
            let user = req.body.user
            whitelist.addToWhitelist(user.toLowerCase(), null)
            res.json({
                "message": "Added"
            })
        }

        if (req.body.activity == "remove") {
            let user = req.body.user
            whitelist.removeFromWhitelist(user.toLowerCase(), null)
            res.json({
                "message": "Removed"
            })
        }
    }

})




function start() {
    app.listen(8080)
    setInterval(function() {
        fs.readFile("whitelist.json", function(err, data) {
            if (!err) {
                password = data.apiPassword
            }
        })
    }, 10 * 1000)
}

module.exports = {
    start: start
}