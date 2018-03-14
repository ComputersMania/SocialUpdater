const config = require('./config.json')
const secret = require('./secret.json')

// Loading rss-parser and creating an in instance of it

const Parser = require('rss-parser')
let parser = new Parser

// Loading db

let storage = require('node-persist')
storage.initSync({dir: 'db'})

// Creating array on first boot

if (storage.values().length == 0) {
  storage.setItemSync('history', [])
}

// Loading gapi-url

const gapiUrl = require('gapi-url')

// Custom campaign link builder

let gaCampaign = (url, source, name='social') => {
  url.concat('?')
  if (source){
    url.concat('utm_source=' + source + '&')
  }
  url.concat('utm_campaign=' + name)
  return url
}

// Loading fb and istancing it if enabled

if (secret.facebookKey) {
  FB = require('fb')
  fb = new FB.facebook()
  fb.setAccessToken(secret.facebookKey)
}

// Function to post to facebook

let postFacebook = (item) => {
  if (config.GaCampaigns) {
    link = gaCampaign(item.link)
  }
  if (secret.googleApiKey) {
    link = gapiUrl.shortenURL()
  }
}

// Loading Twitter and istancing it

if (secret.twitterKey && secret.twitterSecret && secret.twitterToken) {
  Twitter = require('twitter')
  twitter = new Twitter({
    consumer_key: secret.twitterSecret,
    consumer_secret: secret.twitterSecret,
    bearer_token: secret.twitterToken
  })
}

// Function to post to twitter

let postTwitter = (item) => {

}

// Loading instagram and spawning an instance

if (secret.instagramId && secret.instagramSecret) {
  instangram = require('instagram')
}

// Routine to post to social networks

let postEverywhere = (item) => {
  console.log(item.title + ' ' + item.link)
  // Post on facebook
  // if (fb) { postFacebook(item) }
  // Post on Twitter
  // if (twitter) { postTwitter(item) }
}

// function to confirm that the post isn't too old and hasn't been publicized yet

let validate = (item) => {
  return (storage.getItemSync('history').indexOf(item.link) == -1)
}

// main function

let main = () => {
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
