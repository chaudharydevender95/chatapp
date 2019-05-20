const uuid4 = require('uuid/v4')


const createUser = ({name="",socketId=null} = {})=>({
    id:uuid4(),
    name,
    socketId
})

const createMessage = ({message="",sender=""}={})=>({
    id:uuid4(),
    time:getTime(new Date(Date.now())),
    message,
    sender
})

const createChat = ({messages=[],name="Community",users=[],isCommunity=false}={})=>({
    id:uuid4(),
    name:isCommunity?"Community":createChatNameFromUsers(users),
    messages,
    users,
    typingUsers:[],
    isCommunity
})

const createChatNameFromUsers = (users,excludedUser="")=>{
    return users.filter(u=>u.name !== excludedUser).join(" & ")|| 'Empty Users' 
}

const getTime = (date)=>{
    return `${date.getHours()}:${("0"+date.getMinutes()).slice(-2)}`
}

module.exports = {
    createUser,
    createMessage,
    createChat,
    createChatNameFromUsers
}