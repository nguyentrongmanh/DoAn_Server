// import _ from "lodash";

// var { EventPosition } = require("@azure/event-hubs");

// const deviceId = "esp8266";

// const getDatePayload = () => {
// 	const dateObj = new Date();
// 	const hours = ("0" + dateObj.getHours()).slice(-2);
// 	const minutes = ("0" + dateObj.getMinutes()).slice(-2);
// 	const seconds = ("0" + dateObj.getSeconds()).slice(-2);
// 	const wDay = "0" + (dateObj.getDay() + 1);
// 	const day = ("0" + dateObj.getDate()).slice(-2);
// 	const month = ("0" + (new Date().getMonth() + 1)).slice(-2);
// 	const year = dateObj
// 		.getFullYear()
// 		.toString()
// 		.substr(2);

// 	return `${hours}${minutes}${seconds}${wDay}${day}${month}${year}`;
// };

// const getExactDataForm = (h, min, s, w, d, m, y) => {
// 	const hours = ("0" + h).slice(-2);
// 	const minutes = ("0" + min).slice(-2);
// 	const seconds = ("0" + s).slice(-2);
// 	const wDay = "0" + w;
// 	const day = ("0" + d).slice(-2);
// 	const month = ("0" + m).slice(-2);
// 	const year = y.toString().substr(2);

// 	return `${hours}${minutes}${seconds}${wDay}${day}${month}${year}`;
// };
// const getExactTimeForm = (h, min) => {
// 	const dateObj = new Date();
// 	const hours = ("0" + h).slice(-2);
// 	const minutes = ("0" + min).slice(-2);
// 	const seconds = ("0" + dateObj.getSeconds()).slice(-2);
// 	const wDay = "0" + (dateObj.getDay() + 1);
// 	const day = ("0" + dateObj.getDate()).slice(-2);
// 	const month = ("0" + (new Date().getMonth() + 1)).slice(-2);
// 	const year = dateObj
// 		.getFullYear()
// 		.toString()
// 		.substr(2);

// 	return `${hours}${minutes}${seconds}${wDay}${day}${month}${year}`;
// };

// var printError = function (err) {
// 	console.log(err.message);
// };

// const getData = (ehClient, pubsub) => {
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
// 								level: message.body.humidity,
// 								temperature: message.body.temperature
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
// };
// const getLevel = (ehClient, pubsub) => {
// 	ehClient
// 		.getPartitionIds()
// 		.then(function (ids) {
// 			console.log("ids Level", ids);
// 			return ehClient.receive(
// 				ids[0],
// 				message => {
// 					console.log("message", message.body);
// 					const level = message.body.level;
// 					if (level) {
// 						pubsub.publish("levelMug", { levelMug: Math.trunc(level) });
// 					}
// 				},
// 				printError,
// 				{ eventPosition: EventPosition.fromEnqueuedTime(Date.now()) }
// 			);
// 		})
// 		.catch(printError);
// };
// const getTemperature = (ehClient, pubsub) => {
// 	ehClient
// 		.getPartitionIds()
// 		.then(function (ids) {
// 			console.log("ids Temperature", ids);
// 			return ids.map(function (id) {
// 				return ehClient.receive(
// 					id,
// 					message => {
// 						console.log("message", message.body);
// 						if (message.body.temperature) {
// 							console.log(
// 								"typeof message.body.temperature",
// 								typeof message.body.temperature
// 							);
// 							const temperature = message.body.temperature;
// 							pubsub.publish("temperatureMug", {
// 								temperatureMug: Math.trunc(temperature)
// 							});
// 						}
// 					},
// 					printError,
// 					{ eventPosition: EventPosition.fromEnqueuedTime(Date.now()) }
// 				);
// 			});
// 		})
// 		.catch(printError);
// };

// export const resolvers = {
// 	Subscription: {
// 		temperatureMug: {
// 			subscribe: async (parent, args, { ehClient, pubsub }, info) => {
// 				getTemperature(ehClient, pubsub);

// 				return pubsub.asyncIterator("temperatureMug");
// 			}
// 		},
// 		levelMug: {
// 			subscribe: async (parent, args, { ehClient, pubsub }, info) => {
// 				getLevel(ehClient, pubsub);

// 				return pubsub.asyncIterator("levelMug");
// 			}
// 		},
// 		data: {
// 			subscribe: async (parent, args, { ehClient, pubsub }, info) => {
// 				getData(ehClient, pubsub);

// 				return pubsub.asyncIterator("data");
// 			}
// 		},
// 		count: {
// 			subscribe: (parent, args, { pubsub }, info) => {
// 				var count = 0;
// 				setInterval(() => {
// 					count++;
// 					pubsub.publish("count", {
// 						count
// 					});
// 				}, 1000);
// 				return pubsub.asyncIterator("count");
// 			}
// 		}
// 	},
// 	Query: {
// 		mugs: (parent, args, { prisma }, info) => {
// 			return prisma.mugs(null, info);
// 		},
// 		alarmLists: (parent, args, { prisma }, info) => {
// 			return prisma.alarmLists(null, info);
// 		}
// 	},
// 	Mutation: {
// 		createMug: async (parent, { data }, { prisma, registry }, info) => {
// 			const result = await prisma.createMug(
// 				{
// 					...data
// 				},
// 				info
// 			);

