function start() {
    gapi.load('auth2', function () {
        auth2 = gapi.auth2.init({
            client_id: '513169599185-pm74pcrbskd7frm631dte4nka058034t.apps.googleusercontent.com',
            // Scopes to request in addition to 'profile' and 'email'
            //scope: 'additional_scope'
            scope: ['email', 'profile', 'openID']
        });
    });
}