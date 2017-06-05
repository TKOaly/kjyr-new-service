# Mayhem

KJYR registration system. 

**DON'T PUSH INCOMPLETE STUFF TO MASTER SINCE IT WILL BE DEPLOYED ON THE PRODUCTION SERVER**

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
6. Run `npm start`
7. Run `npm run-script create-admin` to create a admin user.