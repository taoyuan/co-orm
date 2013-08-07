"use strict";

var orm = require('orm'),
    orms = require('orms'),
    _ = require('lodash');

exports.init = function (compound) {

    var app = compound.app;
    var root = compound.root;
    var models = compound.models;

    if (!compound.orm) compound.orm = {};
    if (!compound.orm._schemas) compound.orm._schemas = [];


    var confFile = (root || app.root) + '/config/database';
    var appConf = app.get('database');
    var config = compound.orm.config = appConf || {};
    var schema = null;

    if (!compound.parent) {
        if (!appConf) {
            try {
                var cf = require(confFile);
                if (cf instanceof Array) cf = cf[0];
                if (typeof cf === 'function') {
                    config = cf(compound);
                } else {
                    config = cf[app.set('env')];
                }
            } catch (e) {
                console.log('Could not load config/database.{js|json|yml}');
                throw e;
            }
        }

        schema = orm.connect(config);
        schema.on('connect', function (err, schema) {
            if (err) throw err;
            schema.connected = true;
        });

    } else {
        schema = compound.parent.orm._schemas[0];
    }

    loadSchema(schema, compound, app, models);

    function loadSchema(schema, compound, app, models) {
        var _models = orms.load('orm', schema, (root || app.root) + '/db/schema', false) || {};
        for (var name in _models) if (models.hasOwnProperty(name)) {
            models[name] = _models[name];
        }
        compound.orm._schemas.push(schema);
        compound.schema = schema; // one schema
    }
};

