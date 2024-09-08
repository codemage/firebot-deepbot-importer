# Deepbot CSV Importer -- Custom Script for FireBot Twitch bot

This imports DeepBot CSV viewer data into [FireBot](https://firebot.app).

Currently it only works if you first use the xlsx import built into FireBot to
create all the users first; this will then correct their currency and last seen dates.

### Setup
1. Check out this repository and run `npm install`

### Building
Dev:
1. `npm run build:dev`
- Automatically copies the compiled .js to Firebot's scripts folder.

Release:
1. `npm run build`
- Copy .js from `/dist`