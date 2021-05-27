# React TypeScript Sample for OSDU service in Omnia

## About this sample

This developer sample is used to run basic use cases for the OSDU services. You can also alter the configuration in `./src/authConfig.js` to switch OSDU instances.
This sample was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## How to run the sample

### Pre-requisites

- Install node.js if needed (<https://nodejs.org/en/>).

### Configure the application

- Open `./src/authConfig.ts` in an editor.
- Replace client id with the Application (client) ID from the portal registration, or use the currently configured lab registration.
  - Optionally, you may replace any of the other parameters, or you can remove them and use the default values.

#### Install npm dependencies for sample

```bash
# Install dev dependencies
yarn
```

#### Running the sample development server

1. In a command prompt, run `yarn start`.
1. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

- In the web page, click on the "Login" button and select either `Sign in using Popup` or `Sign in using Redirect` to begin the auth flow.

#### Running the sample production server

1. In a command prompt, run `npm run build`.
1. Next run `serve -s build`
1. Open [http://localhost:5000](http://localhost:3000) to view it in the browser.

#### Learn more about the 3rd-party libraries used to create this sample

- [React documentation](https://reactjs.org/)
- [TypeScript documentation](https://www.typescriptlang.org/docs/)
- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React Router documentation](https://reactrouter.com/web/guides/quick-start)
- [Material-UI documentation](https://material-ui.com/getting-started/installation/)