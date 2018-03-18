const config = require('./config.json')
const secret = require('./secret.json')

// Utility I need very often
const {promisify} = require('util')

// Load rss-parser and instance it
const Parser = require('rss-parser')
let parser = new Parser

// Create a db using node-persist
let storage = require('node-persist')
storage.initSync({dir: 'db'})

// Populate the db with an empty array on first on first boot
if (storage.values().length == 0) {
  storage.setItemSync('history', [])
}

// Check if Google api key is set
if (typeof process.env.GOOGLE_API_KEY !== 'undefined') {
  // Load googleapis
  const {google} = require('googleapis')
  // Load the urlshorten google api endpoint
  const urlshortener =  google.urlshortener('v1')
  // Create a promise from it
  const shortenerpromise = promisify(urlshortener.url.insert)
  // Async function that returns shortened link
  var shorten = async (link) => {
    try {
      let item = await shortenerpromise({
        key: env.GOOGLE_API_KEY,
        resource: {
          longUrl: link
        }
      })
    } catch(err) {
      throw err
    }
    return item.data.id
  }
}

// Custom campaign link builder function
let gaCampaign = (url, source, name='social') => {
  url = url.concat('?')
  if (source){
    url = url.concat('utm_source=' + source + '&')
  }
  url = url.concat('utm_campaign=' + name)
  return url
}

// Loading fb and istancing it if enabled WORK IN PROGRESS
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
    if (shortener) {
      try {
        link = await shorten(link)
      } catch(err) {
        console.error(err)
      }
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

// Validation function
let validate = async (item) => {
  // Load the array of previously posted items
  let history = await storage.getItem('history')
  //Check time elapsed from pubblication
  let pubDate = new Date(item.pubDate)
  let now = new Date()
  let elapsed = now.getTime() - pubDate.getTime()

  return (history.indexOf(item.link) == -1 && elapsed < 1000*24*60*60)
}

// main function
let main = () => {
  parser.parseURL(config.feedUrl)
    .then((feed) => {
      feed.items.forEach( item => {
        validate(item).then( (valid) => {
          if (valid) {
            if ( typeof(fb) !== 'undefined' ) { postFacebook(item) }
            if ( typeof(twitter) !== 'undefined' ) { postTwitter(item) }
            if (typeof shorten !== 'undefined') {
              try {
                shorten(item.link).then(console.log) // Just as a demostration/Will be removed soon
              } catch(err) {
                console.error(err)
              }
            }
            history = [item.link].concat(storage.getItemSync('history'))
            storage.setItemSync('history', history)
          }
        })
      })
    })
    .catch( err => console.log(err) )
}

// autorun on load
main()

// exposing a webhook to trigger main
