import { Client, VoiceChannel, VoiceConnection, StreamDispatcher } from "discord.js";
import { Channels } from "../../settings.json";
import ErrorHandler from "../../error-handler";

export default class  Radio {
    private static client: Client
    private static isInitalized = false;

    private static radioChannel: VoiceChannel = null;
    private static voiceConnection: VoiceConnection = null;
    private static dispatcher: StreamDispatcher = null;

    private static isPlaying = false;

    public static streamUrl: string = null;

    public static async init(client: Client) {
        try {
            this.client = client;
            const radioChannel = await this.client.channels.fetch(Channels.radioId);
            if(radioChannel.type !== "voice") throw new Error("The radio channel is not a voice channel!");
            this.radioChannel = <VoiceChannel>radioChannel;
            this.isInitalized = true;
        } catch (error) {
            ErrorHandler.Log(error);
        }
    }

    private static async handleDisconenct(error: Error) {
        if(error) ErrorHandler.Log(error);
        if(!Radio.isPlaying) return;
        Radio.disconnect();
        try {
            await Radio.initVoiceConnection();
            Radio.play();
        } catch (error) {
            ErrorHandler.Log(error);
        }
    }

    private static async initVoiceConnection() {
        try {
            console.log("Joining");
            this.voiceConnection = await this.radioChannel.join();
            this.voiceConnection.on("error", ErrorHandler.Log);
            this.voiceConnection.on("disconnect", this.handleDisconenct);
            this.voiceConnection.on("failed", ErrorHandler.Log);
            this.voiceConnection.on("closing", () => console.log("Closing"));
        } catch (error) {
            ErrorHandler.Log(error);
        }
    }

    public static async join() {
        if(!this.isInitalized) throw new Error("Radio is not intialited!");
        try {
            await this.initVoiceConnection();
        } catch (error) {
            ErrorHandler.Log(error);
        }
    }

    public static disconnect() {
        if(!this.isInitalized) throw new Error("Radio is not intialited!");
        try {
            console.log("Disconnected");
            this.isPlaying = false;
            this.voiceConnection.disconnect();
            this.voiceConnection = null;
        } catch (error) {
            ErrorHandler.Log(error);
        }
    }

    public static play() {
        if(!this.isInitalized) throw new Error("Radio is not intialited!");
        try {
            if(!this.voiceConnection) throw new Error("Not joined any voice channel!");
            if(!this.streamUrl === null) throw new Error("Stream URL is null!");
            this.dispatcher = this.voiceConnection.play(this.streamUrl);
            this.dispatcher.on("error", ErrorHandler.Log);
            this.isPlaying = true;
            console.log("Playing");
        } catch (error) {
            ErrorHandler.Log(error);
        }
    }

    public static setVolume(volume: number) {
        if(!this.isInitalized) throw new Error("Radio is not intialited!");
        try {
            if(!this.dispatcher) throw new Error("Dispatcher is not defined!");
            this.dispatcher.setVolume(volume);
        } catch (error) {
            ErrorHandler.Log(error);
        }
    }
}