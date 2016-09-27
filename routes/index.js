var router = require('express').Router();
// var usersDB = require('../models/users.json');
var fs = require('fs');
// var contentDB = require('../models/content.js');
var db = require('../models/db.js');

// console.log(usersDB.users);


/* GET home page. */
router.get('/',checkIsLogin);
router.get('/', function(req, res, next) {
	console.log(req.session,'/');
	res.render('index', {
		title: '首页',
		name : null
	});
});

router.get('/reg',function(req,res){
	res.render('reg',{
		title: '用户注册',
		name : null
	})
});

router.get('/login',checkIsLogin);
router.get('/login', function(req, res, next){
	res.render('login',{
		title: "登入", 
		name : null
	});
});

router.get('/logout',function(req, res, next){
	req.session.inf = null;
	res.redirect('/');
});

router.post('/reg',function(req,res){
	var user = req.body;
	var userObj = {
			name: user.username,
			password: user.password,
			country: user.country,
			email: user.email
		};
	
	db.getUsers(userObj.name, function(err,account){
		if(!err){
			if(account){
			res.send('用户名已存在');
			} else{
				db.saveUsers(userObj, function(err,doc){
				if(err) {
					res.send(err);
				} else {
					//写入个人用户呈现首页处理
					req.session.inf = doc.name;
					res.redirect('/u/'+doc.name);
			}})}
		} else { 
			console.error(err);
		}
	})
});

router.post('/login',function(req, res, next) {
	var username = req.body.username;
	//account为得到数据库中单个用户的所用信息
	db.getUsers(username,function(err, doc){
		if(doc){
			if(req.body.password === doc.password){
				req.session.inf = doc.name;
				res.redirect('/u/'+doc.name);
			}else{
				res.send('请输入正确帐号或密码');
			}
		}else{
			res.send('请输入正确的帐号或密码');
		}
	});
	
})

function renderUser(req, res, username , callback){
	
	db.getUsers(username, function(err, doc) {
		if(err){
			console.error(err);
			callback(err)
		} else {
			// console.log(doc,'123');
			var userInf = doc;
			var country = doc.country;
			var Content = {
				name: doc.name,
				title: "首页",
				posts: doc.words? doc.words: []
			};			
			// console.log(Content);
			res.render('index',Content);
			// console.log('ok');
			
		}
	})
}


router.post("/u/:user",function(req, res, next){
	//查找用戶名 req.params.user
	var username = req.params.user;
	var word = req.body.post;
	// console.log(username,'and',word);
	db.saveWord(username, word, function(err,doc){
		if(err){
			console.error(err);
		} else {
			req.session.inf = doc.name;
			res.redirect('/u/'+ username);
		}
	})
})
router.get("/u/:user",checkIsLogout);
router.get("/u/:user",function(req, res, next) {
	var username = req.params.user;
	renderUser(req, res, username,function(err){
		if(err){
			console.error(err)
		}
	})
})


module.exports = router;

function checkIsLogin(req, res,next){
	console.log(req.session,'login');
	if(req.session.inf){
		res.redirect('/u/'+req.session.inf);
	}else{
		next();
	}
}

function checkIsLogout(req, res, next){
	console.log(req.session,'logout');
	if(!req.session.inf) {
		res.render('login',{
			title: "登入", 
			name : null
		});
	} else {
		next();
	}
}