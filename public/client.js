let ws;

window.addEventListener('DOMContentLoaded', () => {
    ws = new WebSocket(`ws://localhost:3000/ws`)
    ws.addEventListener('open', onConnectionOpen)
    ws.addEventListener('message', onMessageReceived)

    const queryParams = getQueryParams()
    console.log(queryParams)
})

const onConnectionOpen = () => console.log('connection opened!')

const onMessageReceived = (event) => console.log('message received!', event)

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