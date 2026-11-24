import type {Settings,Track} from './types.ts';
export const trackVisible=(settings:Pick<Settings,'tracks'>,track:Track)=>settings.tracks[track].visible!==false;
export const visibleTracks=(settings:Pick<Settings,'tracks'>)=>(['menengah','universiti'] as Track[]).filter(t=>trackVisible(settings,t));
