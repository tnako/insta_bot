var webdriverio = require('webdriverio'),
  credentials = require('./data/credentials'),
  tags = require('./data/tags'),
  assert = require('assert'),
  async = require('async');

var pause_multi = 60;
var rows = 30;
var already_liked_tags = 15; // likes

var maked_likes = 0;

setInterval(function() {
  console.log(' ----> Likes per 10 minute:', maked_likes);
  maked_likes = 0;
}, 1000 * 60 * 10);

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

shuffle(tags);

describe('Insta bot task', function() {

  this.timeout(99999999);
  var client = {};

  before(function(done) {
    client = webdriverio.remote({
      desiredCapabilities: {
        browserName: 'firefox'
      }
    });

    client.init(done);
  });

  it('Open instagram.com', function(done) {
    client
      .url('https://instagram.com/accounts/login/')
      .getTitle(function(err, title) {
        assert(err === undefined);
        assert(title === 'Login • Instagram');
      })
      .call(done);
  });

  it('Login', function(done) {
    client
      .pause(1300)
      .waitFor('#lfFieldInputUsername', 10000)
      .setValue('#lfFieldInputUsername', credentials.username)
      .setValue('#lfFieldInputPassword', credentials.password)
      .click('.-cx-PRIVATE-LoginForm__loginButton')
      .pause(5300)
      .call(done);
  });

  it('Like tag', function(done) {

    var timer = setTimeout(function() {
      client.call(done);
    }, 295000);

    async.eachSeries(tags, function(tag, callback) {

      console.log('Begin', tag);

      client
        .url('https://instagram.com/explore/tags/' + tag + '/')
        .pause(330)
        .isExisting('.-cx-PRIVATE-AutoloadingPostsGrid__moreLink', function(err, isExisting) {
          if (isExisting) {
            var self = this;

            self
              .click('.-cx-PRIVATE-AutoloadingPostsGrid__moreLink')
              .pause(530)
              .elements('.-cx-PRIVATE-PostsGrid__root > div > a')
              .then(function(elements) {

                var iter = 0;
                var likes_in_tag = 0;
                //				async.eachSeries(elements.value, function (element, callback2) {
                async.whilst(function() {
                  return iter < rows;
                }, function(callback2) {
                  iter++;

                  if (iter % 10 == 0) {
                    console.log('Step', iter, '/', rows);
                  }
                  async.eachSeries([1, 2, 3], function(i, callback3) {
                    self
                      .waitFor('.-cx-PRIVATE-PostsGrid__root .-cx-PRIVATE-PostsGrid__row:nth-child(' + iter + ') > a:nth-child(' + i + ')', 10000)
                      .pause(30 * pause_multi)
                      .click('.-cx-PRIVATE-PostsGrid__root .-cx-PRIVATE-PostsGrid__row:nth-child(' + iter + ') > a:nth-child(' + i + ')')
                      .pause(490 * pause_multi)
                      .isExisting('.-cx-PRIVATE-PostInfo__likeButton', function(err, isExisting) {
                        if (isExisting) {
                          clearTimeout(timer);
                          timer = setTimeout(function() {
                            client.call(done);
                          }, 295000);

                          self
                            .waitFor('.-cx-PRIVATE-PostInfo__likeButton', 10000)
                            .isExisting('.coreSpriteHeartOpen', function(err, isExisting) {
                              if (isExisting) {
                                clearTimeout(timer);
                                timer = setTimeout(function() {
                                  client.call(done);
                                }, 75000);
                                likes_in_tag = 0;

                                self
                                  .pause(130 * pause_multi)
                                  .click('.-cx-PRIVATE-PostInfo__likeButton')
                              } else {
                                likes_in_tag++;
                                if (already_liked_tags < likes_in_tag) {
                                  callback3('Many likes');
                                }
                              }

                              self
                                .pause(190 * pause_multi)
                                .click('.-cx-PRIVATE-Modal__closeButton')
                                .then(function() {
                                  if (!isExisting) {
                                    likes_in_tag++;
                                    if (already_liked_tags < likes_in_tag) {
                                      callback3('Many likes');
                                    } else {
                                      callback3();
                                    }
                                  } else {
                                    maked_likes++;
                                    callback3();
                                  }
                                });

                            });
                        } else {
                          callback3();
                        }
                      })
                  }, function(err) {
                    if (err) {
                      console.log(err);
                    }
                    callback2(err);
                  });
                }, function(err) {
                  if (err) {
                    console.log(err);
                  }
                  callback();
                });
              })

          } else {
            callback();
          }
        })

    }, function(err) {
      if (err) {
        throw err;
      }
      console.log('Well done :-)!');
      client.call(done);
    });
  })


  after(function(done) {
    client.end(done);
  });
});
