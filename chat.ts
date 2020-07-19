import { isWebSocketCloseEvent, WebSocket } from 'https://deno.land/std/ws/mod.ts'
import { v4 } from 'https://deno.land/std/uuid/mod.ts'

/**
 * both userMap and groupMap:
 * {
 *      userId: string,
 *      name: string,
 *      groupName: string,
 *      ws: WebSocket
 * }
 */
const userMap = new Map()
const groupMap = new Map()

/**
 * {
 *      userId: string,
 *      name: string,
 *      message: string
 * }
 */
interface Message {
    userId: string,
    name: string,
    groupName: string,
    message: string,
    sender: boolean
}

const messageMap: Message[] = []

const chat = async (ws: any) => { // `ws` didapat dari sock di function acceptWebSocket
    const userId = v4.generate()

    for await (let data of ws) {
        const event = typeof data === 'string' ? JSON.parse(data) : data
        let userObj;

        if (isWebSocketCloseEvent(event)) { // on user left/disconnected from the chat
            userObj = userMap.get(userId)
            let users = groupMap.get(userObj.groupName) || []
            users = users.filter((u: any) => u.userId !== userId)
            groupMap.set(userObj.groupName, users)
            userMap.delete(userId)
            
            emitUsers(userObj.groupName) // emit to other participant
            break
        }

        switch (event.event) {
            case 'join':
                    userObj = {
                        userId,
                        name: event.name,
                        groupName: event.groupName,
                        ws
                    }
                    userMap.set(userId, userObj)

                    const users = groupMap.get(event.groupName) || []
                    users.push(userObj)
                    groupMap.set(event.groupName, users)

                    emitUsers(event.groupName)
                    emitPreviousMessages(event.groupName, userId, ws)
                break

            case 'message':
                    userObj = userMap.get(userId)
                    const message = {
                        userId,
                        name: userObj.name,
                        groupName: userObj.groupName,
                        message: event.data,
                        sender: false
                    }

                    let groupName = userObj.groupName
                    const messages = messageMap.filter(msg => msg.groupName === groupName) || []
                    messageMap.push(message)

                    emitMessage(userObj.groupName, message)
                break
        
            default:
                break
        }
    }
}

// emit event when user joined the chat
const emitUsers = (groupName: string) => {
    const users = groupMap.get(groupName) || []

    for (const user of users) {
        const event = {
            event: 'users',
            data: getDisplayUsers(groupName)
        }
        user.ws.send(JSON.stringify(event))
    }
}

const getDisplayUsers = (groupName: string) => {
    const users = groupMap.get(groupName) || []

    return users.map((u: any) => {
        return {
            userId: u.userId, 
            name: u.name
        }
    })
}

const emitMessage = (groupName: string, message: Message) => {
    const users = groupMap.get(groupName) || []

    for (const user of users) {
        message.sender = user.userId === message.userId
        const event = {
            event: 'message',
            data: message
        }
        user.ws.send(JSON.stringify(event))
    }
}

const emitPreviousMessages = (groupName: string, userId: string, ws: WebSocket) => {
    let messages = messageMap.filter((msg) => msg.groupName === groupName)
    messages.map(msg => msg.sender = msg.userId === userId)
    
    const event = {
        event: 'previous-message',
        data: messages
    }
    console.clear()
    console.log(event)
    ws.send(JSON.stringify(event))
}

export default chat