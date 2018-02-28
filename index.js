config = require('./config.json')

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

// Routine to post to social networks

postEverywhere = function(item) {
  console.log(item.title + ' ' + item.link)
}

// function to confirm that the post isn't too old and hasn't been publicized yet

validate = function(item) {
  return (storage.getItemSync('history').indexOf(item.link) == -1)
}

// main function

main = function() {
  parser.parseURL(config.feedUrl).then(function(feed) {
    feed.items.forEach(function(item) {
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
