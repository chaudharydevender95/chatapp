import React,{Component} from 'react';
import SideBar from '../sidebar/SideBar'
import {PRIVTE_MESSAGE,COMMUNITY_CHAT,MESSAGE_RECIEVED,TYPING,MESSAGE_SENT,USER_CONNECTED,USER_DISCONNECTED} from '../../events'
import ChatHeading from './ChatHeading'
import MessageInput from './MessageInput'
import Messages from './Messages'
import {values} from 'lodash'

export default class ChatContainer extends Component {
    constructor(props){
        super(props)
        this.state = {
            chats:[],
            users:[],
            activeChat:null,
            communityChat:null,
        }
        this.resetChat = this.resetChat.bind(this)
    }

    componentDidMount(){
        console.log('chat container')
        const {socket} = this.props
        socket.emit(COMMUNITY_CHAT,this.resetChat)
        this.initSocket()
    }
    componentWillUnmount() {
		this.deinitialize()
	}
    initSocket(){
        console.log('initsocket')
        const { socket,user } = this.props
        socket.on(PRIVTE_MESSAGE,this.addChat)
		socket.on('connect', ()=>{
			// socket.emit(COMMUNITY_CHAT, this.resetChat)
        })
        socket.on(USER_CONNECTED,(users)=>{
            this.setState({users:values(users)})
        })
        socket.on(USER_DISCONNECTED,users=>{
            this.setState({users:values(users)})
        })
        // socket.emit(PRIVTE_MESSAGE,{reciever:"random name",sender:user.name})
    }
    
    sendOpenPrivateMessage = (reciever)=>{
        const {socket,user} = this.props
        socket.emit(PRIVTE_MESSAGE,{reciever,sender:user.name})
    }

    deinitialize = ()=>{
		const { socket } = this.props
        socket.off(PRIVTE_MESSAGE)
        socket.off(USER_CONNECTED)
        socket.off(USER_DISCONNECTED)
    }
    removeSocketEvents = (socket, events)=>{

		if(events.length > 0){
			socket.off(events[0])
			this.removeSocketEvents(socket, events.slice(1))
		}
	}
    resetChat = (chat)=>{
        console.log('reset chat')
        return this.addChat(chat, true)
    }

    addChat = (chat,reset=true) =>{
       const {socket} = this.props
       const {chats} = this.state 

       const newChats = [...chats,chat]
       this.setState({chats:newChats,activeChat:reset? chat:this.state.activeChat})

       const messageEvent = `${MESSAGE_RECIEVED}-${chat.id}`
       const typingEvent = `${TYPING}-${chat.id}`

       socket.on(messageEvent,this.addMessageToChat(chat.id))
       socket.on(typingEvent,this.updateTypingChat(chat.id))
    }
    setActiveChat = (activeChat)=>{
        this.setState({activeChat})
    }

    addMessageToChat = (chatId)=>{
        return message => {
            const {chats} = this.state
            let newChats = chats.map(chat=>{
                if(chat.id === chatId)
                    chat.messages.push(message)
                return chat
            })

            this.setState({chats:newChats})
        }
    }

    updateTypingChat = (chatId)=>{
        return ({isTyping,user})=>{
            console.log('typing',chatId)
            if(user !== this.props.user.name){
                const {chats} = this.state

                let newChats = chats.map((chat)=>{
                    if(chat.id === chatId){
                        if(isTyping && !chat.typingUsers.includes(user)){
                            chat.typingUsers.push(user)
                        }else{
                            if(!isTyping && chat.typingUsers.includes(user)){
                                chat.typingUsers = chat.typingUsers.filter(u => u!==user)
                            }
                        }
                    }
                    return chat
                })
                this.setState({chats:newChats})
            }
        }
    }

    sendMessage = (chatId, message)=>{
        const {socket} = this.props
        socket.emit(MESSAGE_SENT,{chatId, message})
    }

    sendTyping = (chatId, isTyping)=>{
        const {socket} = this.props
        socket.emit(TYPING,{chatId, isTyping})
    }

    render(){
        const {user,logout} = this.props
        const {chats,activeChat,users} = this.state
        return (
            <div className="container">
                <SideBar
                    logout={logout}
                    chats={chats}
                    user={user}
                    users={users}
                    activeChat={activeChat}
                    setActiveChat={this.setActiveChat}
                    onSendPrivateMessage={this.sendOpenPrivateMessage}
                ></SideBar>

                <div className="chat-room-container">
                    {
                        
                        activeChat !== null ? (
                            <div className="chat-room">
                                <ChatHeading name={activeChat.name}/>
                                <Messages
                                    messages={activeChat.messages}
                                    user={user}
                                    typingUsers={activeChat.typingUsers}
                                ></Messages>
                                <MessageInput
                                    sendMessage={
                                        (message)=>{
                                            this.sendMessage(activeChat.id, message)
                                        }
                                    }
                                    sendTyping={
                                        (isTyping)=>{
                                            this.sendTyping(activeChat.id, isTyping)
                                        }
                                    }
                                ></MessageInput>
                            </div>
                        )  :
                        <div className="chat-room choose">
                            <h3>Choose a Chat!</h3>
                        </div>   
                        
                    }
                </div>
            </div>
        )
    }
}
