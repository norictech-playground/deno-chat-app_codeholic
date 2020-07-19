import { isWebSocketCloseEvent } from 'https://deno.land/std/ws/mod.ts'
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

const chat = async (ws: any) => { // `ws` didapat dari sock di function acceptWebSocket
    const userId = v4.generate()

    for await (let data of ws) {
        const event = typeof data === 'string' ? JSON.parse(data) : data

        if (isWebSocketCloseEvent(event)) { // on user left/disconnected from the chat
            const userObj = userMap.get(userId)
            let users = groupMap.get(userObj.groupName) || []
            users = users.filter((u: any) => u.userId !== userId)
            groupMap.set(userObj.groupName, users)
            userMap.delete(userId)
            
            emitEvent(userObj.groupName) // emit to other participant
            break
        }

        switch (event.event) {
            case 'join':
                    const userObj = {
                        userId,
                        name: event.name,
                        groupName: event.groupName,
                        ws
                    }
                    userMap.set(userId, userObj)

                    const users = groupMap.get(event.groupName) || []
                    users.push(userObj)
                    groupMap.set(event.groupName, users)

                    emitEvent(event.groupName)
                break
        
            default:
                break
        }
    }
}

// emit event when user joined the chat
const emitEvent = (groupName: string) => {
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

export default chat