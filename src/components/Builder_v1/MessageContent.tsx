'use client'

import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

interface MessageContentProps {
	content: string
	onChange: (content: string) => void
}

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
			/>
		</div>
	)
}
