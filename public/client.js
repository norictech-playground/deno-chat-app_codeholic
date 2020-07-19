let ws;

// participant related
const chatUserContainer = document.querySelector('#chatUsers')
const chatUserCount = document.querySelector('#chatUsersCount')

// message related
const messageForm = document.querySelector('#messageForm')
const messageInput = document.querySelector('#messageInput')
const chatArea = document.querySelector('#chatArea')

window.addEventListener('DOMContentLoaded', () => {
    ws = new WebSocket(`ws://localhost:3000/ws`)
    ws.addEventListener('open', onConnectionOpen)
    ws.addEventListener('message', onMessageReceived)
})

messageForm.onsubmit = (e) => {
    e.preventDefault()

    const event = {
        event: 'message',
        data: messageInput.value
    }
    ws.send(JSON.stringify(event))
    messageInput.value = ''
}

const onConnectionOpen = () => {
    const queryParams = getQueryParams()

    if (!queryParams.group || !queryParams.name) {
        window.location.href = 'chat.html'
        return
    }

    const event = {
        event: 'join',
        groupName: queryParams.group,
        name: queryParams.name
    }
    ws.send(JSON.stringify(event))
}

const onMessageReceived = (event) => {
    event = JSON.parse(event.data)
    
    switch (event.event) {
        case 'users':
                chatUserCount.innerHTML = event.data.length
                chatUserContainer.innerHTML = ''
                event.data.forEach(u => {
                    const userEl = document.createElement('div')
                    userEl.className = 'chat-user'
                    userEl.innerHTML = u.name
                    chatUserContainer.append(userEl)
                })
            break

        case 'message':
                const messageEl = document.createElement('div')
                messageEl.className = `message ${event.data.sender ? 'message-to' : ''}`
                messageEl.innerHTML = `
                    ${event.data.sender ? '' : `<h4>${event.data.name}</h4>`}
                    <p class="message-text">${event.data.message}</p>
                `
                chatArea.append(messageEl)
            break

        case 'previous-message':
                chatArea.innerHTML = ''
                event.data.forEach(msg => {
                    const previousMessageEl = document.createElement('div')
                    previousMessageEl.className = `message ${msg.sender ? 'message-to' : ''}`
                    previousMessageEl.innerHTML = `
                        ${msg.sender ? '' : `<h4>${msg.name}</h4>`}
                        <p class="message-text">${msg.message}</p>
                    `
                    chatArea.append(previousMessageEl)
                })
            break
    
        default:
            break
    }
}

const getQueryParams = () => {
    const search = window.location.search.substring(1)
    const pairs = search.split('&')
    const params = {}

    for (const pair of pairs) {
        const parts = pair.split('=')
        params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1])
    }

    return params
}