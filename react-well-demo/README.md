# Well Demo
This is a demo application for demonstrating how applications can consume OSDU and leverage it as a source for subsurface data.
This is a React application displaying wells on the Norwegian coast, and their respective wellbore, trajectories and well logs, all using OSDU as its source.

![image](https://github.com/equinor/osdu-tutorials/assets/35703118/e34e6197-11a0-43db-92bd-c2dbe0adaaf8)

## Running the app locally
Prerequisites for running the app locally is to have Node installed. Running `npm install` and `npm start` from source should be enough for loading the initial page. Some features requires the two equinor-scoped npm packages, `wellx-wellog` which is private, and `esv-intersection` which is public. In order to install the `wellx-wellog` package, you need to create an `.npmrc` file at the project root directory, with this content:

```
react-well-demo/.npmrc

@equinor:registry=https://npm.pkg.github.com/equinor
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_ACCESS_TOKEN
```

Aquire Github access token - Go to https://github.com, click on your profile and go to Settings. Then go to Developer settings -> Personal access tokens -> Tokens and then Generate new token

After you have added the `.npmrc` file with a valid Github access token, you can run `npm install`. After running `npm install` you can delete the `.npmrc` and rerun `npm install` followed by `npm start`.

Keep in mind that currently all calls to the OSDU Storage API are blocked by CORS which has to be configured on the server side. Untill then, features for reading trajectories and well logs will be redundant.
