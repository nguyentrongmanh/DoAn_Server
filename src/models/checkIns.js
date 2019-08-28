const mongooes = require('mongoose');
const Schema = mongooes.Schema;

const checkInSchema = new Schema({
	timeIn: String,
	timeOut: String,
	userId: String,
});

module.exports = mongooes.model('CheckIn', checkInSchema);