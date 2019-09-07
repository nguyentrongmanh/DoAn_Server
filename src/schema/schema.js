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
		fingerPrintIn: {
			type: UserType,
			resolve: async (payload) => {
				console.log(payload);
				pubsub.publish("test", { test: "ok" });
				const fingerprint = parseInt(payload);
				let user = await User.findOne({
					fingerprint: fingerprint
				});
				let timeNow = moment().format("YYYY-MM-DD h:mm:ss");
				if (user.status === 'in') {
					let checkIn = await CheckIn.findOne({
						userId: user.id,
						status: "in"
					});
					await checkIn.updateOne({
						timeOut: timeNow,
						status: "out",
						checkOutType: "fingerPrint"
					});
					await user.updateOne({
						status: "out",
						timeIn: "",
					});
				} else {
					let checkIn = new CheckIn({
						timeIn: timeNow,
						userId: user.id,
						status: "in",
						checkInType: "fingerPrint"
					});
					await checkIn.save();
					await user.updateOne({
						status: "in",
						timeIn: timeNow,
						checkInType: "fingerPrint"
					});
				}

				return User.findById(user.id);
			},
			subscribe: async (parent, args) => {
				console.log(args);
				return pubsub.asyncIterator("fingerPrintIn");
			}
		},
		addFinPriSta: {
			type: GraphQLBoolean,
			resolve: (payload) => {
				console.log(parseInt(payload));
				if (parseInt(payload) == 1) {
					console.log(payload);
					return true;
				} else {
					return false;
				}
			},
			subscribe: async (parent, args) => {
				console.log(args);
				return pubsub.asyncIterator("addFinPriSta");
			}
		},
		rfidIn: {
			type: UserType,
			resolve: async (payload) => {
				console.log(payload);
				let user = await User.findOne({
					rfid: payload
				});
				if (!user) {
					pubsub.publish("rfidStatus", 0);
					return false;
				}
				let timeNow = moment().format("YYYY-MM-DD h:mm:ss");
				if (user.status === 'in') {
					let checkIn = await CheckIn.findOne({
						userId: user.id,
						status: "in",
					});
					await checkIn.updateOne({
						timeOut: timeNow,
						status: "out",
						checkOutType: "card"
					});
					await user.updateOne({
						status: "out",
						timeIn: ""
					});

				} else {
					let checkIn = new CheckIn({
						timeIn: timeNow,
						userId: user.id,
						status: "in",
						checkInType: "card"
					});
					await checkIn.save();
					await user.updateOne({
						status: "in",
						timeIn: timeNow,
						checkInType: "card"
					});
				}
				pubsub.publish("rfidStatus", 1);
				return User.findById(user.id);
			},
			subscribe: async (parent, args) => {
				console.log(args);
				return pubsub.asyncIterator("rfidIn");
			}
		},
	}
});


const RootQuery = new GraphQLObjectType({
	name: "RootQueryType",
	fields: {
		user: {
			type: UserType,
			args: { id: { type: GraphQLID } },
			resolve(parent, args) {
				if (args.id == "") {
					return {};
				}
				const user = User.findById(args.id);
				if (user) {
					return user;
				}
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
		timeIn: { type: GraphQLString },
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
				let insertData = {
					name: data.name,
					age: data.age,
					address: data.address,
					tel: data.tel,
					status: data.status,
					role: data.role,
					fingerprint: data.fingerprint,
					rfid: data.rfid,
					timeIn: data.timeIn
				};

				if (data.parentId && data.parentId != "") {
					insertData.parentId = data.parentId;
				}
				let user = new User(insertData);
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
					status: status
				});
				return checkIn.save();
			}
		},
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
		},
		deleteALl: {
			type: GraphQLBoolean,
			resolve: async (parent, args) => {
				await CheckIn.deleteMany({});
				await User.deleteMany({});
				return true;
			}
		},
		addFingerPrint: {
			type: GraphQLBoolean,
			args: {
				fingerPrintId: { type: new GraphQLNonNull(GraphQLInt) }
			},
			resolve: async (parent, args) => {
				pubsub.publish('addFinger', args.fingerPrintId);
				return true;
			}
		},
		openDoor: {
			type: GraphQLBoolean,
			resolve: async (parent, args) => {
				pubsub.publish('openDoor', 1);
				return true;
			}
		},
		closeDoor: {
			type: GraphQLBoolean,
			resolve: async (parent, args) => {
				pubsub.publish('closeDoor', 1);
				return true;
			}
		},
	})

})

module.exports = new GraphQLSchema({
	query: RootQuery,
	mutation: Mutation,
	subscription: Subscription
});