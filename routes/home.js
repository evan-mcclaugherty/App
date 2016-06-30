var express = require('express');
var router = express.Router();
var db = require('../db/api');
var localAuth = require('../auth/localAuth');
// On home: authenticate,
router.get('/', localAuth.isLoggedIn, function(req, res) {
    db.Neighborhood.getNeighborhoods()
        .then(neighborhoods => {
            splitHoods = neighborhoods.reduce((result,item, i) => {
              var index = Math.floor(i/4)
              result[index] = result[index] || []
              result[index].push(item)
              return result
          }, [])
            res.render('home', {
                email: req.session.email,
                id: req.session.userID,
                neighborhood: splitHoods
            });
        });
});

// login
router.post('/login', function(req, res, next) {
    localAuth.passport.authenticate('local', (err, user, info) => {
        if (err) {
            res.render('home', {
                error: err
            });
        } else if (user) {
            req.session.userID = user.id;
            req.session.email = user.email;
            res.redirect('/home');
        }
    })(req, res, next);
})

router.get('/logout', (req, res, next) => {
    req.session = null;
    res.redirect('/home');
})
router.post('/signup', localAuth.isLoggedIn, function(req, res, next) {
    db.Contributor.findContributorByEmail(req.body.email).then(user => {
        if (user) {
            res.render('home', {
                error: 'User already exists'
            });
        } else {
            localAuth.addContributor(req.body).then(user => {
                req.session.userID = user.id;
                res.redirect('/home');
            });
        }
    });
})


router.post('/addhh', function(req, res, next) {
  console.log("anything? ", req.body.neighborhood_name, req.body.name);
  db.location.addLocation(req.body, req.session.userID).then(function (id) {
    console.log(id);
    db.HappyHour.addHappyHour(req.body).then(function (addhh) {
      res.render('/home')
    })
  })
});

module.exports = router;
