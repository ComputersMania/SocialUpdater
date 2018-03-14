const {promisify} = require('util')
const {google} = require('googleapis')

const urlshortener = google.urlshortener('v1')

const shortenerpromise = promisify(urlshortener.url.insert)

var shorten = (link) => {
	return shortenerpromise({
		key: "AIzaSyDJ72_4Iap61uMrdmkOzo-gHW0lNsrpAtM",
		resource: {
			longUrl: link
		}
	})
}

shorten('webcodingmayhem.tk').then( (res) => { console.log(res.data.id) } )
