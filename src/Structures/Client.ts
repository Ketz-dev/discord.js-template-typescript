import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { Client, Collection, Intents } from "discord.js";
import { readdir } from "fs/promises";
import { join, parse } from "path";
import { defaultImport } from "../util/FS";
import { Command } from "./Command";
import { Event } from "./Event";

/**
 * The client class.
 */
export class TSClient extends Client<true> { // explicitly passing `true` here so that we will be able to access all of the properties and methods without having to call `#isReady()`.
    public readonly commands = new Collection<string, Command>()

    public constructor() {
        super({
            // gateway intents
            intents: Intents.FLAGS.GUILDS | Intents.FLAGS.GUILD_MESSAGES, // make sure to add the intents you wish to use.

            // other options
            allowedMentions: { repliedUser: false } // turn this off to avoid annoying users when replying to commands. :)

            // feel free to add your own options here.
        }) 
    }

    /**
     * Registers and listens for the client events.
     */
    private async registerEvents(): Promise<void> {
        console.log('Registering events...\n')

        // as of now, Glob doesn't seem to work for some reason. So we'll be using node:fs.
        let eventsPath = join(__dirname, '..', 'events')
        let eventFiles = (await readdir(eventsPath)).filter(file => file.endsWith('.js') || file.endsWith('.ts')) // filtering out files that aren't typescript

        for (let file of eventFiles) {
            let filePath = join(eventsPath, file)
            let event = await defaultImport<Event<any>>(filePath)

            // making sure the event is an event
            if (!(event instanceof Event)) {
                console.log('%s does not export an event - failed!', file)

                continue // not breaking/returning since we still want our bot to run.
            }

            // only listens once for events with the `once` property true.
            this[event.once ? 'once' : 'on'](event.key, event.emit.bind(null, this))

            console.log('%s: %s - successful!', event.key, file)
        }

        console.log('\nEvents registered!')
    }

    /**
     * Registers the application commands.
     */
    private async registerCommands(): Promise<void> {
        console.log('Registering commands...\n')

        // again, using node:fs.
        let categoriesPath = join(__dirname, '..', 'commands')
        let categoryDirectories = await readdir(categoriesPath)

        // we will be using categories to manage our commands easily.
        for (let directory of categoryDirectories) {
            let commandsPath = join(categoriesPath, directory)
            let commandFiles = (await readdir(commandsPath)).filter(file => file.endsWith('.js') || file.endsWith('.ts')) // again, filtering out files that aren't typescript

            for (let file of commandFiles) {
                let filePath = join(commandsPath, file)
                let command = await defaultImport<Command>(filePath)

                // again, making sure if the command is a command.
                if (!(command instanceof Command)) {
                    console.log('%s does not export a command - failed!', file)

                    continue
                }

                this.commands.set(command.name, command)

                console.log('%s: %s - successful!', command.category, command.name)
            }
        }

        // deploying our commands.
        let rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN!) // explicitly asserting `BOT_TOKEN` to non-nullable because ts-node thinks it's null, for some reason...
        
        // deploy our commands to our test server if we are in 'dev' mode. Otherwise, deploy it to the application.
        let route = process.env.MODE! == 'dev' ? Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!) : Routes.applicationCommands(process.env.CLIENT_ID!) // again, asserting it because ts-node is silly.

        // try-catch for safety.
        try {
            // map our commands to JSON.
            await rest.put(route, { body: this.commands.map(command => command.toJSON()) })

            console.log('\nCommands registered!')
        } catch (error) { // catching in case anything goes wrong.
            console.log('\nFailed to register commands')
            console.error(error)
        }
    }

    /**
     * Launches the client.
     */
    public start(): void {
        // register events and commands.
        Promise.all([this.registerEvents(), this.registerCommands()])
            .then(() => this.login(process.env.BOT_TOKEN!)) // login once we've registered everything.
            .catch(console.error) // catch in case anything goes wrong.
    }
}