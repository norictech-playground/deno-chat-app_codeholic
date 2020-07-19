let ws;

const chatUserContainer = document.querySelector('#chatUsers')

window.addEventListener('DOMContentLoaded', () => {
    ws = new WebSocket(`ws://localhost:3000/ws`)
    ws.addEventListener('open', onConnectionOpen)
    ws.addEventListener('message', onMessageReceived)
})

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
    console.log(event.event)
    
    switch (event.event) {
        case 'users':
                chatUserContainer.innerHTML = ''
                event.data.forEach(u => {
                    const userEl = document.createElement('div')
                    userEl.className = 'chat-user'
                    userEl.innerHTML = u.name
                    chatUserContainer.append(userEl)
                })
            break;
    
        default:
            break;
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