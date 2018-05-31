# kjyr-new-service

[![Build Status](https://mattermost.tko-aly.fi/buildStatus/icon?job=mayhem)](http://mattermost.tko-aly.fi/job/mayhem/)

This repository contains source code for KJYR (Kumpulan Järjestöjen Yhteinen Risteily) registration system.

**DON'T PUSH INCOMPLETE STUFF TO MASTER SINCE IT WILL BE DEPLOYED ON THE PRODUCTION SERVER**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Table of Contents** _generated with [DocToc](https://github.com/thlorenz/doctoc)_

* [kjyr-new-service](#kjyr-new-service)
  * [Editing site content](#editing-site-content)
  * [Configuring constants](#configuring-constants)
  * [Setting up a devenv](#setting-up-a-devenv)
  * [Future improvements](#future-improvements)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Editing site content

Go to `src/config/` and open the `localization.js` file.

## Configuring constants

Go to `src/config/` and open the `config.js` file.

## Setting up a development environment

1.  Install yarn
2.  Clone this repository
3.  Run `yarn --dev` in the repository root directory.
4.  Set up a MySQL server
    * Create a new schema
5.  Copy `.env.example` to `.env` and define the required ENV variables:
    * PORT
    * KJYR_DB_HOST
    * KJYR_DB_USER
    * KJYR_DB_PASSWORD
    * KJYR_DB_NAME
    * KJYR_COOKIE_SECRET
    * KJYR_DBG_PORT
6.  Run `yarn start` (Sometimes this has to be ran twice to create the DB relations correctly)
7.  Run `yarn create-admin` to create a admin user.

## Future improvements

* Use MongoDB for saving site content, and implement editing into the admin control panel.
* Save reservations into the database.
* Table reservations
* Buying multiple breakfasts or buffets
* Use async/await
* Just refactor everything to reduce internal errors and crashes

* TypeScript
* Folder structure (MVC)
* Single database class
