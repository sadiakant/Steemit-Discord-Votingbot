# Votefun

How to use:

1. Have a steem account for this, will require the private posting key.
2. Create a discordbot and get the token for it.


Here's how the config file should be formatted. 
```
{
    "accountName" : "TheIsTheSteemAccountName", # This is the account name on the steem blockchain that the voting will happen form.
    "privatePostingKey" : "5ThisIsThePrivatePostingKey",
    "comment" : "This is the comment.",
    "discordToken" : "ThisIsTheDsicordToken",
    "prefix" : "$",
    "botCommandRole" : "ThisIsTheBotCommanderRoleInDiscord",
    "minTimeWhitelisted" : 10,
    "maxTimeWhitelisted" : 4320,
    "minTimeNotWhitelisted" : 30,
    "maxTimeNotWhitelisted" : 4320,
    "minimumPowerToVote" : 80,
    "_comment1" : "DO NOT CHANGE ANYTHING BELOW THIS!!!",
    "version" : "0.0.3"

}
```

