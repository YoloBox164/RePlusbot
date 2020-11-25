import { VoiceState } from "discord.js";
import AnalyticSystem from "../systems/analytic";

export default async (oldState: VoiceState, newState: VoiceState) => {
    AnalyticSystem.Logic(oldState, newState);
}