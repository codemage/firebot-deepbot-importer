# Deepbot CSV Importer -- Custom Script for FireBot Twitch bot

This imports DeepBot CSV viewer data into [FireBot](https://firebot.app).

# For DeepBot Users Migrating to FireBot

These steps have been kindly written up by [Marstead](https://twitch.tv/Marstead).

1. You need to get the full CSV from @ianchandler1990's tool. The tool is here: https://chandler-gaming.com/PHP/DeepbotApi/deepbotapi.html You will want to access this tool via Firefox, not Chrome, if you have a very large user database Chrome can kill the tool before it finishes processing. The CSV produced by this tool has more data than the Export you can get from Deepbot directly, these fields can make it to Firebot.
2. In Firebot, click Settings -> scripts -> custom scripts == Enabled. Note you are committing to running custom third party scripts when doing this so you may want to turn these back off after the import is complete.
3. In Firebot, click File -> Open Data Folder -> Open the Scripts folder -> Put the [script](https://github.com/codemage/firebot-deepbot-importer/releases/download/v0.0.2/importDeepbotCSV.js) file there. 
4. In Firebot, click Commands. In Commands, -> New custom command and then make sure you're in Advanced Mode. Advanced Mode is an option at the bottom of the screen. When you are, click -> restrictions -> permissions -> add. Then click on the big "Permissions" box to expand it, and click the "Streamer" checkbox. This ensures only you can run this script and not any of your viewers.
5. Scroll down to where it says "Base Effects" and click "Add New Effect". In the list of effects, search for "Run Custom Script", select it and click add.
6. In the Run Custom Script popup select the .js from the dropdown we placed there earlier (ImportDeepbotCSV.js)
7. Select the CSV file we saved in Part 1 earlier, and then pick which currency you want to be overwritten by the CSV.
8. Click Add, then Save Changes. You might be prompted to create a command trigger, this is just the name of the command at the top. You can call it !script or whatever you like. Make sure everything is saved.
9. In the Commands list, find your new !script command and look for the little blue play button to the left of it. Click on the play button. THIS WILL DO THE THING (start the script running to update your Viewer Database).
10. There is no immediate user feedback that the script is working, so to check, you can look at Firebot's logs. Click File -> Open Logs Folder. Find the most recent logs file in this document, open it, and scroll to the bottom. If the script is working you'll see some text generating here.
11. The script takes a couple minutes to execute, you can check on its progress by closing the log file and reopening it to see if new lines are being added at the bottom. If you see any 400 errors, some usernames in your database may be malformed and you will
need to manually remove those to avoid import failures for other users nearby in the CSV.
12. When you open the log and it says "DeepBot data import complete" at the bottom you are good to go! Check your Viewers tab and confirm that all the data now matches DeepBot.

# For Developers (or if you want to generate your own .js file)
### Setup
1. Check out this repository and run `npm install`
2. (optional) In Firebot, click Settings -> Scripts -> Custom Scripts, clear custom script cache => on
  This will ensure that changes to this script are applied immediately instead of requiring you to restart the bot each time.

### Development
1. `npm run build:dev`
- Automatically copies the compiled .js to Firebot's scripts folder.
