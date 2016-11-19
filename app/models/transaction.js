'use strict';

var _ = require('alloy/underscore'),
    moment = require('alloy/moment'),
    iban = require('iban'),
    getAmountString = function (amount) {
        return '€ ' + parseFloat(amount / 100).toFixed(2).replace('.', ',');
    },
    isBlank = function (str) {
        return !!(str||'').match(/^\s*$/);
    };

exports.definition = {
    config: {
        columns: {
            id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
            name: 'TEXT',
            iban: 'TEXT',
            amount: 'INTEGER',
            description: 'TEXT',
            created: 'INTEGER'
        },
        adapter: {
            db_name: 'testing_your_medals',
            type: 'sql',
            collection_name: 'transactions',
            idAttribute: 'id'
        }
    },
    extendModel: function (Model) {
        _.extend(Model.prototype, {
            defaults: function () {
                return { created: _.now() };
            },
            validate: function (attrs) {
                var errors = [];

                if (_.isUndefined(attrs.name) || isBlank(attrs.name)) {
                    errors.push({ name: 'name', message: 'Please fill name field.' });
                }
                if (_.isUndefined(attrs.iban) || isBlank(attrs.iban)) {
                    errors.push({ name: 'iban', message: 'Please fill iban field.' });
                } else if (!iban.isValid(attrs.iban)) {
                    errors.push({ name: 'iban', message: 'Given iban invalid.' });
                }
                if (_.isUndefined(attrs.amount)) {
                    errors.push({ name: 'amount', message: 'Missing amount' });
                } else if (!_.isNumber(attrs.amount)) {
                    errors.push({ name: 'amount', message: 'Amount must be a number' });
                } else if (attrs.amount === 0) {
                    errors.push({ name: 'amount', message: 'Amount may not be 0' });
                }
                if (_.isUndefined(attrs.description) || isBlank(attrs.description)) {
                    errors.push({ name: 'description', message: 'Please fill description field.' });
                }

                return errors.length > 0 ? errors : false;
            },
            transform: function () {
                var obj = this.toJSON();

                Object.defineProperty(obj, 'createdFormatted', {
                    get: function () {
                        return moment(obj.created).format('LLLL');
                    }
                });

                Object.defineProperty(obj, 'amountString', {
                    get: function () {
                        return getAmountString(obj.amount);
                    }
                });

                Object.defineProperty(obj, 'ibanCaps', {
                    get: function () {
                        return iban.printFormat(obj.iban);
                    }
                });

                return obj;
            }
        });

        return Model;
    },
    extendCollection: function (Collection) {
        _.extend(Collection.prototype, {
            getBalance: function () {
                var self = this,
                    sum = 0;

                _.each(self.models, function (item) {
                    sum += item.get('amount');
                });

                return sum;
            },
            transform: function () {
                var self = this;
                return {
                    balance: getAmountString(self.getBalance()),
                    count: self.models.length
                };
            },
            clear: function () {
                var self = this;
                // See http://stackoverflow.com/a/17712684
                _.invoke(self.toArray(), 'destroy');
            },
            comparator: function (item) {
                return -item.get('created');
            }
        });

        return Collection;
    }
};
