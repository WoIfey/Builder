'use client'

import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Trash2 } from 'lucide-react'
import { Separator } from '../ui/separator'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '../ui/accordion'
import ColorPicker from './ColorPicker'
import TimestampPicker from './TimestampPicker'
import EmbedFields from './EmbedFields'
import { toast } from 'sonner'
import limits from '@/lib/limits'

export default function EmbedEditor({
	embed,
	index,
	onUpdate,
	onRemove,
	calculateEmbedCharCount,
}: EmbedEditorProps) {
	const addField = () => {
		if (embed.fields.length >= limits.EMBED_FIELDS) {
			toast.error('Cannot add more fields', {
				description: 'Discord embeds are limited to 25 fields.',
			})
			return
		}
		onUpdate('fields', [...embed.fields, { name: '', value: '', inline: true }])
	}

	const updateField = (fieldIndex: number, field: Partial<Field>) => {
		const newFields = embed.fields.map((f, i) =>
			i === fieldIndex ? { ...f, ...field } : f
		)
		onUpdate('fields', newFields)
	}

	const removeField = (fieldIndex: number) => {
		onUpdate(
			'fields',
			embed.fields.filter((_, i) => i !== fieldIndex)
		)
	}

	return (
		<Accordion
			type="single"
			defaultValue={index === 0 ? `embed-${index}` : undefined}
			collapsible={true}
		>
			<AccordionItem value={`embed-${index}`}>
				<AccordionTrigger className="py-2">
					<div className="flex items-center gap-2">
						<div>Embed {index + 1}</div>
					</div>
				</AccordionTrigger>
				<AccordionContent>
					<div className="space-y-6 border-l-2 pl-4 mt-4">
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={e => {
								e.stopPropagation()
								onRemove()
							}}
						>
							<Trash2 className="h-4 w-4" />
						</Button>

						<div className="space-y-2">
							<Label>Author</Label>
							<div className="grid gap-2">
								<Input
									placeholder="Name"
									value={embed.author?.name ?? ''}
									onChange={e =>
										onUpdate('author', {
											...embed.author,
											name: e.target.value,
										})
									}
								/>
								<div className="flex justify-end text-xs text-muted-foreground">
									{embed.author?.name?.length || 0}/{limits.AUTHOR_NAME}
								</div>
								<Input
									placeholder="URL"
									value={embed.author?.url ?? ''}
									onChange={e =>
										onUpdate('author', {
											...embed.author,
											url: e.target.value,
										})
									}
								/>
								<Input
									placeholder="Icon URL"
									value={embed.author?.icon_url ?? ''}
									onChange={e =>
										onUpdate('author', {
											...embed.author,
											icon_url: e.target.value,
										})
									}
								/>
							</div>
						</div>

						<Separator />

						<EmbedFields
							fields={embed.fields}
							onAddField={addField}
							onUpdateField={updateField}
							onRemoveField={removeField}
						/>

						<Separator />

						<div className="space-y-2">
							<Label>Image</Label>
							<Input
								placeholder="Image URL"
								value={embed.image?.url || ''}
								onChange={e => onUpdate('image', { url: e.target.value })}
							/>
						</div>

						<div className="space-y-2">
							<Label>Footer</Label>
							<div className="grid gap-2">
								<Input
									placeholder="Footer text"
									value={embed.footer?.text ?? ''}
									onChange={e =>
										onUpdate('footer', {
											text: e.target.value,
										})
									}
								/>
								<div className="flex justify-end text-xs text-muted-foreground">
									{embed.footer?.text?.length || 0}/{limits.FOOTER_TEXT}
								</div>
							</div>
						</div>

						<ColorPicker
							color={embed.color}
							onChange={color => onUpdate('color', color)}
						/>

						<TimestampPicker
							timestamp={embed.timestamp}
							onChange={timestamp => onUpdate('timestamp', timestamp)}
						/>

						<div className="mt-4 flex justify-end text-xs text-muted-foreground">
							Total characters: {calculateEmbedCharCount(embed)}/
							{limits.TOTAL_EMBED_CHARS}
						</div>
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	)
}
