const mongooes = require('mongoose');
const Schema = mongooes.Schema;

const checkInSchema = new Schema({
	timeIn: String,
	timeOut: String,
	status: String,
	userId: String,
	checkInType: String,
	checkOutType: String,
});

module.exports = mongooes.model('CheckIn', checkInSchema);