'use client'

import { useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Clipboard, Save, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { encrypt } from '@/lib/encryption'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface WebhookInputProps {
	webhookUrl: string
	setWebhookUrl: (url: string) => void
	messageId: string
	setMessageId: (id: string) => void
	embedData: EmbedData
}

export default function WebhookInput({
	webhookUrl,
	setWebhookUrl,
	messageId,
	setMessageId,
	embedData,
}: WebhookInputProps) {
	const [isVisible, setIsVisible] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const handlePaste = async () => {
		try {
			const text = await navigator.clipboard.readText()
			setWebhookUrl(text)
		} catch {
			console.error('Failed to paste text')
		}
	}

	const saveWebhookUrl = async () => {
		try {
			if (!webhookUrl.trim()) {
				return
			}

			const encryptedWebhook = await encrypt(webhookUrl)
			localStorage.setItem('embedWebhook', encryptedWebhook)
			toast.success('Webhook saved locally')
		} catch (error) {
			console.error('Failed to save webhook:', error)
			toast.error('Failed to save webhook')
		}
	}

	const handleWebhook = async () => {
		if (!webhookUrl) {
			toast.error('Insert a webhook.')
			return
		}

		try {
			setIsLoading(true)
			const response = await fetch('/api/webhook', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ webhookUrl, jsonData: embedData }),
			})

			if (response.ok) {
				toast.success('Successfully sent data.')
			} else {
				const errorData = await response.json()
				throw new Error(errorData.message || 'Failed to send JSON Data.')
			}
		} catch (error) {
			console.error('Failed to send:', error)
			toast.error('Failed to send JSON Data.', {
				description: 'The webhook or data might be invalid.',
			})
		}
		setIsLoading(false)
	}

	const handleEditMessage = async () => {
		if (!webhookUrl) {
			toast.error('Insert a webhook URL.')
			return
		}
		if (!messageId) {
			toast.error('Insert a message ID.')
			return
		}
		try {
			setIsLoading(true)
			const response = await fetch('/api/edit', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ webhookUrl, messageId, jsonData: embedData }),
			})
			if (response.ok) {
				toast.success('Message edited successfully.')
			} else {
				const errorData = await response.json()
				throw new Error(errorData.message || 'Failed to edit message.')
			}
		} catch (error) {
			console.error('Failed to edit message:', error)
			toast.error('Failed to edit message.', {
				description: 'The message ID, webhook URL, or data might be invalid.',
			})
		}
		setIsLoading(false)
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label>Webhook URL</Label>
				<div className="flex items-center gap-2">
					<div className="flex-grow flex">
						<Input
							type={isVisible ? 'text' : 'password'}
							onFocus={() => setIsVisible(true)}
							onBlur={() => setIsVisible(false)}
							placeholder="https://"
							value={webhookUrl}
							onChange={e => setWebhookUrl(e.target.value)}
							className="rounded-r-none border-r-0"
						/>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									className="px-2 rounded-none border-l-0 border-r-0 disabled:opacity-100 disabled:text-muted-foreground"
									disabled={!webhookUrl.trim()}
								>
									<Save className="size-4" />
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Warning</AlertDialogTitle>
									<AlertDialogDescription className="space-y-2">
										<p>
											This will encrypt and save your webhook in your browsers local
											storage and will automatically be in the URL input.
										</p>
										<p className="font-medium">
											⚠️ This might not be secure. Consider manually pasting the webhook
											instead.
										</p>
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel className="w-full">Cancel</AlertDialogCancel>
									<AlertDialogAction
										className="dark:text-black w-full"
										onClick={saveWebhookUrl}
									>
										Save Anyway
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
						<Button
							variant="outline"
							size="icon"
							className="px-2 rounded-l-none border-l-0"
							onClick={handlePaste}
						>
							<Clipboard className="size-4" />
						</Button>
					</div>
				</div>
				<div className="space-y-2">
					<Label>Message ID (Optional)</Label>
					<Input value={messageId} onChange={e => setMessageId(e.target.value)} />
				</div>
				<Button
					onClick={messageId ? handleEditMessage : handleWebhook}
					className="w-full dark:text-black"
					size="sm"
					disabled={isLoading}
				>
					{isLoading ? (
						<Loader2 className="size-4 mr-2 animate-spin" />
					) : (
						<Send className="size-4 mr-2" />
					)}
					{messageId ? 'Edit Message' : 'Send'}
				</Button>
			</div>
		</div>
	)
}
