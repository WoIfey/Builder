'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Theme from '@/components/Theme'
import { decrypt } from '@/lib/encryption'
import WebhookInput from '@/components/Builder_v1/WebhookInput'
import BotSettings from '@/components/Builder_v1/BotSettings'
import MessageContent from '@/components/Builder_v1/MessageContent'
import EmbedEditor from '@/components/Builder_v1/EmbedEditor'
import EmbedPreview from '@/components/Builder_v1/EmbedPreview'
import { toast } from 'sonner'
import limits from '@/lib/limits'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const encodeEmbedData = (data: EmbedData): string => {
	return Buffer.from(JSON.stringify(data))
		.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '')
}

const decodeEmbedData = (base64: string): EmbedData | null => {
	try {
		const pad = base64.length % 4
		const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64

		const normalized = paddedBase64.replace(/-/g, '+').replace(/_/g, '/')

		const jsonString = Buffer.from(normalized, 'base64').toString()
		return JSON.parse(jsonString)
	} catch (error) {
		console.error('Failed to decode URL data:', error)
		return null
	}
}

const debounce = <T extends (...args: any[]) => any>(
	func: T,
	wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } => {
	let timeout: NodeJS.Timeout | null = null

	const debounced = (...args: Parameters<T>) => {
		if (timeout) clearTimeout(timeout)
		timeout = setTimeout(() => func(...args), wait)
	}

	debounced.cancel = () => {
		if (timeout) {
			clearTimeout(timeout)
			timeout = null
		}
	}

	return debounced
}

const defaultEmbed: Embed = {
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
	timestamp: new Date().toISOString(),
	image: {
		url: '',
	},
}

export default function BuilderPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [isLoading, setIsLoading] = useState(true)
	const [isUpdating, setIsUpdating] = useState(false)
	const [embedData, setEmbedData] = useState<EmbedData>(() => {
		const dataParam = searchParams.get('data')
		if (dataParam) {
			const decoded = decodeEmbedData(dataParam)
			if (decoded) return decoded
		}
		return {
			content: '<@&847939354978811924>',
			embeds: [defaultEmbed],
			username: 'Free Games',
			avatar_url: 'https://wolfey.s-ul.eu/5nV1WPyv',
			attachments: [],
		}
	})
	const [webhookUrl, setWebhookUrl] = useState('')
	const [messageId, setMessageId] = useState('')

	useEffect(() => {
		const loadSavedWebhook = async () => {
			try {
				const savedWebhook = localStorage.getItem('embedWebhook')
				if (savedWebhook) {
					const decryptedWebhook = await decrypt(savedWebhook)
					setWebhookUrl(decryptedWebhook)
				}
			} catch (error) {
				console.error('Failed to load webhook:', error)
			} finally {
				setIsLoading(false)
			}
		}

		loadSavedWebhook()
	}, [])

	const updateUrl = useCallback(
		async (data: EmbedData) => {
			setIsUpdating(true)
			const params = new URLSearchParams(window.location.search)
			params.set('data', encodeEmbedData(data))
			router.push('?' + params.toString(), { scroll: false })

			await new Promise(resolve => setTimeout(resolve, 500))
			setIsUpdating(false)
		},
		[router]
	)

	const debouncedUpdateUrl = useMemo(
		() => debounce(updateUrl, 1000),
		[updateUrl]
	)

	useEffect(() => {
		debouncedUpdateUrl(embedData)
		return () => debouncedUpdateUrl.cancel()
	}, [embedData, debouncedUpdateUrl])

	const calculateEmbedCharCount = (embed: Embed) => {
		let count = 0
		if (embed.author?.name) count += embed.author.name.length
		if (embed.footer?.text) count += embed.footer.text.length
		embed.fields.forEach(field => {
			count += (field.name?.length || 0) + (field.value?.length || 0)
		})
		return count
	}

	const addEmbed = () => {
		if (embedData.embeds.length >= limits.MAX_EMBEDS) {
			toast.error('Cannot add more embeds', {
				description: 'Discord webhooks are limited to 10 embeds per message.',
			})
			return
		}
		setEmbedData(prev => ({
			...prev,
			embeds: [...prev.embeds, { ...defaultEmbed }],
		}))
	}

	const updateEmbed = (embedIndex: number, key: keyof Embed, value: any) => {
		const newEmbed = {
			...embedData.embeds[embedIndex],
			[key]: value,
		}

		if (key === 'author' && value.name?.length > limits.AUTHOR_NAME) {
			toast.error('Author name too long', {
				description: 'Author names are limited to 256 characters.',
			})
			return
		}
		if (key === 'footer' && value.text?.length > limits.FOOTER_TEXT) {
			toast.error('Footer text too long', {
				description: 'Footer text is limited to 2048 characters.',
			})
			return
		}

		const totalChars = calculateEmbedCharCount(newEmbed)
		if (totalChars > limits.TOTAL_EMBED_CHARS) {
			toast.error('Embed too large', {
				description: 'Total embed characters cannot exceed 6000.',
			})
			return
		}

		setEmbedData(prev => ({
			...prev,
			embeds: prev.embeds.map((embed, i) =>
				i === embedIndex ? { ...embed, [key]: value } : embed
			),
		}))
	}

	const removeEmbed = (index: number) => {
		setEmbedData(prev => ({
			...prev,
			embeds: prev.embeds.filter((_, i) => i !== index),
		}))
	}

	const updateMetadata = (
		key: keyof Omit<EmbedData, 'embeds'>,
		value: string
	) => {
		setEmbedData(prev => ({
			...prev,
			[key]: value,
		}))
	}

	return (
		<div className="min-h-screen flex flex-col">
			<div className="lg:hidden flex flex-col">
				<Tabs defaultValue="builder" className="flex-1 flex flex-col">
					<TabsList className="w-full h-auto rounded-none border-b border-border p-0 sticky top-0 z-10 bg-background">
						<TabsTrigger
							value="builder"
							className="flex-1 relative rounded-none py-3 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
						>
							Builder {isUpdating && '•'}
						</TabsTrigger>
						<TabsTrigger
							value="preview"
							className="flex-1 relative rounded-none py-3 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
						>
							Preview
						</TabsTrigger>
					</TabsList>
					<TabsContent value="builder">
						<BuilderCard
							webhookUrl={webhookUrl}
							setWebhookUrl={setWebhookUrl}
							messageId={messageId}
							setMessageId={setMessageId}
							embedData={embedData}
							updateMetadata={updateMetadata}
							addEmbed={addEmbed}
							updateEmbed={updateEmbed}
							removeEmbed={removeEmbed}
							calculateEmbedCharCount={calculateEmbedCharCount}
							isLoading={isLoading}
							isUpdating={isUpdating}
						/>
					</TabsContent>
					<TabsContent value="preview">
						<PreviewCard embedData={embedData} onLoadFromClipboard={setEmbedData} />
					</TabsContent>
				</Tabs>
			</div>
			<div className="hidden lg:flex w-full h-[calc(100vh-48px)]">
				<BuilderCard
					webhookUrl={webhookUrl}
					setWebhookUrl={setWebhookUrl}
					messageId={messageId}
					setMessageId={setMessageId}
					embedData={embedData}
					updateMetadata={updateMetadata}
					addEmbed={addEmbed}
					updateEmbed={updateEmbed}
					removeEmbed={removeEmbed}
					calculateEmbedCharCount={calculateEmbedCharCount}
					isLoading={isLoading}
					isUpdating={isUpdating}
				/>
				<PreviewCard embedData={embedData} onLoadFromClipboard={setEmbedData} />
			</div>
		</div>
	)
}

