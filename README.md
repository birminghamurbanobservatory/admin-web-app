# AdminWebApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.22.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build & Deploy

1. It's worth committing any recent changes then incrementing the version number, e.g. with `npm version patch` or `npm version minor`.
2. Then build a production version with `ng build --prod` or `npm run build`. The build will be stored in the `dist/` directory.
3. Deploy to firebase using `firebase deploy -m "99.99.99"` or `npm run deploy`. Use the version number listed in package.json for consistency.

Because a "site" property is listed in _firebase.json_, it knows which site this code is for. I.e. because I have multiple Urban Observatory sites and web apps hosted under the same project on firebase.

If you want to build and serve the production version locally use `ng build --prod`, e.g. to check it works ok with the production environment variables.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Added Extras

Authentication provided by Auth0, following this [tutorial](https://auth0.com/docs/quickstart/spa/angular2/01-login).

Pretty looking components provided by [Angular Material](https://material.angular.io/).

Flexbox functionality provided via [@angular/flex-layout](https://github.com/angular/flex-layout). See the options in action [here](https://tburleson-layouts-demos.firebaseapp.com/#/docs). I needed to install a v8 version of this package for it to work with Angular 8 (`npm i @angular/flex-layout@8.0.0-beta.27`).

Icons are available through [Angular Material](https://material.angular.io/components/icon/overview). You can see the available icons [here](https://material.io/resources/icons).

## Troubleshooting

If you're having issues loading the page you may need to try clearing your cache. I had some issues running it in Google Chrome. 







