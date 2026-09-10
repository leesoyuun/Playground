/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @copyright (C) 2023, rsupport. All rights reserved
 *
 * @license
 * This software and/or source code may be used, copied and/or disseminated only
 * with the written permission of rsupport, or in accordance with the terms
 * and conditions stipulated in the agreement/contract under which the software
 * and/or source code has been supplied by rsupport or its affiliates.
 * Unauthorized use, copying, or dissemination of this file, via any medium, is
 * strictly prohibited, and will constitute an infringement of copyright.
 *
 * @author
 * SoonKi Min (skmin@rsupport.com)
 *
 * @description
 *
 * @created at Tue Dec 19 2023
 **/

declare global {
	namespace ChatServices {
		namespace Format2 {
			type TextStyle = Partial<{
				bold: boolean;
				italic: boolean;
				underline: boolean;
				strike: boolean;
				code: boolean;
			}>;

			namespace System {
				type Create = {
					key: "create";
					data: {
						inviter: { memberId: string; memberName: string };
						invitee: { memberId: string; memberName: string }[];
					};
				};
				type ChannelCreate = {
					key: "channelCreate";
					data: {
						roomName: string;
						inviter: { memberId: string; memberName: string };
						invitee: { memberId: string; memberName: string }[];
					};
				};
				type NameUpdate = {
					key: "nameUpdate";
					data: {
						memberId: string;
						roomName: string;
					};
				};
				type VoiceStart = {
					key: "voiceChatStart";
					data: {
						memberId: string;
					};
				};
				type VoiceEnd = {
					key: "voiceChatEnd";
					data: {
						memberId: string;
						startTime: number;
						endTime: number;
					};
				};
				type VoiceJoin = {
					key: "voiceChatJoin";
					data: null;
				};
				type HangupNoResponseCall = {
					key: "hangupNoResponseCall";
					data: {
						callId: string;
						caller: {
							id: string;
							name: string;
							profileImagePath: string;
							colorProfile: string;
						};
						receiver: {
							id: string;
							name: string;
							profileImagePath: string;
							colorProfile: string;
						};
						callUsers: [
							{
								id: string;
								name: string;
								profileImagePath: string;
								colorProfile: string;
							}
						];
					};
				};
				type MemberAdded = {
					key: "add";
					data: {
						inviter: { memberId: string; memberName: string };
						invitee: { memberId: string; memberName: string }[];
					};
				};
				type Knock = {
					key: "knock";
					data: {
						sender: {
							memberId: string;
							memberName: string;
						};
						receiver: {
							memberId: string;
							memberName: string;
						};
						spaceId: string;
						spaceName: string;
					};
				};
			}

			namespace Votes {
				export type Create = {
					key: "create";
				};
				export type End = {
					key: "end";
				};
				export type Remind = {
					key: "remind";
				};
			}

			namespace Games {
				export type Invite = {
					type: "invite";
					data: {
						gameRoomId: string;
						gameId: string;
						gameType: string;
						themePath: string;
						teamGame: boolean;
						i18ns: [
							{
								language: string;
								name: string;
								description: string;
								detailDescription: string;
							}
						];
					};
				};
			}

			namespace Elements {
				export type Text = {
					type: "text";
					text: string;
					style?: TextStyle;
				};

				export type Image = {
					type: "image";
					id: string;
					url: string;
					alt?: string;
					title?: string;
				};

				export type CodeBlock = {
					type: "codeBlock";
					code: string;
					codeStyle?: string;
				};

				export type List = {
					type: "makeList";
					marker?: "dot" | "dash" | "number" | "bullet" | "ordered" | "unknown";
					elements: (Section | Text | Link | User)[];
				};

				export type BlockQuote = {
					type: "blockquote";
					elements: (Section | Text)[];
				};

				export type User = {
					type: "user";
					id: string;
					name: string;
				};

				export type Link = {
					type: "link";
					url: string;
					title: string;
					info: {
						url?: string;
						title?: string;
						type?: string;
						image?: string;
						description?: string;
						fileBoxId: string;
					};
				};

				export type SectionAllowElements = Text | Link | User;
				export type Section = {
					type: "section";
					elements: SectionAllowElements[];
				};

				export type File = {
					type: "file";
					url: string;
					title: string;
					mime: string;
					size: number;
					id: string;
					displaySize: string;
					docThumbnailPath?: string;
					videoThumbnailPath?: string;
				};

				export type Emoticon = {
					type: "emoticon";
					text: string;
					name?: string;
				};

				export type AllTypes =
					| Text["type"]
					| Image["type"]
					| CodeBlock["type"]
					| List["type"]
					| BlockQuote["type"]
					| User["type"]
					| Section["type"]
					| Link["type"]
					| File["type"]
					| Emoticon["type"];

				export type AllRichtextElements =
					| Text
					| Image
					| CodeBlock
					| List
					| BlockQuote
					| User
					| Section
					| Link
					| File
					| Emoticon;
				export type AllSystemElements =
					| System.Create
					| System.ChannelCreate
					| System.NameUpdate
					| System.VoiceStart
					| System.VoiceJoin
					| System.VoiceEnd
					| System.VoiceEnd
					| System.HangupNoResponseCall
					| System.MemberAdded
					| System.Knock;
				export type AllVoteElements = Votes.Create | Votes.End | System.Remind;
				export type AllGameElements = Games.Invite;
			}

			namespace Container {
				export type Richtext = {
					type: "richtext";
					elements: Elements.AllRichtextElements[];
				};

				export type System = {
					type: "system";
					elements: Elements.AllSystemElements[];
				};

				export type Vote = {
					type: "vote";
					elements: Elements.AllVoteElements[];
				};

				export type Game = {
					type: "game";
					elements: Elements.AllGameElements[];
				};
			}

			type Message = Container.Richtext;
			type SystemMessage = Container.System;
			type VoteMessage = Container.Vote;
			type GameMessage = Container.Game;
			type All = Message | SystemMessage | VoteMessage | GameMessage;
		}
	}
}

export {};
