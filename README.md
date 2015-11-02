# insta_bot

Instagram like automator

## Need:
- Node.JS
- mocha (npm install mocha)
- Selenium + firefox plugin
- npm install webdriverio@2.4.5 assert async


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

Change tag in tags array (./data/tags file)

## Use:
- Start Selenium server
- mocha app.js
