# OSDU tutorials for Python web application

### Overview

This sample demonstrates a Python web application that signs-in users with the Microsoft identity platform and calls OSDU Apis.

1. The python web application uses the Microsoft Authentication Library (MSAL) to obtain a JWT access token from the Microsoft identity platform:
2. The access token is used as a bearer token to authenticate the user when calling the OSDU Apis.

### Scenario

This sample shows how to build a Python web app using Flask and MSAL Python,
that signs in a user, and get access to OSDU apis.

## How to run this sample

### Step 1:  Clone or download this repository

From your shell or command line:

```Shell
git clone git@github.com:equinor/osdu-tutorials.git
```

### Step 2: Configure the pythonwebapp project


### Step 3: Run the sample

- You will need to install dependencies using pip as follows:
```Shell
$ pip install -r requirements.txt
```

Run app.py from shell or command line. Note that the host and port values need to match what you've set up in your redirect_uri:

```Shell
$ flask run --host localhost --port 5000
or
$ python app.py 
```
