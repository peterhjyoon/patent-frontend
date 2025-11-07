import { AppEvent } from "./app-event";

export interface LifeStoryResponse {
    story?: string;
    events?: AppEvent[];
}
