import '@emotion/react';
declare module '@emotion/react' { export interface Theme { colors: Record<string, string> } }
declare global { namespace ChatUI { type Size = 'fullSize' | 'miniPopup' | 'transparent' } }
declare global {
  namespace WebServices {
    namespace Chat { namespace GetRoom { interface Data { notice?: { noticeType: string; message: string }; voteNotice?: unknown } } }
    namespace DirectMessage { namespace GetReaders { interface Data { users: (import('./types').User & { guest?: boolean })[] } } }
  }
  namespace ChatServices { namespace Server {
    namespace MessageSent { interface Data { roomId: string; sender: import('./types').User } }
    namespace MessageReacted { interface Data { roomId: string; reacted: boolean } }
    namespace Typing { interface Data { type: string; id: string; roomID: string } }
    namespace MessageReadToRoom { interface Data { roomId: string; memberId: string; messageId: string } }
  } }
}
