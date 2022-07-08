
import { APIApplicationCommandOption, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { CommandInteraction, PermissionResolvable, Permissions } from "discord.js";
import { TSClient } from "./Client";

// the config object to pass when instantiating a command
export interface ICommandConfig {
    name: string; category: string; description: string
    options?: APIApplicationCommandOption[]; permissions?: PermissionResolvable
}

// command class
export class Command {
    // some application command properties
    private readonly options: APIApplicationCommandOption[]
    private readonly permissions: `${bigint}`

    public readonly name: string
    public readonly category: string
    public readonly description: string

    public constructor(
        config: ICommandConfig,
        public readonly execute: (client: TSClient, interaction: CommandInteraction<'cached'>) => void
    ) {
        this.name = config.name
        this.category = config.category
        this.description = config.description

        this.options = config.options ?? []

        // uses the default permission flags if `config.permission` is null.
        this.permissions = Permissions.resolve(config.permissions ?? Permissions.DEFAULT).toString() as `${bigint}`
    }
    
    // convert it to JSON for to put it to our REST application
    public toJSON(): RESTPostAPIApplicationCommandsJSONBody {
        return {
            name: this.name, description: this.description,
            options: this.options, default_member_permissions: this.permissions,
            dm_permission: false // commands are DMs only as of now, since you're most likely going to be running these commands in a test server, but I will add support for DMs in the future!
        }
    }
}