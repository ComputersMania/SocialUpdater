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
<<<<<<< HEAD

  // Load googleapis
  const {google} = require('googleapis')

  // Load the urlshorten google api endpoint
  const urlshortener =  google.urlshortener('v1')

  // Create a promise from it
  const shortenerpromise = promisify(urlshortener.url.insert)

=======
  // Load googleapis
  const {google} = require('googleapis')
  // Load the urlshorten google api endpoint
  const urlshortener =  google.urlshortener('v1')
  // Create a promise from it
  const shortenerpromise = promisify(urlshortener.url.insert)
>>>>>>> 43b9252498de6b9257874a5eaf4f28e8177b7e79
  // Async function that returns shortened link
  var shorten = async (link) => {
    try {
      var item = await shortenerpromise({
        key: process.env.GOOGLE_API_KEY,
        resource: {
          longUrl: link
        }
      })
    } catch(err) {
      throw err
    }
    return item.data.id
  }
<<<<<<< HEAD
  console.log('Google shortner enabled')
=======
>>>>>>> 43b9252498de6b9257874a5eaf4f28e8177b7e79
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
<<<<<<< HEAD

}

// Loading Twitter and istancing it

if (typeof process.env.TWITTER_KEY !== 'undefined') {
  const Twitter = require('twitter')
  let twitter = new Twitter({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token_key: process.env.TWITTER_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_TOKEN_SECRET
=======
}

// Loading Twitter and istancing it
if (secret.twitterKey && secret.twitterSecret && secret.twitterToken) {
  Twitter = require('twitter')
  twitter = new Twitter({
    consumer_key: secret.twitterSecret,
    consumer_secret: secret.twitterSecret,
    bearer_token: secret.twitterToken
>>>>>>> 43b9252498de6b9257874a5eaf4f28e8177b7e79
  })
  var postTwitter = (item) => {
    status = 'A new post about ' + item.title + '. Read it here ' + item.link
    twitter.post('statuses/update', {
      status: status
    })
  }
}

// Function to post to twitter
<<<<<<< HEAD

=======
let postTwitter = (item) => {

}
>>>>>>> 43b9252498de6b9257874a5eaf4f28e8177b7e79

// Loading instagram and spawning an instance
if (secret.instagramId && secret.instagramSecret) {
   const instangram = require('instagram')
}

// Validation function
let validate = async (item) => {
  // Load the array of previously posted items
  let history = await storage.getItem('history')
  //Check time elapsed from pubblication
  let pubDate = new Date(item.pubDate)
  let now = new Date()
  let elapsed = now.getTime() - pubDate.getTime()

<<<<<<< HEAD
let postEverywhere = (item) => {
  console.log(item.title + ' ' + item.link)
  // Post on facebook
  // if (fb) { postFacebook(item) }
  // Post on Twitter
  if (typeof postTwitter) { postTwitter(item) }
}

// function to confirm that the post isn't too old and hasn't been publicized yet

let validate = async (item) => {
  // Load the array of previously posted items
  let history = await storage.getItem('history')
  //  Check time elapsed from pubblication
  let pubDate = new Date(item.pubDate)
  let now = new Date()
  let elapsed = now.getTime() - pubDate.getTime()
  // Returns True if the item is good
=======
>>>>>>> 43b9252498de6b9257874a5eaf4f28e8177b7e79
  return (history.indexOf(item.link) == -1 && elapsed < 1000*24*60*60)
}

// main function
let main = () => {
  parser.parseURL(config.feedUrl)
<<<<<<< HEAD
  .then( feed => {
    feed.items.forEach((item) => {
      validate(item).then( valid => { if (valid) {
        console.log(item.title + ' ' + item.link)
        if (typeof postTwitter !== 'undefined') { postTwitter(item) }
        postEverywhere(item)
        history = [item.link].concat(storage.getItemSync('history'))
        storage.setItemSync('history', history)
      }
    })})
  })
  .catch(error => console.log(error) )
=======
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
>>>>>>> 43b9252498de6b9257874a5eaf4f28e8177b7e79
}

// autorun on load
main()

// exposing a webhook to trigger main
