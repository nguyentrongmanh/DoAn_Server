const graphql = require("graphql");
const _ = require("lodash");
const User = require("../models/users");
const CheckIn = require("../models/checkIns");
const { EventPosition } = require("@azure/event-hubs");
const deviceId = "esp8266";
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


// const getData = new Promise((ehClient, pubsub) => {
// 	ehClient
// 		.getPartitionIds()
// 		.then(function (ids) {
// 			console.log("ids", ids);
// 			return ids.map(function (id) {
// 				return ehClient.receive(
// 					id,
// 					message => {
// 						pubsub.publish("data", {
// 							data: {
// 								id: "cjvwgziw8002g0744bejlfwtv",
// 								name: "Coc",
// 								level: message.body
// 							}
// 						});
// 						console.log("message", message.body);
// 					},
// 					printError,
// 					{ eventPosition: EventPosition.fromEnqueuedTime(Date.now()) }
// 				);
// 			});
// 		})
// 		.catch(printError);
// });

// const Subscription = new GraphQLObjectType({
// 	name: "Subscription",
// 	fields: {
// 		data: {
// 			type: GraphQLString,
// 			subscribe: async (parent, args, { ehClient, pubsub }, info) => {
// 				getData(ehClient, pubsub);
// 				return pubsub.asyncIterator("data");
// 			}
// 		},
// 	}
// });

const CheckInType = new GraphQLObjectType({
	name: "CheckIn",
	fields: () => ({
		id: { type: GraphQLID },
		timeIn: { type: GraphQLString },
		timeOut: { type: GraphQLString },
		status: { type: GraphQLString },
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
		rfid: { type: GraphQLString },
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

const RootQuery = new GraphQLObjectType({
	name: "RootQueryType",
	fields: {
		user: {
			type: UserType,
			args: { id: { type: GraphQLID } },
			resolve(parent, args) {
				const user = User.findById(args.id);
				if (user) {
					return user;
				}
				return {};
			}
		},
		checkIn: {
			type: CheckInType,
			args: { id: { type: GraphQLID } },
			resolve(parent, args) {
				return CheckIn.findById(args.id);
			}
		},
		checkIns: {
			type: new GraphQLList(CheckInType),
			resolve(parent, args) {
				return CheckIn.find({});
			}
		},
		users: {
			type: new GraphQLList(UserType),
			resolve(parent, args) {
				return User.find({});
			}
		}
	}
});

const UserInputType = new GraphQLInputObjectType({
	name: "UserInput",
	fields: () => ({
		name: { type: GraphQLString },
		age: { type: GraphQLInt },
		address: { type: GraphQLString },
		tel: { type: GraphQLString },
		status: { type: GraphQLString },
		role: { type: GraphQLString },
		parentId: { type: GraphQLString },
		fingerprint: { type: GraphQLString },
		rfid: { type: GraphQLString },
	})
});

const CheckInInputType = new GraphQLInputObjectType({
	name: "CheckInInput",
	fields: () => ({
		timeIn: { type: GraphQLString },
		timeOut: { type: GraphQLString },
		userId: { type: GraphQLID }
	})
});

const Mutation = new GraphQLObjectType({
	name: "Mutation",
	fields: () => ({
		addUser: {
			type: UserType,
			args: {
				data: { type: UserInputType }
			},
			resolve(parent, args) {
				const data = args.data;
				let user = new User({
					name: data.name,
					age: data.age,
					parentId: data.parentId,
					address: data.address,
					tel: data.tel,
					status: data.status,
					role: data.role,
					fingerprint: data.fingerprint,
					rfid: data.rfid,
				});
				return user.save();
			}
		},
		editUser: {
			type: UserType,
			args: {
				data: { type: UserInputType },
				id: { type: new GraphQLNonNull(GraphQLID) }
			},
			resolve: async (parent, args) => {
				const data = args.data;
				let user = User.findById(args.id);
				await user.updateOne(data);
				return User.findById(args.id);
			}
		},
		deleteUser: {
			type: UserType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) }
			},
			resolve: async (parent, args) => {
				let user = User.findById(args.id);
				const result = await User.deleteOne(user);
				return {
					id: args.id
				};
			}
		},
		addCheckIn: {
			type: CheckInType,
			args: {
				data: { type: CheckInInputType }
			},
			resolve(parent, args) {
				const data = args.data
				let checkIn = new CheckIn({
					timeIn: data.timeIn,
					timeOut: data.timeOut,
					userId: data.userId,
				});
				return checkIn.save();
			}
		},
		initRealTimeMug: {
			type: GraphQLBoolean,
			args: {
				data: { type: CheckInInputType }
			},

			resolve: async (parent, { }, { iothubClient }, info) => {
				let methodParams = {
					methodName: "start",
					payload: "xxx",
					responseTimeoutInSeconds: 30
				};
				console.log("methodParams", methodParams);
				try {
					const { result } = await iothubClient.invokeDeviceMethod(
						deviceId,
						methodParams
					);
					console.log(result);
					if (result.status == 200) return true;
				} catch (error) {
					console.log(error.responseBody);
					throw Error(error.responseBody);
				}
				return false;
			}
		}
	}),
	editCheckIn: {
		type: CheckInType,
		args: {
			data: { type: CheckInInputType },
			id: { type: new GraphQLNonNull(GraphQLID) }
		},
		resolve: async (parent, args) => {
			const data = args.data;
			let checkIn = CheckIn.findById(args.id);
			await checkIn.updateOne(data);
			return CheckIn.findById(args.id);
		}
	}
})

module.exports = new GraphQLSchema({
	query: RootQuery,
	mutation: Mutation,
	// subscription: Subscription
});