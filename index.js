config = require('./config.json')
secret = require('./secret.json')

// Loading rss-parser and creating an in instance of it

Parser = require('rss-parser')
parser = new Parser

// Loading db

storage = require('node-persist')
storage.initSync({dir: 'db'})

// Creating array on first boot

if (storage.values().length == 0) {
  storage.setItemSync('history', [])
}

// Loading google-url and spawning an instance of it

GoogleUrl = require('google-url-2')
shortener = new GoogleUrl({"key" : secret.googleApiKey})

// Loading fb and istancing it if enabled

if (secret.facebookKey) {
  FB = require('fb')
  fb = new FB.facebook()
  fb.setAccessToken(secret.facebookKey)
}

// Loading Twitter and istancing it

if (secret.twitterKey && secret.twitterSecret && secret.twitterToken) {
  Twitter = require('twitter')
}

// Custom campaign link builder

custom_campaign = (url, source, name='social') => {
  url.concat('?')
  if (source){
    url.concat('utm_source=' + source + '&')
  }
  url.concat('utm_campaign=' + name)
  return url
}

// Function to post to facebook



// Routine to post to social networks

postEverywhere = (item) => {
  console.log(item.title + ' ' + item.link)
  // Post on facebook
  if (fb) {

  }
  // Post on Twitter
  if (secret.twitterKey) {

  }
}

// function to confirm that the post isn't too old and hasn't been publicized yet

validate = (item) => {
  return (storage.getItemSync('history').indexOf(item.link) == -1)
}

// main function

main = () => {
  parser.parseURL(config.feedUrl).then((feed) => {
    feed.items.forEach((item) => {
      if (validate(item)) {
        postEverywhere(item)
        history = [item.link].concat(storage.getItemSync('history'))
        storage.setItemSync('history', history)
      }
    })
  })
}

// autorun on load

main()

// exposing a webhook to trigger main
