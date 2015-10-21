# insta_bot

Instagram like automator

## Need:
- Node.JS
- mocha (npm install mocha)
- Selenium + firefox plugin
- npm install webdriverio assert async


## Configure:
Create file ./data/credentials like
```
var credentials = {

        username: 'USER',
        password: 'PASS',
}

module.exports = credentials;
```

Change USER and PASS with your instagram login-password


## Use:
mocha app.js
