# CSC325 Team 8 Development
 Development repo for Team 8

 Code started from: https://github.com/AndrewJager/CSC325-Team-8-Snapshot-2 

## Setup
To run this bot, you must create a config.json file (in the same directory as index.js) with the following structure:

```
{
    "token" : "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "clientId" : "1111111111111111111111",
    "guildId" :"222222222222222222222"
}
```

Replace the values with your token, clientId(ID of the bot), and guildId(ID of the server)

You also must have Discord.js and Node.js installed. 
Tutorial here: https://discordjs.guide/preparations/#installing-node-js

You'll need to install the sqlite library with the following command: `npm install sqlite3`


## Commands
**Current commands:**

`/welcome` - Creates a message to welcome new members to the server and specify the rules of the server.

`/courses` - Generates a message with the chosen roles. Users can click the buttons on the message to get roles assigned to them.

`/newclass` - Creates a class, taking the department, course number, and semester as parameters. When this command is ran, a new group of channels is created in the server, with the parameters from the `/newclass` command used to name the channels. This command also allows you to select a category to cohabitate with, which will use an existing category for the class, instead of creating new channesl.

`/classes` - Lists all current classes

`/delete-channels` - Allows you to select a category, and delete it along will all of its child channels
**Note:** This command is not required for the specifications, as class categories will not be archived rather than deleted This command was created to make testing easier, and may be removed from the final bot.

`/newrole` - Creates a new role, allowing you to specify a color for it. Used for misc roles outside of the class roles.

`/archive` - Takes a category and class number as parameters. All users with the student role receive the veteran role, and have the student role removed. The access the student role to the category is removed. The category has "(Archived)" appended to its name. When archiving cohabitated courses, each course must be individually archived. The category will not be renamed to "(Archived)" until all courses using that category have been archived.

`/setup` - Creates the channels the bot will use. This is currently in progress, and the channels are not used by the bot yet.



## Starter Code
The starter code for this bot was from [Chase C's tutorial bot](https://github.com/Meapers0/Tutorial-bot), following [this guide](https://discordjs.guide/).

## Previous Snapshots
Snapshot #1 - https://github.com/AndrewJager/CSC325-Team-8-Snapshot-1
Snapshot #2 - https://github.com/AndrewJager/CSC325-Team-8-Snapshot-2 
