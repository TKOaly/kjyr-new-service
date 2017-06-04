const express = require('express');
const route = express.Router();
const studorgs = require('./studorgs');
const cabins = require('./cabins');
const persons = require('./persons');
const preferences = require('./preferences');
const cruise = require('./cruise');

route.use('/studorgs', studorgs);
route.use('/studorgs/:studOrgId/cabins', cabins);
route.use('/studorgs/:studOrgId/persons', persons);
route.use('/cruise', cruise);
route.use('/preferences', preferences);

module.exports = route;