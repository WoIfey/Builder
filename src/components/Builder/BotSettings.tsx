'use client'

import { Input } from '../ui/input'
import { Label } from '../ui/label'

export default function BotSettings({
	username,
	avatarUrl,
	onUsernameChange,
	onAvatarUrlChange,
}: BotSettingsProps) {
	return (
		<div className="space-y-2">
			<Label>Webhook Settings</Label>
			<div className="flex gap-2">
				<Input
					placeholder="Webhook Username"
					value={username}
					onChange={e => onUsernameChange(e.target.value)}
					maxLength={32}
				/>
				<Input
					placeholder="Webhook Avatar URL"
					value={avatarUrl}
					onChange={e => onAvatarUrlChange(e.target.value)}
				/>
			</div>
		</div>
	)
}
