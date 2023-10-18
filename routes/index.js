const express = require('express');
const router = express.Router();
const {FusionAuthClient} = require('@fusionauth/typescript-client');
const clientId = '8ce01d5d-99b8-4853-b7ff-1d174544f01c';
const clientSecret = 'z0eSN_IGYuA-0mP8FnmF4AwPK3iJk4n82L4LRN25dtA';
const client = new FusionAuthClient('noapikeyneeded', 'http://localhost:9011');
const pkceChallenge = require('pkce-challenge');


/* GET home page. */
router.get('/', function (req, res, next) {
    const stateValue = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    req.session.stateValue = stateValue;
    const urlStateValue = stateValue + '-' + encodeURIComponent(req.url);

    //generate the pkce challenge/verifier dict
    const pkce_pair = pkceChallenge();
    // Store the PKCE verifier in session
    req.session.verifier = pkce_pair['code_verifier'];
    const challenge = pkce_pair['code_challenge'];
    res.render('index', {
        user: req.session.user,
        title: 'FusionAuth Deeplink Example',
        clientId: clientId,
        challenge: challenge,
        stateValue: urlStateValue
    });
});

/* GET product page. */
router.get('/product', function (req, res, next) {
    const stateValue = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const name = req.query.name;

    req.session.stateValue = stateValue;
    const urlStateValue = stateValue + '-' + encodeURIComponent(req.url);

    //generate the pkce challenge/verifier dict
    const pkce_pair = pkceChallenge();
    // Store the PKCE verifier in session
    req.session.verifier = pkce_pair['code_verifier'];
    const challenge = pkce_pair['code_challenge'];
    res.render('product', {
        user: req.session.user,
        title: titleCase(name),
        clientId: clientId,
        challenge: challenge,
        stateValue: urlStateValue
    });
});

/* Logout page */
router.get('/logout', function (req, res, next) {
    req.session.user = null;
    res.redirect(302, '/');
});

/* OAuth return from FusionAuth */
router.get('/oauth-redirect', function (req, res, next) {
//tag::extractURLFromState[]
    const stateFromServer = req.query.state;
    const stateValue = stateFromServer.split('-')[0];
    const urlToEndUpAt = stateFromServer.split('-')[1];
    if (stateValue !== req.session.stateValue) {
        console.log("State doesn't match. uh-oh.");
        console.log("Saw: " + stateFromServer + ", but expected: " + req.session.stateValue);
        res.redirect(302, '/');
        return;
    }
    // This code stores the user in a server-side session
    client.exchangeOAuthCodeForAccessTokenUsingPKCE(req.query.code,
        clientId,
        clientSecret,
        'http://localhost:3000/oauth-redirect',
        req.session.verifier)
        .then((response) => {
            return client.retrieveUserUsingJWT(response.response.access_token);
        })
        .then((response) => {
            if (!response.response.user.registrations || response.response.user.registrations.length == 0 || (response.response.user.registrations.filter(reg => reg.applicationId === clientId)).length == 0) {
                console.log("User not registered, not authorized.");
                res.redirect(302, '/');
                return;
            }

            req.session.user = response.response.user;
        })
        .then((response) => {
            res.redirect(302, urlToEndUpAt);
        }).catch((err) => {
        console.log("in error");
        console.error(JSON.stringify(err));
    });
//end::extractURLFromState[]

    // This code pushes the access and refresh tokens back to the browser as secure, HTTP-only cookies
    // client.exchangeOAuthCodeForAccessToken(req.query.code,
    //                                        clientId,
    //                                        clientSecret,
    //                                        'http://localhost:3000/oauth-redirect')
    //     .then((response) => {
    //       res.cookie('access_token', response.response.access_token, {httpOnly: true});
    //       res.cookie('refresh_token', response.response.refresh_token, {httpOnly: true});
    //       res.redirect(302, '/');
    //     }).catch((err) => {console.log("in error"); console.error(JSON.stringify(err));});
});

function titleCase(str) {
  return str.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
}

module.exports = router;
