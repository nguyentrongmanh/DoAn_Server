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
	fingerprint: String,
	timeIn: String,
	checkInType: String,
	rfid: String,
});

module.exports = mongooes.model('User', userSchema);