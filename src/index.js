const express = require("express");
const http = require("http");
const graphqlHTTP = require("express-graphql");
const mongooes = require('mongoose');
const cors = require("cors");
const schema = require("./schema/schema");
const resolvers = require("./schema/resolvers");
const typeDefs = require("./schema/typeDefs");
const { ApolloServer, PubSub } = require('apollo-server');
const iothub = require('azure-iothub');
var { EventHubClient } = require("@azure/event-hubs");
const deviceId = "esp8266";
const connectionString = 'HostName=doanhai.azure-devices.net;SharedAccessKeyName=service;SharedAccessKey=dpyT6ha+aNqsLX+p3VXH3cQ76PhlGLkjlHj/hYppq1k=';
mongooes.connect("mongodb+srv://admin123:admin123@cluster0-cy07m.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true });
mongooes.connection.once('open', () => {
	console.log('DB CONNECTD');
});

const server = new ApolloServer({
	schema,
	cors: {
		origin: '*',            // <- allow request from all domains
		credentials: true
	},
	context: () => {
		console.log("called")
	}
	// context: async () => {
	// 	// const pubsubApollo = new PubSub();
	// 	// const ehClient = EventHubClient.createFromIotHubConnectionString(connectionString);
	// 	// const iothubClient = iothub.Client.fromConnectionString(connectionString);
	// 	// const registry = await iothub.Registry.fromConnectionString(connectionString);
	// 	return {
	// 		// pubsubApollo,
	// 		// pubsubMQTT
	// 		// ehClient,
	// 		// iothubClient,
	// 	};
	// }
});

// server.applyMiddleware({ app });

// const httpServer = http.createServer(app);

// server.installSubscriptionHandlers(app);

// app.listen({ port: 5000 }, () => {
// 	console.log(`server ready at http://localhost:5000${server.graphqlPath}`);
// 	console.log(`Subscriptions ready at ws://localhost:5000/${server.subscriptionsPath}`);
// });

server.listen().then(({ url }) => {
	console.log(`🚀 Server ready at ${url}`)
});


// app.listen(5000, () => {
// 	console.log("HOST RUNNING");
// })