'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Theme from '@/components/ui/Theme'
import { decrypt } from '@/lib/encryption'
import WebhookInput from '@/components/Builder/WebhookInput'
import BotSettings from '@/components/Builder/BotSettings'
import MessageContent from '@/components/Builder/MessageContent'
import EmbedEditor from '@/components/Builder/EmbedEditor'
import EmbedPreview from '@/components/Builder/EmbedPreview'
import { toast } from 'sonner'
import limits from '@/lib/limits'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { presets } from '@/components/Builder/Presets'

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

const debounce = <T extends (...args: any[]) => Promise<void> | void>(
	func: T,
	wait: number
): T & { cancel: () => void } => {
	let timeout: NodeJS.Timeout | null = null

	const debounced = ((...args: Parameters<T>) => {
		if (timeout) clearTimeout(timeout)
		timeout = setTimeout(() => func(...args), wait)
	}) as T & { cancel: () => void }

	debounced.cancel = () => {
		if (timeout) {
			clearTimeout(timeout)
			timeout = null
		}
	}

	return debounced
}

const defaultEmbedStructure: Embed = {
	color: 0,
	fields: [],
	author: { name: '' },
	footer: { text: '' },
}

const defaultEmbedData: EmbedData = {
	...presets.default,
	embeds: [],
}

export default function Builder() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [isLoading, setIsLoading] = useState(true)
	const [isUpdating, setIsUpdating] = useState(false)
	const [embedData, setEmbedData] = useState<EmbedData>(() => {
		const dataParam = searchParams.get('data')
		if (dataParam) {
			const decoded = decodeEmbedData(dataParam)
			if (decoded && decoded.embeds && decoded.embeds.length > 0) return decoded
		}
		return defaultEmbedData
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
		if (embed.fields) {
			embed.fields.forEach(field => {
				count += (field.name?.length || 0) + (field.value?.length || 0)
			})
		}
		return count
	}

	const addEmbed = () => {
		if (embedData.embeds.length >= limits.MAX_EMBEDS) {
			toast.error('Cannot add more embeds', {
				description: 'Discord webhooks are limited to 10 embeds per message.',
			})
			return
		}

		const newEmbed = { ...defaultEmbedStructure }

		if (embedData.embeds[0]) {
			const existingEmbed = embedData.embeds[0]
			const presetType = Object.entries(presets).find(
				([_, preset]) =>
					preset.username === embedData.username &&
					preset.avatar_url === embedData.avatar_url &&
					preset.embeds[0]?.author?.icon_url === existingEmbed.author?.icon_url
			)

			if (presetType) {
				const [_, preset] = presetType
				if (preset.embeds[0]) {
					Object.assign(newEmbed, { ...preset.embeds[0] })
					if (newEmbed.timestamp) {
						const now = new Date()
						now.setHours(preset === presets.epicgames ? 18 : 0, 0, 0, 0)
						newEmbed.timestamp = now.toISOString()
					}
				}
			}
		}

		setEmbedData(prev => ({
			...prev,
			embeds: [...prev.embeds, newEmbed],
		}))
	}

	const updateEmbed = <K extends keyof Embed>(
		embedIndex: number,
		key: K,
		value: Embed[K]
	) => {
		const newEmbed = {
			...embedData.embeds[embedIndex],
			[key]: value,
		}
		if (
			key === 'author' &&
			typeof value === 'object' &&
			value &&
			'name' in value &&
			typeof value.name === 'string' &&
			value.name.length > limits.AUTHOR_NAME
		) {
			toast.error('Author name too long', {
				description: 'Author names are limited to 256 characters.',
			})
			return
		}
		if (
			key === 'footer' &&
			typeof value === 'object' &&
			value &&
			'text' in value &&
			typeof value.text === 'string' &&
			value.text.length > limits.FOOTER_TEXT
		) {
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
			<div className="lg:hidden flex flex-col h-[100dvh]">
				<Tabs defaultValue="builder" className="flex-1 gap-0 flex flex-col">
					<TabsList className="w-full h-auto rounded-none border-b border-border p-0 sticky top-0 z-10 bg-background">
						<TabsTrigger
							value="builder"
							className="flex-1 relative rounded-none py-3 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
						>
							Builder
						</TabsTrigger>
						<TabsTrigger
							value="preview"
							className="flex-1 relative rounded-none py-3 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
						>
							Preview
						</TabsTrigger>
					</TabsList>
					<TabsContent value="builder" className="flex-1 h-[calc(100dvh-3rem)]">
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
					<TabsContent value="preview" className="flex-1 h-[calc(100dvh-3rem)]">
						<PreviewCard embedData={embedData} onLoadFromClipboard={setEmbedData} />
					</TabsContent>
				</Tabs>
			</div>

			<div className="hidden lg:flex w-full h-[100vh]">
				<Card className="py-4 gap-2 flex-1 h-full order-2 lg:order-1 border-0 shadow-none rounded-none relative flex flex-col">
					{isLoading && (
						<div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
							<Loader2 className="animate-spin size-16 text-primary" />
						</div>
					)}
					<CardHeader>
						<CardTitle className="flex justify-between items-center">
							<p className="text-xl pl-2">Builder</p>
							<div className="flex items-center gap-2">
								{isUpdating && (
									<div className="flex items-center justify-center gap-2 text-sm">
										<Loader2 className="animate-spin size-4 text-primary" /> Saving...
									</div>
								)}
								<Theme />
							</div>
						</CardTitle>
					</CardHeader>
					<CardContent className="flex-1 overflow-hidden">
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
										<Button
											variant="outline"
											size="sm"
											onClick={addEmbed}
											className="h-7"
										>
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
				<Card className="py-0 pt-6 gap-3 flex-1 h-full order-1 lg:order-2 border-0 shadow-none rounded-none flex flex-col">
					<CardHeader className="shrink-0">
						<CardTitle className="text-xl">Preview</CardTitle>
					</CardHeader>
					<CardContent className="flex-1 overflow-hidden">
						<ScrollArea className="h-full">
							<EmbedPreview embedData={embedData} onLoadFromClipboard={setEmbedData} />
						</ScrollArea>
					</CardContent>
				</Card>
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
	updateEmbed: <K extends keyof Embed>(
		index: number,
		key: K,
		value: Embed[K]
	) => void
	removeEmbed: (index: number) => void
	calculateEmbedCharCount: (embed: Embed) => number
	isLoading: boolean
	isUpdating: boolean
}) {
	return (
		<Card className="py-4 gap-2 flex-1 h-full order-2 lg:order-1 border-0 shadow-none rounded-none relative flex flex-col">
			{isLoading && (
				<div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
					<Loader2 className="animate-spin size-16 text-primary" />
				</div>
			)}
			<CardHeader>
				<CardTitle className="flex justify-between items-center">
					<p className="text-xl">Builder</p>
					<div className="flex items-center gap-2">
						{isUpdating && (
							<div className="flex items-center justify-center gap-2 text-sm">
								<Loader2 className="animate-spin size-4 text-primary" /> Saving...
							</div>
						)}
						<Theme />
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent className="flex-1 overflow-hidden px-4">
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
		<Card className="gap-0 pt-0 pb-0 h-full order-1 lg:order-2 border-0 shadow-none rounded-none flex flex-col">
			<CardContent className="overflow-hidden px-0">
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
