'use client'

import { format } from 'date-fns'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { Check, ClipboardCopy, RotateCcw, Upload } from 'lucide-react'
import Discord from '../ui/discord'
import { useState } from 'react'
import { toast } from 'sonner'

interface EmbedPreviewProps {
	embedData: EmbedData
	onLoadFromClipboard: (data: EmbedData) => void
}

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
			<div className="flex flex-col gap-2 px-4">
				<div className="flex gap-2">
					<Button variant="outline" className="w-1/3" onClick={copyToClipboard}>
						{isCopied ? (
							<Check className="mr-2 h-4 w-4" />
						) : (
							<ClipboardCopy className="mr-2 h-4 w-4" />
						)}
						Copy JSON
					</Button>
					<Button variant="outline" className="w-1/3" onClick={loadFromClipboard}>
						<Upload className="mr-2 h-4 w-4" />
						Load from Clipboard
					</Button>
					<Button variant="destructive" className="w-1/3" onClick={resetData}>
						<RotateCcw className="mr-2 h-4 w-4" />
						Reset
					</Button>
				</div>
				<div className="relative flex w-full items-center gap-2 rounded-md border border-input p-2 py-2.5 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring">
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
			</div>

			{showDiscordPreview ? (
				<div className="dark:bg-[#313338] bg-[#ffffff] rounded-md p-4 [overflow-wrap:anywhere]">
					<div className="flex gap-4">
						<div className="flex-shrink-0">
							<div className="size-10 mt-1 flex items-center justify-center">
								{embedData.avatar_url ? (
									<img src={`${embedData.avatar_url}`} alt={`${embedData.username}`} />
								) : (
									<div className="dark:bg-[#6263ed] bg-[#5865f2] rounded-full size-10 mt-1 flex items-center justify-center">
										<Discord className="filter invert brightness-0 size-[23px]" />
									</div>
								)}
							</div>
						</div>
						<div className="flex-grow">
							<div className="flex items-center gap-1 mb-1">
								<div className="font-medium">{embedData.username}</div>
								<div className="dark:bg-[#6263ed] bg-[#5865f2] ml-0.5 text-white rounded-sm px-[5px] font-semibold text-xs mt-0.5">
									APP
								</div>
								<div className="text-xs ml-1 mt-0.5 text-[#616366] dark:text-[#949b9d]">
									Today at {format(new Date(), 'HH:mm')}
								</div>
							</div>
							{embedData.content && (
								<div className="mb-2 text-sm">
									{embedData.content.split(/(<@&\d+>)/).map((part, i) => {
										const roleMatch = part.match(/^<@&(\d+)>$/)
										if (roleMatch) {
											return (
												<span
													key={i}
													className="text-[#535ec8] dark:text-[#c9cdfb] bg-[#e6e8fd] dark:bg-[#3c4270] rounded-sm py-0.5 px-1"
												>
													@role
												</span>
											)
										}
										return part
									})}
								</div>
							)}
							{embedData.embeds.map((embed, embedIndex) => (
								<div
									key={embedIndex}
									className="flex mt-1 rounded-sm overflow-hidden"
									style={{
										borderLeft: `4px solid #${embed.color.toString(16).padStart(6, '0')}`,
									}}
								>
									<div className="max-w-md bg-[#f2f3f5] dark:bg-[#2B2D31] p-3.5 pr-4">
										{embed.author && (
											<div className="flex items-center mb-2">
												{embed.author.icon_url && (
													<img
														src={embed.author.icon_url}
														alt="Epic Games Store"
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
											{embed.fields.map((field, i) => (
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
													className="w-full h-full object-cover rounded-md mt-4"
												/>
											)}
										</div>
										{(embed.footer?.text || embed.timestamp) && (
											<div className="text-xs font-light !mt-2">
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
				<div className="rounded-lg overflow-hidden border bg-card">
					<div className="bg-muted p-3 border-b">
						<pre className="text-xs break-all whitespace-pre-wrap">
							{JSON.stringify(embedData, null, 2)}
						</pre>
					</div>
				</div>
			)}
		</div>
	)
}
