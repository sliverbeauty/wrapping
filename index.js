const express = require('express'),
      bodyParser = require('body-parser'),
      cors = require('cors'),
      uuidv1 = require('uuid/v1')
      
let app = express(),
    cheerio = require('cheerio'),
    urlParser = require('url'),
    isUrl = require('is-url'),
    puppeteer = require('puppeteer'),
    port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const catchError = (callback) => {
  return async (req, res) => {
    try {
      await callback(req, res)
    } catch (e) {
      console.error(e)
      res.status(500).send({
        status: false,
        error: 'internal_server_error'
      })
    }
  }
}

  
const srapping = (req, res) => {
  const {url} = req.body
  const hostname = urlParser.parse(url).protocol + '//' + urlParser.parse(url).hostname;
  console.log('hostname', hostname);
  
    puppeteer
    .launch()
    .then(function(browser) {
      return browser.newPage();
    })
    .then(function(page) {
      return page.goto(url).then(function() {
        return page.content();
      });
    })
    .then(function(html) {
      let $ = cheerio.load(html);
      console.log('html', html);
      let images = $('body').find('img');
    
      if(images.length > 0) {
        let data = []
        for(let i=0; i<images.length; i++) {
          let imageLink = images[i].attribs.src;
                  
          if(!isUrl(imageLink)) {
            imageLink = hostname + imageLink;
          }
          
          const image = {
            '_id': uuidv1(),
            'src': imageLink
          };
          data.push(image)
        }
        res.json({
          data
        })
      }
    })
    .catch(function(err) {
      console.log('err', err)
      //handle error
    });
  }
app.post('/', catchError(srapping));
app.get('/',  (req, res) => { res.send('OK'); });
const server = app.listen(port, (err) => {
  if(!err) {
    const port = server.address().port;
    console.log('App Listening on ', port);
  }
});
  