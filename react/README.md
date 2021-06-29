# quickstart

Simple Web App to quickly connect to and try out OSDU APIs

## How to run

Execute the following commands:

install dependencies

```
yarn 
```

run an application

```
yarn start
```

## Project composition and rationale

### create-react-app

the project is built on top of a create-react-app package as unified method of starting small react projects.

- designed for a purpose to create such small projects
- it is well-known and questions can be googled with ease
- supported by the react community

### typescript

we encourage all web developers to use a good practice - to write typed code

- typescript provides a comprehensive functionality for the subject
- widely used and supported

### css

- the easiest way to write styles
- project is small enough not to encounter harsh consequences
- perfect markup and styling are not the subject of the project

### redux

our application has sufficently complex inner state to use a state manager

- simple and descriptive idea
- fit for the project's small size
- in contrary to mobx redux is known more widely

### thunk

as the application performs an asyncronous communication with an API, interractively responding to user actions, we need to handle side effects of redux-actions

- simple and descriptive idea
- fit for the project's small size
- in contrary to redux-saga thunk is easier to comprehend

### react-router

to build a modern single page application route handler is required
