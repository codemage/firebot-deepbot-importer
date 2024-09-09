# Deepbot CSV Importer -- Custom Script for FireBot Twitch bot

This imports DeepBot CSV viewer data into [FireBot](https://firebot.app).

Currently it only works if you first use the xlsx import built into FireBot to
create all the users first; this will then correct their currency and last seen dates.

# For DeepBot Users Migrating to FireBot

These steps have been kindly written up by [Marstead](https://twitch.tv/Marstead).

## PART 1: CSV + XLSX FILES AND INITIAL IMPORT

1. You need to get the full CSV from @ianchandler1990's tool. The tool is here:
  https://chandler-gaming.com/PHP/DeepbotApi/deepbotapi.html
  You will want to access this tool via Firefox, not Chrome, if you have a very large user database Chrome can kill the tool before it finishes processing. The CSV produced by this tool has more data than the Export you can get from Deepbot directly, these fields can make it to Firebot.
2. Go to that link. Open DeepBot and click "Master Settings" in the top right of the Config tab. Under Master Settings scroll down until you encounter "API Secret". Copy the API Secret and paste it into the "API Key" field at the link above. Click "Connect". Wait for it to say "Ready". When it says "Ready" click "Get Users".
3. Wait a long time, preferably without doing anything else on your machine. This can take 5-10-15-20 minutes depending on how big your database is. Firefox will give you a prompt to kill the tab, ignore it. After letting it sit for a long time try clciking "Download CSV". Wait another minute or so, you won't get immediate feedback that the button click succeeded.
4. This will give you a "data.csv" file. Put this somewhere you can easily get it later.
5. Next we need to generate an .xlsx file that can be read by Firebot's native importer tool. Unfortunately Firebot does not support adding fresh users into the system with scripts, it can only modify existing users. So even though Firebot's native tool is imperfect (it only captures your viewer list and their watch hours), we need to get your viewers in there so the script can update them.
6. The .xlsx file has the following requirements: it must have exactly one sheet named "CURRENCY". It must have a total of 6 columns. Column A must say "Name", Column B must say "Rank", Column C must say "Points", and Column D must say "Hours". Here's a [sample file](sample_streamlabs_format_export.xlsx) you can edit.
7. Create the xlsx file (you can start it in Google Sheets, which is free) and then copy and paste your users from the CSV we generated above into the "Name" column and your Watch Hours into the "Hours" column. You can copy your points and ranks over if you have them but Firebot is going to ignore them at this stage, so it doesn't matter. Save the file as an .xlsx somewhere you can find it.
8. Open Firebot. Click on the Viewers tab on the left. Click the blue "Import Viewers" button at the top. Choose the .xlsx file you made earlier, and click go to import. Depending on how many viewers you have it will take several minutes so give it a few minutes. You'll notice a significant number of your viewers have been culled, these are viewers who have been banned on Twitch or deleted their accounts, and in some cases viewers with extremely low hours watched. When the import is done spot check that the data looks right compared to Deepbot, and then you can move to the next step, running the script to get the rest of the values in.

## PART 2: RUNNING THIS CUSTOM SCRIPT TO EDIT YOUR VIEWERS DATABASE
0. Before doing any of this make sure you've done everything in Part 1 above. Also, make sure you have a Currency added in Firebot. To do this, go to the Currency tab and add a new Currency. You'll be prompted to select this for the import later.
1. In Firebot, click Settings -> scripts -> custom scripts == Enabled. Note you are committing to running custom third party scripts when doing this so you may want to turn these back off after the import is complete.
2. In Firebot, click File -> Open Data Folder -> Open the Scripts folder -> Put the [script](https://github.com/codemage/firebot-deepbot-importer/releases/download/v0.0.1/importDeepbotCSV.js) file there. 
3. In Firebot, click Commands. In Commands, -> New custom command and then make sure you're in Advanced Mode. Advanced Mode is an option at the bottom of the screen. When you are, click -> restrictions -> permissions -> add. Then click on the big "Permissions" box to expand it, and click the "Streamer" checkbox. This ensures only you can run this script and not any of your viewers.
4. Scroll down to where it says "Base Effects" and click "Add New Effect". In the list of effects, search for "Run Custom Script", select it and click add.
5. In the Run Custom Script popup select the .js from the dropdown we placed there earlier (ImportDeepbotCSV.js)
6. Select the CSV file we saved in Part 1 earlier, and then pick which currency you want to be overwritten by the CSV.
7. Click Add, then Save Changes. You might be prompted to create a command trigger, this is just the name of the command at the top. You can call it !script or whatever you like. Make sure everything is saved.
8. In the Commands list, find your new !script command and look for the little blue play button to the left of it. Click on the play button. THIS WILL DO THE THING (start the script running to update your Viewer Database).
9. There is no immediate user feedback that the script is working, so to check, you can look at Firebot's logs. Click File -> Open Logs Folder. Find the most recent logs file in this document, open it, and scroll to the bottom. If the script is working you'll see some text generating here.
10. The script takes a couple minutes to execute, you can check on its progress by closing the log file and reopening it to see if new lines are being added at the bottom. The script will encounter some errors while processing, this is normal (it's throwing out banned users, duplicate users, etc).
11. When you open the log and it says "DeepBot data import complete" at the bottom you are good to go! Check your Viewers tab and confirm that all the data now matches DeepBot.

# For Developers (or if you want to generate your own .js file)
### Setup
1. Check out this repository and run `npm install`
2. (optional) In Firebot, click Settings -> Scripts -> Custom Scripts, clear custom script cache => on
  This will ensure that changes to this script are applied immediately instead of requiring you to restart the bot each time.

### Development
1. `npm run build:dev`
- Automatically copies the compiled .js to Firebot's scripts folder.
