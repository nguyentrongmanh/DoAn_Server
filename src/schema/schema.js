const graphql = require("graphql");
const _ = require("lodash");
const moment = require("moment");
const User = require("../models/users");
const CheckIn = require("../models/checkIns");
const { GraphQLObjectType,
	GraphQLString,
	GraphQLSchema,
	GraphQLID,
	GraphQLList,
	GraphQLInt,
	GraphQLInputObjectType,
	GraphQLNonNull,
	GraphQLBoolean
} = graphql;

const { connect } = require("mqtt");
const { MQTTPubSub } = require('graphql-mqtt-subscriptions');
const client = connect('mqtt://soldier.cloudmqtt.com', {
	reconnectPeriod: 1000,
	username: "gpjtxrol",
	password: "OadOIPKJM_YD",
	port: "14954"
});

const pubsub = new MQTTPubSub({
	client
});

const FingerIdType = new GraphQLObjectType({
	name: "fingerIn",
	fields: {
		fingerId: { type: GraphQLString },
	}
});

const CheckInType = new GraphQLObjectType({
	name: "CheckIn",
	fields: () => ({
		id: { type: GraphQLID },
		timeIn: { type: GraphQLString },
		timeOut: { type: GraphQLString },
		status: { type: GraphQLString },
		checkInType: { type: GraphQLString },
		checkOutType: { type: GraphQLString },
		user: {
			type: UserType,
			resolve(parent, args) {
				return User.findById(parent.userId);
			}
		}
	})
});

const ChildType = new GraphQLObjectType({
	name: "Child",
	fields: {
		name: { type: GraphQLString },
		age: { type: GraphQLInt },
		status: { type: GraphQLString },
	}
});

const ParentType = new GraphQLObjectType({
	name: "Parent",
	fields: {
		name: { type: GraphQLString },
		age: { type: GraphQLInt },
		status: { type: GraphQLString },
	}
});

const UserType = new GraphQLObjectType({
	name: "User",
	fields: {
		id: { type: GraphQLID },
		name: { type: GraphQLString },
		age: { type: GraphQLInt },
		role: { type: GraphQLString },
		address: { type: GraphQLString },
		tel: { type: GraphQLString },
		status: { type: GraphQLString },
		fingerprint: { type: GraphQLString },
		timeIn: { type: GraphQLString },
		rfid: { type: GraphQLString },
		checkInType: { type: GraphQLString },
		checkOutType: { type: GraphQLString },
		checkIns: {
			type: new GraphQLList(CheckInType),
			resolve(parent, args) {
				return CheckIn.find({ userId: parent.id });
			}
		},
		parent: {
			type: ParentType,
			resolve(parent, args) {
				return User.findById(parent.parentId);
			}
		},
		childrens: {
			type: new GraphQLList(ChildType),
			resolve(parent, args) {
				return User.find({ parentId: parent.id, role: 'child' });
			}
		}
	}
});


const Subscription = new GraphQLObjectType({
	name: "Subscription",
	fields: {
		realTimeChart: {
			type: GraphQLInt,
			resolve: (payload) => {
				console.log(payload);
				return payload;
			},
			subscribe: async (parent, args) => {
				return pubsub.asyncIterator("realTimeChart");
			}
		},
	}
});


const RootQuery = new GraphQLObjectType({
	name: "RootQueryType",
	fields: {
		users: {
			type: new GraphQLList(UserType),
			resolve(parent, args) {
				return User.find({});
			}
		}
	}
});

module.exports = new GraphQLSchema({
	query: RootQuery,
	subscription: Subscription
});