'use client'

import { format } from 'date-fns'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { Check, ClipboardCopy, RotateCcw, Upload } from 'lucide-react'
import Discord from '../ui/discord'
import { useState } from 'react'
import { toast } from 'sonner'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select'
import { presets, PresetOption } from './Presets'

export default function EmbedPreview({
	embedData,
	onLoadFromClipboard,
}: EmbedPreviewProps) {
	const [isCopied, setIsCopied] = useState(false)
	const [showDiscordPreview, setShowDiscordPreview] = useState(true)

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(JSON.stringify(embedData, null, 2))
			setIsCopied(true)
			setTimeout(() => setIsCopied(false), 1000)
			toast.success('Copied to clipboard')
		} catch (err) {
			console.error('Failed to copy:', err)
			toast.error('Failed to copy to clipboard')
		}
	}

	const loadFromClipboard = async () => {
		try {
			const text = await navigator.clipboard.readText()
			const parsed = JSON.parse(text)
			onLoadFromClipboard(parsed)
			toast.success('Loaded from clipboard')
		} catch (err) {
			console.error('Failed to load:', err)
			toast.error('Invalid embed data in clipboard')
		}
	}

	const resetData = async () => {
		try {
			const url = new URL(window.location.href)
			url.searchParams.delete('data')
			window.history.replaceState({}, '', url)
			window.location.reload()
		} catch (err) {
			console.error('Failed to reset:', err)
			toast.error('Failed to reset embed data')
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4">
				<div className="grid grid-cols-1 2xl:grid-cols-3 gap-4">
					<div className="space-y-2">
						<Label>Presets</Label>
						<Select
							onValueChange={value =>
								onLoadFromClipboard(presets[value as PresetOption])
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Load preset" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="default">Default</SelectItem>
								<SelectItem value="epicgames">Epic Games Store</SelectItem>
								<SelectItem value="steam">Steam</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>Actions</Label>
						<div className="flex gap-2">
							<Button variant="outline" className="flex-1" onClick={copyToClipboard}>
								{isCopied ? (
									<Check className="size-4" />
								) : (
									<ClipboardCopy className="size-4" />
								)}
								Copy
							</Button>
							<Button variant="outline" className="flex-1" onClick={loadFromClipboard}>
								<Upload className="size-4" />
								Load
							</Button>
							<Button variant="destructive" size="icon" onClick={resetData}>
								<RotateCcw className="size-4" />
							</Button>
						</div>
					</div>

					<div className="space-y-2">
						<Label>Preview Options</Label>
						<Button asChild className="relative w-full" variant="outline">
							<div>
								<Checkbox
									id="discord-preview"
									checked={showDiscordPreview}
									onCheckedChange={checked => {
										setShowDiscordPreview(checked as boolean)
									}}
									className="order-1 after:absolute after:inset-0"
								/>
								<div className="flex grow items-center gap-2">
									<Discord />
									<Label htmlFor="discord-preview">Discord Preview</Label>
								</div>
							</div>
						</Button>
					</div>
				</div>

				{showDiscordPreview ? (
					<div className="dark:bg-[#1a1a1e] bg-[#fbfbfb] rounded-md p-4 [overflow-wrap:anywhere] w-full">
						<div className="flex flex-col md:flex-row gap-4">
							<div className="flex-shrink-0">
								<div className="size-10 mt-1 flex items-center justify-center">
									{embedData.avatar_url ? (
										<img src={`${embedData.avatar_url}`} alt={`${embedData.username}`} />
									) : (
										<div className="bg-[#5865f2] rounded-full size-10 mt-1 flex items-center justify-center">
											<Discord className="filter invert brightness-0 size-[23px]" />
										</div>
									)}
								</div>
							</div>
							<div className="flex-grow min-w-0">
								<div className="flex items-center gap-1 mb-1">
									<div className="font-medium">
										{embedData.username || 'Captain Hook'}
									</div>
									<div className="bg-[#6263ed] ml-0.5 mt-0.5 text-white rounded-[3px] px-[6px] font-semibold text-xs">
										APP
									</div>
									<div className="text-xs ml-1 mt-0.5 text-[#616366] dark:text-[#949b9d]">
										{format(new Date(), 'HH:mm')}
									</div>
								</div>
								{embedData.content && (
									<div className="mb-1 text-sm">
										{embedData.content
											.split(/(<@&\d+>)/)
											.map((part: string, i: number) => {
												const roleMatch = part.match(/^<@&(\d+)>$/)
												if (roleMatch) {
													return (
														<span
															key={i}
															className="text-[#484f95] dark:text-[#a5b2f3] bg-[#d6d7f8] dark:bg-[#2b2c50] rounded-sm py-0.5 px-1"
														>
															@role
														</span>
													)
												}
												return part
											})}
									</div>
								)}
								{embedData.embeds.map((embed: Embed, embedIndex: number) => (
									<div
										key={embedIndex}
										className="flex rounded-l-[4px] overflow-hidden"
										style={{
											borderLeft: `4px solid #${embed.color
												.toString(16)
												.padStart(6, '0')}`,
										}}
									>
										<div className="max-w-md rounded-r-sm bg-[#ffffff] dark:bg-[#242429] pb-3.5 pl-3.5 pt-3 pr-4 border border-l-0">
											{embed.author && (
												<div className="flex items-center mb-2">
													{embed.author.icon_url && (
														<img
															src={embed.author.icon_url}
															alt="Author Icon"
															className="size-7 rounded-full mr-2.5"
														/>
													)}
													{embed.author.url ? (
														<a
															href={embed.author.url}
															target="_blank"
															rel="noopener noreferrer"
															className="hover:underline text-sm font-medium cursor-pointer"
														>
															{embed.author.name}
														</a>
													) : (
														<p className="text-sm font-medium">{embed.author.name}</p>
													)}
												</div>
											)}
											<div className="flex flex-col text-sm gap-0.5">
												{embed.fields.map((field: Field, i: number) => (
													<div
														key={i}
														className={`${field.inline ? 'inline-block mr-4' : ''}`}
													>
														{field.name && <h1 className="font-semibold">{field.name}</h1>}
														{field.value && (
															<div
																dangerouslySetInnerHTML={{
																	__html: field.value
																		.replace(/\n/g, '<br/>')
																		.replace(
																			/\[([^\]]+)\]\(([^)]+)\)/g,
																			'<a href="$2" class="text-[#4e80eb] dark:text-[#00A8FC] hover:underline">$1</a>'
																		)
																		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
																		.replace(/~~(.*?)~~/g, '<del>$1</del>'),
																}}
															/>
														)}
													</div>
												))}
												{embed.image?.url && (
													<img
														src={embed.image.url}
														alt="Embed Image"
														className="w-full h-full object-cover rounded-sm mt-4"
													/>
												)}
											</div>
											{(embed.footer?.text || embed.timestamp) && (
												<div className="text-xs font-semibold !mt-1.5 mb-1.5">
													{embed.footer?.text}{' '}
													{embed.timestamp && (
														<>• {format(new Date(embed.timestamp), 'dd/MM/yyyy')}</>
													)}
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				) : (
					<div className="rounded-lg overflow-hidden border bg-card w-full">
						<div className="bg-muted p-3 border-b">
							<pre className="text-xs break-all whitespace-pre-wrap">
								{JSON.stringify(embedData, null, 2)}
							</pre>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
