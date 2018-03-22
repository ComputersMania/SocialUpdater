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
  console.log('Google shortner enabled')
}

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

let postFacebook = async (item) => {
  if (config.GaCampaigns) {
    link = gaCampaign(item.link, 'config.facebookSource')
  }
  if (secret.googleApiKey) {
    link = await gapiUrl.shortenURL()
  }

}

// Loading Twitter and istancing it

if (typeof process.env.TWITTER_KEY !== 'undefined') {
  const Twitter = require('twitter')
  let twitter = new Twitter({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token_key: process.env.TWITTER_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_TOKEN_SECRET
  })
  var postTwitter = (item) => {
    status = 'A new post about ' + item.title + '. Read it here ' + item.link
    twitter.post('statuses/update', {
      status: status
    })
  }
}

// Function to post to twitter


// Loading instagram and spawning an instance

if (secret.instagramId && secret.instagramSecret) {
   const instangram = require('instagram')
}

// Routine to post to social networks

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
  return (history.indexOf(item.link) == -1 && elapsed < 1000*24*60*60)
}

// main function

let main = () => {
  parser.parseURL(config.feedUrl)
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
}

// autorun on load

main()

// exposing a webhook to trigger main
