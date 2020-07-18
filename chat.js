import { v4 } from 'https://deno.land/std/uuid/mod.ts'

/**
 * {
 *      userId: string,
 *      name: string,
 *      groupName: string,
 *      ws: WebSocket
 * }
 */
const userMap = new Map()
const groupMap = new Map()

const chat = async (ws) => {
    const userId = v4.generate

    for await (let data of ws) {
        const event = typeof data === 'string' ? JSON.parse(data) : data

        switch (event.event) {
            case 'join':
                    const userObj = {
                        userId,
                        name: event.name,
                        groupName: event.group,
                        ws
                    }
                    userMap.set(userId, userObj)

                    const users = groupMap.get(event.groupName) || []
                    users.push(userObj)
                    groupMap.set(event.groupName, users)

                    emitEvent(event.groupName)
                break;
        
            default:
                break;
        }
    }
}

// emit event when user joined the chat
const emitEvent = (groupName) => {
    const users = groupMap.get(groupName) || []

    for (const user of users) {
        const event = {
            event: 'users',
            data: getDisplayUsers(groupName)
        }
        user.ws.send(JSON.stringify(event))
    }
}

const getDisplayUsers = (groupName) => {
    const users = groupMap.get(groupName) || []

    return users.map(u => {
        return {
            userId: u.usersId, 
            name: u.name
        }
    })
}

export default chat