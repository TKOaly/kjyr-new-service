[![Build Status](https://mattermost.tko-aly.fi/buildStatus/icon?job=mayhem)](http://mattermost.tko-aly.fi/job/mayhem/)

# Mayhem

KJYR registration system. 

**DON'T PUSH INCOMPLETE STUFF TO MASTER SINCE IT WILL BE DEPLOYED ON THE PRODUCTION SERVER**

## Editing site content

Go to `src/config/` and open the `localization.json` file.

## Configuring constants

Go to `src/config/` and open the `config.js` file.

## Setting up a devenv

1. Get [Node.js](https://nodejs.org)
2. Clone this repository
3. Run `npm install --dev` in the repository root directory.
4. Set up a MySQL server
    - Create a new schema
5. Define the required ENV variables
    - KJYR\_DB_HOST
    - KJYR\_DB_USER
    - KJYR\_DB_PASSWORD
    - KJYR\_DB_NAME
    - KJYR\_COOKIE_SECRET
    - KJYR\_DBG_PORT
6. Run `npm start` (Sometimes this has to be ran twice to create the DB relations correctly)
7. Run `npm run-script create-admin` to create a admin user.

## Future imporvements

- Use MongoDB for saving site content, and implement editing into the admin control panel.
- Save reservations into the database.