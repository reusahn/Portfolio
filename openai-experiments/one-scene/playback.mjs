/** Authored pacing contract. This is a browser presentation utility, not model output. */
export const PACE_MS=Object.freeze({linger:3200,measured:2200,brisk:1250});
export function shotDuration(pace){
  if(!Object.hasOwn(PACE_MS,pace))throw new Error("Unknown playback pace");
  return PACE_MS[pace];
}
export function nextShotIndex(index,total){
  if(!Number.isInteger(index)||!Number.isInteger(total)||total<1||index<0||index>=total)throw new Error("Invalid shot position");
  return index+1<total?index+1:null;
}

/** Announce intentional navigation, but do not flood a screen reader on timed playback. */
export function shotAnnouncement(playing, witnessName, index, shotLabel){
  if(typeof playing!=="boolean"||typeof witnessName!=="string"||!witnessName.trim()||
     !Number.isInteger(index)||index<0||typeof shotLabel!=="string"||!shotLabel.trim())
    throw new Error("Invalid shot announcement");
  return playing?null:witnessName+", shot "+(index+1)+": "+shotLabel;
}
