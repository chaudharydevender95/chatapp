import React,{Component} from 'react';
import {FaChevronDown,FaSearchengin} from 'react-icons/fa'
import {MdEject} from 'react-icons/md'
import Menu from '@material-ui/core/Menu';
import {SideBarOption} from './sidebarOptions'
import {get, last, differenceBy} from 'lodash'
import {createChatNameFromUsers} from '../../factories'
// import FAMenu from 'react-icons/lib/fa/list-ul'
// import FASearch from 'react-icons/lib/fa/search'
// import MdEject from 'react-icons/lib/md/eject'

export default class SideBar extends Component {

    static types = {
		USERS:"users",
		CHATS:"chats"
    }

    constructor(props){
        super(props)
    
        this.state={
            reciever:"",
            activeSideBar: SideBar.types.CHATS
        }
    }

    handleSubmit = (e)=>{
        e.preventDefault();

        const {reciever} = this.state
        const {onSendPrivateMessage} = this.props
        onSendPrivateMessage(reciever)
    }

    addChatForUser = (username)=>{
        this.setActiveSideBar(SideBar.types.CHATS)
        this.props.onSendPrivateMessage(username)
    }
    
    setActiveSideBar = (type) => {
		this.setState({ activeSideBar:type })   
    }

    render(){
        const { chats, activeChat, user,users, setActiveChat, logout } = this.props
        const { reciever, activeSideBar } = this.state
        return(
            <div id="side-bar">
            <div className="heading">
                <div className="app-name">Zanjo Chat
                 <FaChevronDown />
                 </div>
                <div className="menu">
                    {/* <Menu /> */}
                </div>
            </div>
            <form onSubmit={this.handleSubmit} className="search">
                <i className="search-icon">
                <FaSearchengin />
                </i>
                <input value={this.state.reciever} onChange={e=>{this.setState({reciever:e.target.value})}} placeholder="Search" type="text"/>
                <div className="plus"></div>
            </form>
                <div className="side-bar-select">
						<button 
							onClick = { ()=>{ this.setActiveSideBar(SideBar.types.CHATS) } }
							className={`side-bar-select__option ${ activeSideBar === SideBar.types.CHATS ? 'active':''}`}>
							Chats 
						</button>
						<button 
							onClick = { ()=>{ this.setActiveSideBar(SideBar.types.USERS) } }
							className={`side-bar-select__option ${ activeSideBar === SideBar.types.USERS ? 'active':''}`}>
							Users
						</button>
                </div>
            <div 
                className="users" 
                ref='users' 
                onClick={(e)=>{ (e.target === this.refs.user) && setActiveChat(null) }}>
                
                {
                    activeSideBar === SideBar.types.CHATS ?
                chats.map((chat)=>{
                    if(chat.name){
                        // const lastMessage = chat.messages[chat.messages.length - 1];
                        const chatNames = chat.users.find((name)=>{
                            return name !== user.name
                        }) || "Community"
                        // console.log('sidebar',chat)
                        // const classNames = (activeChat && activeChat.id === chat.id) ? 'active' : ''
                        return(
                            
                            <SideBarOption
                                key={chat.id}
                                name = {chat.isCommunity ? chat.name : chatNames}
                                lastMessage = {get(last(chat.messages),"message","")}
                                active = {activeChat.id === chat.id}
                                onClick = {()=>{this.props.setActiveChat(chat)}}
                            />
                        // <div 
                        //     key={chat.id} 
                        //     className={`user ${classNames}`}
                        //     onClick={ ()=>{ setActiveChat(chat) } }
                        //     >
                        //     <div className="user-photo">{chatNames[0].toUpperCase()}</div>
                        //     <div className="user-info">
                        //         <div className="name">{chatNames}</div>
                        //         {lastMessage && <div className="last-message">{lastMessage.message}</div>}
                        //     </div>
                            
                            
                        
                    )
                    }

                    return null
                }	)
                
                :
                
                    differenceBy( users,[user],"name").map(otheruser=>{
                        return(
                            <SideBarOption
                                key={otheruser.id}
                                name={otheruser.name}
                                onClick={()=>{this.addChatForUser(otheruser.name)}}
                            />
                        )
                    })
                }

                
            </div>
            <div className="current-user">
                <span>{user.name}</span>
                <div onClick={()=>{logout()}} title="Logout" className="logout">
                    <MdEject/>	
                </div>
            </div>
        </div> 
        )
    }
}