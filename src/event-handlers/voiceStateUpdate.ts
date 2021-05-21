import { VoiceState } from "discord.js";
import AnalyticSystem from "../systems/analytic";
import Radio from "../systems/radio";

export default async (oldState: VoiceState, newState: VoiceState) => {
    AnalyticSystem.Logic(oldState, newState);
    //Radio.onVoiceStateUpdate(oldState, newState);
};