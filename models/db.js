var mongoose = require('mongoose');
var moment = require('moment');

mongoose.connect('mongodb://localhost:27017/test');

var db = mongoose.connection;

db.on('error',function(err){
	console.error(err);
});

db.on('open',function(){
	console.log('on server');
})


//schema
var PersonInfSchema = new mongoose.Schema({
	name: { type: String },
	password: { type: String },
	country: { type: String },
	email: String,
	words : [
		{word: {type: String},time:{type: String, default: moment().format('L')}},
	]
	 
})

//数据骨架
var PersonInf = mongoose.model('person', PersonInfSchema);

//存储用户信息
function saveUsers (userObj, callback){
	PersonInf.create(userObj, function(err, doc){
		if(err){
			console.error(err);
			callback(err);
		} else {
			callback(null,doc);
}})}
module.exports.saveUsers = saveUsers;


//取得用户信息，并回调
function getUsers (username, callback){
	PersonInf.findOne({"name": username},{_id:0},function(err, doc){
		if(err) {
			console.error(err);
			callback(err);
		} else{
			// console.log(doc);
			callback(null,doc);
}})}
module.exports.getUsers = getUsers;


function saveWord(username, word, callback){
	PersonInf.findOne({"name": username},function(err, doc){
		if(err) {
			console.error(err);
			callback(err);
		} else{
			var newWord = {word: word}
			if(!doc.words){
				doc.words = [];
				doc.words.push(newWord);
			} else {
				doc.words.push(newWord);
			}
			// console.log(doc);

			doc.save(function(err, doc){
				if(err){
					callback(err);
				} else {
					console.log(doc);
					callback(null, doc);
				}
			})
}})}
module.exports.saveWord = saveWord;