// 			if (result.id != null) {
// 				registry.create(
// 					{
// 						deviceId: result.id
// 					},
// 					function (err, deviceInfo, res) {
// 						if (err) console.log(" error: " + err.toString());
// 						if (res)
// 							console.log(
// 								" status: " + res.statusCode + " " + res.statusMessage
// 							);
// 						if (deviceInfo)
// 							console.log(" device info: " + JSON.stringify(deviceInfo));
// 					}
// 				);
// 			}

// 			return result;
// 		},
// 		deleteMug: async (parent, { where }, { prisma, registry }, info) => {
// 			try {
// 				const task = await registry.delete(where.id);
// 			} catch (error) {
// 				throw new Error("Thiết bị không có trên Azure IOT Hub");
// 			}

// 			const result = await prisma.deleteMug(
// 				{
// 					...where
// 				},
// 				info
// 			);

// 			return result;
// 		},
// 		setStateAlarm: async (
// 			parent,
// 			{ data: { id, hours, minutes, state } },
// 			{ prisma, iothubClient },
// 			info
// 		) => {
// 			const addAlarm = {
// 				methodName: "addAlarm",
// 				payload: getExactTimeForm(hours, minutes),
// 				responseTimeoutInSeconds: 30
// 			};
// 			const deleteAlarm = {
// 				methodName: "deleteAlarm",
// 				payload: getExactTimeForm(hours, minutes),
// 				responseTimeoutInSeconds: 30
// 			};
// 			try {
// 				const { result } = await iothubClient.invokeDeviceMethod(
// 					deviceId,
// 					state ? addAlarm : deleteAlarm
// 				);
// 				console.log('result', result)
// 				if (result.status == 200) {
// 					console.log('id', id)
// 					return await prisma.updateAlarmList({
// 						data: {
// 							hours,
// 							minutes,
// 							state
// 						},
// 						where: { id }
// 					});
// 				}
// 			} catch (error) {
// 				throw Error(error);
// 			}
// 		},

// 		createAlarmList: async (
// 			parent,
// 			{ data: { hours, minutes } },
// 			{ iothubClient, prisma },
// 			info
// 		) => {
// 			let methodParams = {
// 				methodName: "addAlarm",
// 				payload: getExactTimeForm(hours, minutes),
// 				responseTimeoutInSeconds: 30
// 			};
// 			console.log("methodParams", methodParams);
// 			const alarmExist = await prisma.$exists.alarmList({ hours, minutes });
// 			if (!alarmExist) {
// 				try {
// 					const { result } = await iothubClient.invokeDeviceMethod(
// 						deviceId,
// 						methodParams
// 					);
// 					if (result.status == 200) {
// 						return prisma.createAlarmList({
// 							hours,
// 							minutes,
// 							state: true
// 						});
// 					}
// 				} catch (error) {
// 					throw Error(error.responseBody);
// 				}
// 			}

// 			return false;
// 		},
// 		clearAlarmMug: async (parent, args, { iothubClient }, info) => {
// 			let methodParams = {
// 				methodName: "clearAlarm",
// 				payload: "",
// 				responseTimeoutInSeconds: 15
// 			};
// 			try {
// 				const { result } = await iothubClient.invokeDeviceMethod(
// 					deviceId,
// 					methodParams
// 				);
// 				if (result.status == 200) return true;
// 			} catch (error) {
// 				throw Error(error.responseBody);
// 			}
// 			return false;
// 		},
// 		deleteAlarmList: async (
// 			parent,
// 			{ where },
// 			{ iothubClient, prisma },
// 			info
// 		) => {
// 			const { id, hours, minutes } = await prisma.alarmList({ ...where });

// 			let methodParams = {
// 				methodName: "deleteAlarm",
// 				payload: getExactTimeForm(hours, minutes),
// 				responseTimeoutInSeconds: 30
// 			};
// 			console.log("methodParams", methodParams);

// 			try {
// 				const { result } = await iothubClient.invokeDeviceMethod(
// 					deviceId,
// 					methodParams
// 				);
// 				if (result.status == 200) {
// 					try {
// 						const result = await prisma.deleteAlarmList({ id });
// 						console.log("result", result);
// 						return result;
// 					} catch (error) {
// 						throw Error(error);
// 					}
// 				}
// 			} catch (error) {
// 				throw Error(error.responseBody);
// 			}
// 			return false;
// 		},
// 		initRealTimeMug: async (parent, { }, { iothubClient }, info) => {
// 			let methodParams = {
// 				methodName: "initRealTime",
// 				payload: getDatePayload(),
// 				responseTimeoutInSeconds: 30
// 			};
// 			console.log("methodParams", methodParams);
// 			try {
// 				const { result } = await iothubClient.invokeDeviceMethod(
// 					deviceId,
// 					methodParams
// 				);
// 				if (result.status == 200) return true;
// 			} catch (error) {
// 				throw Error(error.responseBody);
// 			}
// 			return false;
// 		}
// 	}
// };
