const mongooes = require('mongoose');
const schema = require("./schema/schema");
const { ApolloServer } = require('apollo-server');
mongooes.connect("mongodb+srv://admin123:admin123@cluster0-hmgvh.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true });
mongooes.connection.once('open', () => {
	console.log('DB CONNECTD');
});

const server = new ApolloServer({
	schema,
	cors: {
		origin: '*',            // <- allow request from all domains
		credentials: true
	}
});

server.listen({ port: 5000 }).then(({ url }) => {
	console.log(`🚀 Server ready at ${url}`)
});