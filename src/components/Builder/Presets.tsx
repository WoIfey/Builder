export type PresetOption = 'default' | 'epicgames' | 'steam'

export type PresetData = {
	content: string
	embeds: Array<{
		color: number
		fields: Array<{
			name?: string
			value?: string
			inline?: boolean
		}>
		footer?: {
			text: string
		}
		timestamp?: string
		author?: {
			name?: string
			url?: string
			icon_url?: string
		}
		image?: {
			url: string
		}
	}>
	username: string
	avatar_url: string
}

export const presets: Record<PresetOption, EmbedData> = {
	default: {
		content: '',
		embeds: [],
		username: '',
		avatar_url: '',
	},
	epicgames: {
		content: '<@&847939354978811924>',
		embeds: [
			{
				color: parseInt('#85ce4b'.replace('#', ''), 16),
				fields: [
					{
						name: 'Game',
						value: '~~€~~ **Free**\n[Claim Game]()',
						inline: true,
					},
				],
				author: {
					name: 'Epic Games Store',
					url: 'https://free.wolfey.me/',
					icon_url: 'https://wolfey.s-ul.eu/YcyMXrI1',
				},
				footer: {
					text: 'Offer ends',
				},
				timestamp: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
				image: {
					url: '',
				},
			},
		],
		username: 'Free Games',
		avatar_url: 'https://wolfey.s-ul.eu/5nV1WPyv',
	},
	steam: {
		content: '<@&847939354978811924>',
		embeds: [
			{
				color: parseInt('#85ce4b'.replace('#', ''), 16),
				fields: [
					{
						name: 'Game',
						value: '~~€~~ **Free**\n[Claim Game]()',
						inline: true,
					},
				],
				author: {
					name: 'Steam',
					url: 'https://free.wolfey.me/',
					icon_url: 'https://wolfey.s-ul.eu/zoX0PE7K',
				},
				footer: {
					text: 'Offer ends',
				},
				timestamp: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
				image: {
					url: '',
				},
			},
		],
		username: 'Free Games',
		avatar_url: 'https://wolfey.s-ul.eu/5nV1WPyv',
	},
}
