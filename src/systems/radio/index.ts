import { Client, VoiceChannel, VoiceConnection, StreamDispatcher, VoiceState } from "discord.js";
import { Channels } from "../../settings.json";
import ErrorHandler from "../../error-handler";
import AnalyticSystem from "../analytic";

export default class  Radio {
    private static client: Client
    private static isInitalized = false;

    private static radioChannel: VoiceChannel = null;
    private static voiceConnection: VoiceConnection = null;
    private static dispatcher: StreamDispatcher = null;

    public static isPlaying = false;

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

    public static async join() {
        if(!this.isInitalized) throw new Error("Radio is not intialited!");
        try {
            this.voiceConnection = await this.radioChannel.join();
            this.voiceConnection.on("error", ErrorHandler.Log);
            this.voiceConnection.on("disconnect", Radio.join);
            this.voiceConnection.on("failed", ErrorHandler.Log);
        } catch (error) {
            ErrorHandler.Log(error);
        }
    }

    public static disconnect() {
        if(!this.isInitalized) throw new Error("Radio is not intialited!");
        try {
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
        } catch (error) {
            ErrorHandler.Log(error);
        }
    }

    public static stop() {
        if(!this.isInitalized) throw new Error("Radio is not intialited!");
        try {
            if(!this.voiceConnection) throw new Error("Not joined any voice channel!");
            this.dispatcher.destroy();
            this.isPlaying = false;
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

    public static onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
        if (
            oldState.channelID !== this.radioChannel.id &&
            newState.channelID !== this.radioChannel.id
        ) return;

        if(newState.channelID && oldState.channelID !== newState.channelID) { // Join or Change
            if(!this.isPlaying && this.voiceConnection) {
                this.play();
            }
        };

        if(oldState.channelID && oldState.channelID !== newState.channelID) { // Leave or Change
            if(oldState.channel.members.size === 1) {
                this.stop();
            }
        }
    }
}