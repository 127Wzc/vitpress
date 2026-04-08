setTimeout(function () {
    Java.perform(function () {
        function s(v) {
            try {
                if (v === null || v === undefined) return 'null';
                return String(v);
            } catch (e) {
                return '[toString failed]';
            }
        }

        try {
            var NetSecurityServiceImpl = Java.use('com.tencent.gamehelper.biz.account.service.NetSecurityServiceImpl');
            var updateUserKey = NetSecurityServiceImpl.updateUserKey.overload(
                'java.lang.String',
                'java.lang.String'
            );

            updateUserKey.implementation = function (userId, userKey) {
                console.log('================ [camp][updateUserKey] ================');
                console.log('[camp][updateUserKey] userId=' + s(userId));
                console.log('[camp][updateUserKey] userKey=' + s(userKey));
                return updateUserKey.call(this, userId, userKey);
            };

            console.log('[+] Hooked NetSecurityServiceImpl.updateUserKey');
        } catch (e) {
            console.log('[-] Failed to hook updateUserKey: ' + e);
        }
    });
}, 3000);
