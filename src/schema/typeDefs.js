const { gql } = require('apollo-server');
module.exports = gql`

# input AlarmSetStateInput {
#    id:ID!
#     hours:Int!
#     minutes:Int!
#    state:Boolean!
# }

input Command {
    value: String!
}

type Response {
    value: String!
}

type Mutation {
    sendCommand(data:Command!): Response
    initRealTimeMug:Boolean
    # setStateAlarm(data:AlarmSetStateInput!):AlarmList
    # clearAlarmMug:[AlarmList!]
}

# type Subscription {
#     count:Int!
#     # data:Mug!
#     # temperatureMug: Int!
#     levelMug: Int!
# }
# `