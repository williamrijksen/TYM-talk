var NFCTransaction = require('NFCTransaction'),
    nfcTransaction;

function close() {
    'use strict';

    nfcTransaction.destruct();
    $.scan.close();
}

function openScanner() {
    'use strict';

    nfcTransaction = new NFCTransaction($.scan.getActivity(), $.args.listConnection);
    nfcTransaction.on('transaction:new', close, $);
}

function onClose() {
    'use strict';

    nfcTransaction.off('transaction:new', close, $);
    $.removeListener();
}

(function () {
    'use strict';

    $.addListener($.scan, 'open', openScanner);
    $.addListener($.scan, 'close', onClose);
    $.addListener($.scan, 'android:back', close);
    $.scan.open();
}());
