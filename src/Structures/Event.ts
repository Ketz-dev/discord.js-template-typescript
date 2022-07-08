import { ClientEvents } from "discord.js";
import { TSClient } from "./Client";

// event class
export class Event<K extends keyof ClientEvents> {
    public readonly once: boolean
    
    public constructor(
        public readonly key: K,
        public readonly emit: (client: TSClient, ...args: ClientEvents[K]) => void,
        once?: boolean
    ) { this.once = once ?? false }
}