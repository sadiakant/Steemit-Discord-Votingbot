var express = require('express');
const bodyParser = require('body-parser');
var fs = require("fs")


var app = express();
var router = express.Router()
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json());

app.use(router)

router.get('', function (req, res) {
    var a = JSON.parse(fs.readFileSync("config.json"))
    delete a["privatePostingKey"]
    delete a["privateActiveKey"]
    res.json(a)
})

function start()
{
    app.listen(8080)
}

module.exports = {
    start : start
}