'use client'

import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface BotSettingsProps {
	username: string
	avatarUrl: string
	onUsernameChange: (username: string) => void
	onAvatarUrlChange: (url: string) => void
}

export default function BotSettings({
	username,
	avatarUrl,
	onUsernameChange,
	onAvatarUrlChange,
}: BotSettingsProps) {
	return (
		<div className="space-y-2">
			<Label>Bot Settings</Label>
			<div className="grid gap-2">
				<Input
					placeholder="Bot Username"
					value={username}
					onChange={e => onUsernameChange(e.target.value)}
				/>
				<Input
					placeholder="Bot Avatar URL"
					value={avatarUrl}
					onChange={e => onAvatarUrlChange(e.target.value)}
				/>
			</div>
		</div>
	)
}