function BuilderCard({
	webhookUrl,
	setWebhookUrl,
	messageId,
	setMessageId,
	embedData,
	updateMetadata,
	addEmbed,
	updateEmbed,
	removeEmbed,
	calculateEmbedCharCount,
	isLoading,
	isUpdating,
}: {
	webhookUrl: string
	setWebhookUrl: (url: string) => void
	messageId: string
	setMessageId: (id: string) => void
	embedData: EmbedData
	updateMetadata: (key: keyof Omit<EmbedData, 'embeds'>, value: string) => void
	addEmbed: () => void
	updateEmbed: (index: number, key: keyof Embed, value: any) => void
	removeEmbed: (index: number) => void
	calculateEmbedCharCount: (embed: Embed) => number
	isLoading: boolean
	isUpdating: boolean
}) {
	return (
		<Card className="w-1/2 h-full order-2 lg:order-1 border-0 shadow-none rounded-none relative">
			{isLoading && (
				<div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
					<Loader2 className="animate-spin size-16 text-primary" />
				</div>
			)}
			{isUpdating && (
				<div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50">
					<div className="flex items-center gap-2 text-sm">
						<Loader2 className="animate-spin size-4 text-primary" /> Saving...
					</div>
				</div>
			)}
			<CardHeader className="pb-2">
				<CardTitle className="flex justify-between items-center">
					<p>Embed Builder</p>
					<Theme />
				</CardTitle>
			</CardHeader>
			<CardContent className="h-[calc(100%-2rem)]">
				<ScrollArea className="h-full px-2">
					<div className="space-y-6">
						<WebhookInput
							webhookUrl={webhookUrl}
							setWebhookUrl={setWebhookUrl}
							messageId={messageId}
							setMessageId={setMessageId}
							embedData={embedData}
						/>

						<BotSettings
							username={embedData.username}
							avatarUrl={embedData.avatar_url}
							onUsernameChange={value => updateMetadata('username', value)}
							onAvatarUrlChange={value => updateMetadata('avatar_url', value)}
						/>

						<MessageContent
							content={embedData.content}
							onChange={value => updateMetadata('content', value)}
						/>

						<Separator />

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-medium">Embeds</h3>
								<Button variant="outline" size="sm" onClick={addEmbed} className="h-7">
									Add Embed
								</Button>
							</div>
						</div>

						{embedData.embeds.map((embed, embedIndex) => (
							<EmbedEditor
								key={embedIndex}
								embed={embed}
								index={embedIndex}
								onUpdate={(key, value) => updateEmbed(embedIndex, key, value)}
								onRemove={() => removeEmbed(embedIndex)}
								calculateEmbedCharCount={calculateEmbedCharCount}
							/>
						))}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	)
}

function PreviewCard({
	embedData,
	onLoadFromClipboard,
}: {
	embedData: EmbedData
	onLoadFromClipboard: (data: EmbedData) => void
}) {
	return (
		<Card className="w-1/2 h-full order-1 lg:order-2 border-0 shadow-none rounded-none">
			<CardHeader>
				<CardTitle>Preview</CardTitle>
			</CardHeader>
			<CardContent className="h-[calc(100%-2rem)]">
				<ScrollArea className="h-full">
					<EmbedPreview
						embedData={embedData}
						onLoadFromClipboard={onLoadFromClipboard}
					/>
				</ScrollArea>
			</CardContent>
		</Card>
	)
}
