let config = require('./config.json');

// Loading dependencies

Parser = require('rss-parser');

// Creating istances

parser = new Parser;

// Loading db

// Routine to post to social networks

postEverywhere = function(item) {
  console.log(item.title + ' ' + item.link)
};

// main function

main = function() {
  parser.parseURL(config.feedUrl).then(function(feed) {
    feed.items.forEach(function(item) {
      postEverywhere(item)
    });
  });
};

// autorun on load

main()

// exposing a webhook to trigger main
