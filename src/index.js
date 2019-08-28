const express = require("express");
const graphqlHTTP = require("express-graphql");
const mongooes = require('mongoose');
const cors = require("cors");
const schema = require("./schema/schema");
const resolvers = require("./schema/resolvers");
const typeDefs = require("./schema/typeDefs");
const { ApolloServer, PubSub } = require('apollo-server-express');
const iothub = require('azure-iothub');
var { EventHubClient } = require("@azure/event-hubs");
const deviceId = "esp8266";
const connectionString = 'HostName=doanhai.azure-devices.net;SharedAccessKeyName=service;SharedAccessKey=dpyT6ha+aNqsLX+p3VXH3cQ76PhlGLkjlHj/hYppq1k=';

const app = express();


mongooes.connect("mongodb+srv://admin123:admin123@cluster0-cy07m.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true });
mongooes.connection.once('open', () => {
	console.log('DB CONNECTD');
});

app.use(cors());

const server = new ApolloServer({
	resolvers,
	typeDefs,
	schema,
	context: async () => {
		const pubsub = new PubSub();
		const ehClient = EventHubClient.createFromIotHubConnectionString(connectionString);
		const iothubClient = iothub.Client.fromConnectionString(connectionString);
		// const registry = await iothub.Registry.fromConnectionString(connectionString);
		return {
			pubsub,
			ehClient,
			iothubClient,
		};
	}
});

server.applyMiddleware({ app });


app.listen(5000, () => {
	console.log("HOST RUNNING");
})