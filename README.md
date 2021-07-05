# FusionAuth Deeplink Node.js example

This project is built on top of the fusionauth-example-node application from the [5-Minute Setup Guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide). This addition to that project illustrates the ability to save the application state and to return to the same state upon authenication.

This application will use the same OAuth Authorization Code workflow as the Node Example.

## To run

This assumes you already have a running FusionAuth instance, user and application running locally. If you don't, please see the [5-Minute Setup Guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide) to do so.

* update your FusionAuth application to allow a redirect of `http://localhost:3000/oauth-redirect`
* make sure your user has a first name.
* `npm install`
* update `routes/index.js` with the client id and client secret of your FusionAuth application.
* `npm start`

Go to http://localhost:3000/ and click through to a product page. Then click login and notice that once authenticated you are returned to the same product page.

