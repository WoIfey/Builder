'use client'

import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

export default function MessageContent({
	content,
	onChange,
}: MessageContentProps) {
	return (
		<div className="space-y-2">
			<Label>Message Content</Label>
			<Textarea
				value={content}
				onChange={e => onChange(e.target.value)}
				placeholder="Content above the embed"
				className="break-all"
				maxLength={2000}
			/>
			<div className="flex justify-end text-xs text-muted-foreground">
				{content.length}/2000
			</div>
		</div>
	)
}
