const mongooes = require('mongoose');
const schema = require("./schema/schema");
const express = require("express");
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
	},
	playground: true
});

const app = express();

app.get("*", (req, res) => {
	res.send("1234");
});

var port = process.env.PORT || 5000;

server.applyMiddleware({ app });

server.listen({ port: port }).then(({ url }) => {
	console.log(`🚀 Server ready at ${url}`)
	console.log(port);
	console.log(url);
});