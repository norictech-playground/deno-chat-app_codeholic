import { v4 } from 'https://deno.land/std/uuid/mod.ts'

const chat = async (ws) => {
    console.log(`Connected`)

    const userId = v4.generate

    for await (let data of ws) {
        const event = JSON.parse(data)
    }
}

export default chat