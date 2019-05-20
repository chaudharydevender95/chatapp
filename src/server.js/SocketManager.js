const io = require('./index').io;
var AYLIENTextAPI = require('aylien_textapi');
var textapi = new AYLIENTextAPI({
  application_id: "ab615b3f",
  application_key: "546806c6727996f77bacf817cc9b4ae2"
});

let connectedUsers = { }
const {PRIVTE_MESSAGE,VERIFY_USER,MESSAGE_SENT,TYPING,MESSAGE_RECIEVED,
     USER_CONNECTED,LOGOUT,COMMUNITY_CHAT,
     USER_DISCONNECTED,POSITIVE,NEGATIVE} = require('../events')
const {createUser,createMessage,createChat} = require('../factories')

let communityChat = createChat({isCommunity:true}); 

module.exports = function(socket){


    let sendMessageToChatFromUser;
    let sendTypingFromUser;
    socket.on(VERIFY_USER, (nickname, callback)=>{
        if(isUser(connectedUsers,nickname)){
            callback({isUser:true,user:null})
        }else{
            callback({isUser:false,user:createUser({name:nickname,socketId:socket.id})})
        }
    })

    socket.on(USER_CONNECTED,(user)=>{
        user.socketId = socket.id
        connectedUsers = addUser(connectedUsers,user)
        socket.user = user
        // console.log(USER_CONNECTED)
        sendMessageToChatFromUser = sendMessageToChat(user.name)
        sendTypingFromUser = sendTypingToChat(user.name)
        io.emit(USER_CONNECTED,connectedUsers)
        console.log(connectedUsers)
    })

    socket.on(TYPING,({chatId,isTyping})=>{
        sendTypingFromUser(chatId,isTyping)
    })

    sendTypingToChat = (user)=>{
        return (chatId,isTyping)=>{
            io.emit(`${TYPING}-${chatId}`,{user,isTyping})
        }
    }

    socket.on(COMMUNITY_CHAT,callback=>{
        callback(communityChat)
    })

    socket.on(MESSAGE_SENT,({chatId,message})=>{
        textapi.sentiment({
            'text': message
          }, function(error, response) {
            if (error === null) {
                sendMessageToChatFromUser(chatId,message,response)
            }
            else{
                sendMessageToChatFromUser(chatId,message);
            }
          });
        
    })

    function sendMessageToChat(sender){
        return (chatId, message,sentimentResponse=null)=>{
            if(sentimentResponse) message = getFaceFromSentimentData(message,sentimentResponse)
            io.emit(`${MESSAGE_RECIEVED}-${chatId}`,createMessage({message,sender}))
        }
    }

    const getFaceFromSentimentData = (message,sentimentData) =>{
        if(sentimentData.polarity_confidence > 0.5 )
            if(sentimentData.polarity === POSITIVE)
                return message + "  :)"
            else if(sentimentData.polarity === NEGATIVE) return message + "  :("
        return message + "  :|"
    }

    socket.on(PRIVTE_MESSAGE,({reciever,sender})=>{
        if(reciever in connectedUsers){
            const newChat = createChat({name:`${reciever}&${sender}`,users:[reciever,sender]})
            const recieverSocket = connectedUsers[reciever].socketId
            console.log('socketManager',newChat)
            socket.to(recieverSocket).emit(PRIVTE_MESSAGE,newChat)
            socket.emit(PRIVTE_MESSAGE,newChat)
        }
    })
    socket.on(USER_DISCONNECTED,callback=>{

    })

    socket.on(LOGOUT,callback=>{
        connectedUsers = removeUser(connectedUsers, socket.user.name)
          
        io.emit(USER_DISCONNECTED, connectedUsers)
        console.log(connectedUsers)
    })



    socket.on('disconnect', function (){
        if(!!socket.user){
            console.log(socket.user)
          connectedUsers = removeUser(connectedUsers, socket.user.name)
          
          io.emit(USER_DISCONNECTED, connectedUsers)
          console.log(connectedUsers)
        }
        
    })

}

function isUser(userList,username){
     return username in userList
}

function removeUser(userList,username){
    let newList = Object.assign({},userList)
    delete newList[username]
    return newList
}

function addUser(userList,user){
    let newList = Object.assign({},userList)
    newList[user.name] = user
    return newList
}