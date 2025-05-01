'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Switch } from '../ui/switch'
import { Trash2 } from 'lucide-react'
import limits from '@/lib/limits'

interface EmbedFieldsProps {
	fields: Field[]
	onAddField: () => void
	onUpdateField: (index: number, field: Partial<Field>) => void
	onRemoveField: (index: number) => void
}

export default function EmbedFields({
	fields,
	onAddField,
	onUpdateField,
	onRemoveField,
}: EmbedFieldsProps) {
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<Label>Fields</Label>
				<Button variant="outline" size="sm" onClick={onAddField} className="h-7">
					Add Field
				</Button>
			</div>
			<div className="space-y-4">
				{fields.map((field, fieldIndex) => (
					<div key={fieldIndex} className="space-y-2">
						<div className="flex items-center gap-2">
							<Label className="text-xs text-muted-foreground">
								Field {fieldIndex + 1}
							</Label>
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6"
								onClick={() => onRemoveField(fieldIndex)}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
						<div className="grid gap-2">
							<Input
								placeholder="Name"
								value={field.name}
								onChange={e =>
									onUpdateField(fieldIndex, {
										name: e.target.value,
									})
								}
							/>
							<Textarea
								placeholder="Value"
								value={field.value}
								onChange={e =>
									onUpdateField(fieldIndex, {
										value: e.target.value,
									})
								}
							/>
							<div className="flex justify-end text-xs text-muted-foreground">
								{field.value?.length || 0}/{limits.FIELD_VALUE}
							</div>
							<div className="flex items-center space-x-2">
								<Switch
									id={`field-${fieldIndex}-inline`}
									checked={field.inline}
									onCheckedChange={checked =>
										onUpdateField(fieldIndex, {
											inline: checked,
										})
									}
								/>
								<Label htmlFor={`field-${fieldIndex}-inline`}>Inline</Label>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
