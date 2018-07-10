# Votefun

How to use:

1. Have a steem account for this, will require the private posting key.
2. Create a discordbot and get the token for it.
3. Clone files
4. Edit config-exmaple.json with your details then rename it to config.json.
5. Open terminal and cd to the directory.
6. `npm install` to install the dependencies.
7. `node .` to start running the bot. 
8. Head to your discord server and enjoy.

The whitelist should consist of STEEM account names, not discord names.

Here's how the config file should be formatted. 
```
{
    "accountName" : "TheIsTheSteemAccountName", # This is the account name on the steem blockchain that the voting will happen form.
    
    "privatePostingKey" : "5ThisIsThePrivatePostingKey", # This is the private posting key for the account.
    
    "comment" : "This is the comment.", # This is the comment that the bot will leave on the posts that it votes.
    
    "discordToken" : "ThisIsTheDsicordToken", # This is the discord token of the discordbot. Head to https://discordapp.com/developers/applications/me to get one.
    
    "prefix" : "$", # This is the prefix for the bot on the discord server. This is the character that users will have to put before their command if it wants to get registered by the bot. 
    
    "botCommandRole" : "ThisIsTheBotCommanderRoleInDiscord", # Bot commanders will be able to add and remove from the whitelist. This is the role that you assigned to people who have that permission.
    
    "minTimeWhitelisted" : 10, # The is the minimum amount a post has to be created for to get voted, for whitelisted users.
    
    "maxTimeWhitelisted" : 4320, # This is the maximum amount of time a post can be up for to get voted, for whitelisted users.
    
    "minTimeNotWhitelisted" : 30, # The is the minimum amount a post has to be created for to get voted, for non-whitelisted users.
    
    "maxTimeNotWhitelisted" : 4320, # This is the maximum amount of time a post can be up for to get voted, for non-whitelisted users.
    
    "minimumPowerToVote" : 80, # If the account is under this % of VP, it won't vote.
    
    "_comment1" : "DO NOT CHANGE ANYTHING BELOW THIS!!!", # Just a comment. Don't change anything under this please. Its useful when coming to me to ask about whats wrong as I can refer to the code for older versions if you can easlily get your version.
    
    "version" : "0.0.3" # The current bot version.

}
```

