"use strict";

module.exports = exports = function(schema) {

    if (schema.automigrate) return {};

    schema.automigrate = function automigrate (cb) {
        schema.drop(function (err) {
            if (err) return cb(err);
            return schema.sync(function (err) {
                if (err) throw err;
                cb();
            });
        });
    };

    schema.autoupdate = function autoupdate (cb) {
        schema.sync(function (err) {
            if (err) throw err;
            cb();
        });
    };

    return {
        define: function (Model) {
            Model.schema = schema;

            Model.upsert = function (data, callback) {
                var Model = this;
                if (!data.id) return this.create(data, callback);
                return this.get(data.id, function (err, inst) {
                    if (inst) {
                        console.log('update model');
                        return inst.save(data, callback);
                    } else {
                        console.log('create model');
                        return Model.create(data, callback);
                    }
                });
            };
        }
    };
};