const config = require('./config.json')
const secret = require('./secret.json')

// Cool function I need it

const {promisify} = require('util')

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

// Creating shorten function

const {google} = require('googleapis')

const urlshortener =  google.urlshortener('v1')

// I like promises

const shortenerpromise = promisify(urlshortener.url.insert)

let shorten = async (link) => {
  let item = await shortenerpromise({
    key: secret.googleApiKey,
    resource: {
      longUrl: link
    }
  })
  return item.data.id
}

// Custom campaign link builder

let gaCampaign = (url, source, name='social') => {
  url = url.concat('?')
  if (source){
    url = url.concat('utm_source=' + source + '&')
  }
  url = url.concat('utm_campaign=' + name)
  return url
}

// Loading fb and istancing it if enabled

if (secret.facebookId && secret.facebookKey && secret.facebookToken) {
  const FB = require('fb')
  let fb = new FB.Facebook({
    appID: secret.facebookId,
    secret: secret.facebookKey
  })
  fb.setAccessToken(secret.facebookToken)
}

// Function to post to facebook

if (typeof(fb) !== 'undefined') {
  let postFacebook = async (item) => {
    let link = item.link
    if (config.GaCampaigns) {
      link = gaCampaign(link, config.facebookSource)
    }
    if (secret.googleApiKey) {
      link = await shorten(link)
    }

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

// function to confirm that the post isn't too old and hasn't been publicized yet

let validate = (item) => {
  return (storage.getItemSync('history').indexOf(item.link) == -1)
}

// main function

let main = () => {
  parser.parseURL(config.feedUrl).then((feed) => {
    feed.items.forEach((item) => {
      if (validate(item)) {
        shorten(item.link).then()
        if ( typeof(fb) !== 'undefined' ) { postFacebook(item) }
        if ( typeof(twitter) !== 'undefined' ) { postTwitter(item) }
        history = [item.link].concat(storage.getItemSync('history'))
        //storage.setItemSync('history', history)
      }
    })
  })
}

// autorun on load

main()

// exposing a webhook to trigger main
