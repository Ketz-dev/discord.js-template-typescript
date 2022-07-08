import { Event } from "../Structures/Event";

// our ready event
export default new Event('ready', (client) => {

    // usually, {client.user} is possibly undefined and we have to call `Client#isReady()` to make sure. But since we explicitly extended our Client with {Client<true>}, it's already ready!
    console.log('Logged in as %s!', client.user.tag)

    // WEEZER!
    client.user.setActivity({ name: 'Weezer', type: 'LISTENING' }) // feel free to remove this :)

    // add your own code here, or you can make a new event file with a different name but still export it as the ready event for ease of management.
})