# Deployment Guide

This guide is intended for developers working on maintaining the game. It describes internal processes that are only a small number of people have access to.

## Online Version

To update the online version of the game (i.e. [play.elaragame.com](https://play.elaragame.com/)), simply push to the `main` branch. (Make sure you update the changelog and bump the version number first). Everything else is handled automatically.

## Itch.io

1. Run `npm run build:itchio`
2. Find the __web/dist-itchio-VERSION__ folder where "VERSION" is the version of the game you just built.
3. Zip the folder (e.g. by right clicking and clicking "Compress").
4. Navigate to the [Itch.io dashboard](https://itch.io/game/edit/2292101).
5. Find the "Uploads" section and upload the zip file.
6. Check the box indicating "This game will be played in the browser".
7. Click "Save" near the top right.
8. Double check that the game works by visiting [the game page](https://albrow.itch.io/elara).
9. Remove any zip files for older versions from Itch.io.
10. Make an update post to [the dev log](https://itch.io/dashboard/game/2292101/new-devlog).


## Steam

1. Run `npm install` from inside the __electron/__ directory.
2. Run `npm run build:electron`.
3. Find the __electron/dist/win-unpacked__ folder.
4. Zip the folder (e.g. by right clicking and clicking "Compress").
5. Manually append the version number to the zipped file.
6. Navigate to the [Steamworks depot upload page](https://partner.steamgames.com/apps/depotuploads/2657610).
7. Upload the ZIP file, using the "Standard" option from the dropdown.
8. Wait for the build to upload, then in the "Commit uploaded depots as build" section:
    - Add the version number to the notes field.
    - Leave the "build for live branch" dropdown to "None".
    - Click "Commit".
9. Go to the [App Data Admin](https://partner.steamgames.com/apps/builds/2657610) page.
10. Find the build you just uploaded and set the "Select an app branch" dropdown to "default".
11. Click "Preview change".
12. In the "Optional internal comment" field add something like "Release version X.X.X.".
13. Click "Set Build Live Now".
14. If necessary, confirm the release on your mobile app.
15. Add patch notes for the release on the next screen.
16. Go to the "Publish tab".
17. Click "Prepare for Publish".
18. Fill in the required text boxes and then click "Really Publish".
