const mongooes = require('mongoose');
const Schema = mongooes.Schema;

const userSchema = new Schema({
	name: String,
	age: Number,
	role: String,
	address: String,
	tel: String,
	status: String,
	parentId: String,
});

module.exports = mongooes.model('User', userSchema);