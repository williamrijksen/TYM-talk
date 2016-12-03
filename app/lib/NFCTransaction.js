'use strict';

var Backbone = require('alloy/backbone'),
    _ = require('alloy/underscore'),
    NFCHandler = require('./NFCHandler');

module.exports = function (activity, transactionCollection) {
    var nfcHandler = new NFCHandler(activity),
        self = this;

    function newTransaction() {
        transactionCollection.create({
            name: 'Test payment',
            iban: 'BE68539007547034',
            amount: -500,
            description: 'Payment for Maikel'
        });
        self.trigger('transaction:new');
    }

    nfcHandler.on('discovered', newTransaction);

    function destruct() {
        nfcHandler.off('discovered', newTransaction);
        nfcHandler.destruct();
    }

    _.extend(this, Backbone.Events, {
        destruct: destruct
    });
};
