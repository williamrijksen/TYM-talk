'use strict';

var Backbone = require('alloy/backbone'),
    _ = require('alloy/underscore'),
    nfcModule = require('ti.nfc'),
    dispatchFilter = nfcModule.createNfcForegroundDispatchFilter({
        intentFilters: [
            { action: nfcModule.ACTION_NDEF_DISCOVERED, mimeType: '*/*' },
            { action: nfcModule.ACTION_NDEF_DISCOVERED, scheme: 'http' }
        ],
        techLists: [
            ['android.nfc.tech.NfcF'],
            ['android.nfc.tech.Ndef'],
            ['android.nfc.tech.MifareClassic'],
            ['android.nfc.tech.NfcA']
        ]
    });

module.exports = function (activity) {
    var nfcAdapter,
        self = this;

    function discovered(e) {
        self.trigger('discovered', e);
    }

    function onResume() {
        nfcAdapter.enableForegroundDispatch(dispatchFilter);
    }

    function onNewIntent(e) {
        nfcAdapter.onNewIntent(e.intent);
    }

    function onPause() {
        nfcAdapter.disableForegroundDispatch();
    }

    function destruct() {
        activity.removeEventListener('newintent', onNewIntent);
        activity.removeEventListener('pause', onPause);
        activity.removeEventListener('resume', onResume);
        nfcAdapter = undefined;
    }

    nfcAdapter = nfcModule.createNfcAdapter({
        onNdefDiscovered: discovered
    });

    if (nfcAdapter.isEnabled()) {
        nfcAdapter.enableForegroundDispatch(dispatchFilter);
        activity.addEventListener('newintent', onNewIntent);
        activity.addEventListener('pause', onPause);
        activity.addEventListener('resume', onResume);
    }

    _.extend(this, Backbone.Events, {
        destruct: destruct
    });
};
