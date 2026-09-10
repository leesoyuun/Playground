export const Configure = { userID: 'me' };
export const Utility = {
  // Preserve the original numeric minute difference (including its truthiness).
  getDayDiff: (a: number, b: number, _unit: 'minute') => Math.floor(a / 60000) - Math.floor(b / 60000),
  json: { isJson: (value: string) => { try { JSON.parse(value); return true; } catch { return false; } } },
  convert: { stringToJSON: (value: string): (ChatServices.Format2.Elements.AllRichtextElements | ChatServices.Format2.Message) | null => { try { return JSON.parse(value); } catch { return null; } } },
};
export const useFileExtensions = () => ({ getFileExtension: (mime: string) => mime.startsWith('video/') ? 'video' : 'file' });
