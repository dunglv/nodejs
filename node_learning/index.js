var express = require('express');
var app = express();
var controller = require('./controllers/MainController');
var session = require('express-session');
var sess;
// Call view engine jade(pug)
app.set('view engine', 'pug');
app.set('views', './views');
app.use(session({secret: '1234577'}));
// Call mongodb conect database 
var db;
const  MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb://127.0.0.1:27017/dung', function(err, database){
	if (err)  {
		console.log(err);
	}else{
		db = database;
		console.log(db.exists);
		app.listen(3000, function(){
			console.log('Server is running at 3000...');
		});
	}
});

// Call body-parser
// Compile post request
var body = require('body-parser');
// app.use(body.json());
app.use(body.urlencoded({extended: true}));
/*------------------------------------------------------------
 | CONFIG
 | -----------------------------------------------------------
 */
app.get('*', function(req, res, next){
	if (req.session && req.session.user) {
		app.locals.user_id = req.session.user;
	}else{
		app.locals.user_id = null;
	}
	next();
});
/*------------------------------------------------------------
 | FUNCTIONS
 | -----------------------------------------------------------
 */
// Check login
var check_not_login = function(req, res, next){
	if (req.session && req.session.user != null) {
		next();
	}else{
		res.redirect('/login');
	}
}
var check_logged_in = function(req, res, next){
	if (req.session && req.session.user != null) {
		res.redirect('/');
	}else{
		next();
	}
}
/*------------------------------------------------------------
 | PAGE
 | -----------------------------------------------------------
 */
app.get('/', function(req, res){
	sess = req.session;
	var users = db.collection('users').find();
	users.sort({'username': 1}).toArray(function(err, results){
		res.render('./partials/home', {users: results});
	});
	console.log(sess.user);
});

 app.get('/about', function(req, res){
	res.render('./partials/about');
	sess = req.session;
	console.log(sess.user);
});
 app.get('/help', function(req, res){
	res.render('./partials/help');
	sess = req.session;
	console.log(sess.user);
});
/*------------------------------------------------------------
 | USER
 | -----------------------------------------------------------
 */
app.get('/register', check_logged_in,  function(req, res){
	res.render('./partials/register');
	sess = req.session;
	console.log(sess.user);
});
app.post('/register', function(req, res){
	db.collection('users').save(req.body, function(err, result){
		if (err) {
			return console.log(err);
		}
		console.log('Save database');
		res.redirect('/');
	});
});
app.get('/login', check_logged_in, function(req, res){
	res.render('./partials/login');
});

app.post('/login', function(req, res, next){
	var username_get = req.body.username;
	var password_get = req.body.password;
	var user = db.collection('users').find({username: ""+username_get+"", password: ""+password_get+""});
	user.toArray(function(err, results){
		if (results.length > 0) {
			req.session.user =  results[0]._id;
			console.log(results[0].username+'['+results[0]._id+'] logged in system');
			res.redirect('/');
		} else {
			res.redirect('/login');
		}
	});
	
});
app.get('/logout', check_not_login, function(req, res, next){
	if (req.session && req.session.user) {
		console.log(req.session.user+' logged out of system');
		req.session.user = null;
		// req.session.destroy(function(err){
		// 	if(err) throw err;
		// 	res.redirect('/');
		// });
			res.redirect('/');

	}else{
		res.redirect('/');
		console.log('Session was expired');
	}
});
/*------------------------------------------------------------
 | ARTICLE
 | -----------------------------------------------------------
 */
 // app.use(check_login);
 app.get('/articles', function(req, res){
	db.collection('articles').find().toArray(function(err, results){
		if (results.length > 0) {
			res.render('partials/articles', {articles: results});
		} else {
			res.redirect('partials/add-new-article');
		}
	});
 });
 app.get('/add-new-article', check_not_login, function(req, res){
 	db.collection('categories').find().toArray(function(err, results){
 		if (results.length > 0) {
			res.render('partials/add-new-article', {categories: results});
 		} else {
 			res.redirect('/add-new-category');
 		}
 	});
 });
  app.post('/add-new-article', check_not_login, function(req, res){
 	db.collection('articles').save(req.body, function(err){
 		if (err) throw err;
 		res.redirect('/articles');
 	});
 });
 /*------------------------------------------------------------
 | CATEGORIES
 | -----------------------------------------------------------
 */
app.get('/categories', function(req, res){
	var categories = db.collection('categories').find().sort({id:1}).toArray(function(err, results){
		if (results.length > 0) {
			res.render('partials/categories', {categories: results});
		} else {
			res.redirect('/');
		}
	});
});
app.get('/add-new-category', check_not_login,  function(req, res){
	res.render('partials/add-new-category.pug');
});
app.post('/add-new-category', function(req, res, next){
	var title_get = req.body.title;
	var description_get = req.body.description;
	db.collection('categories').insert({title: title_get, description: description_get}, function(err){
		if (err) throw err;
		console.log('Save database');
		res.redirect('/categories');
	});
});