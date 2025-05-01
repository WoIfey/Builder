'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { HexColorPicker } from 'react-colorful'
import { Undo2 } from 'lucide-react'

interface ColorPickerProps {
	color: number
	onChange: (color: number) => void
	defaultColor?: string
}

export default function ColorPicker({
	color,
	onChange,
	defaultColor = '#85ce4b',
}: ColorPickerProps) {
	const hexColor = `#${color.toString(16).padStart(6, '0')}`

	const handleColorChange = (newColor: string) => {
		onChange(parseInt(newColor.replace('#', ''), 16))
	}

	return (
		<div className="space-y-2">
			<Label>Color</Label>
			<div className="flex items-center gap-2">
				<Popover>
					<PopoverTrigger asChild>
						<Button
							className="size-10"
							style={{
								backgroundColor: hexColor,
							}}
						/>
					</PopoverTrigger>
					<PopoverContent className="w-full p-3" align="start">
						<HexColorPicker
							color={hexColor}
							onChange={handleColorChange}
							className="!w-full mb-2"
						/>
						<Button
							onClick={() => handleColorChange(defaultColor)}
							variant="outline"
							size="sm"
							className="w-full px-8"
						>
							<Undo2 className="size-4 mr-2" />
							Reset to Default
						</Button>
					</PopoverContent>
				</Popover>
				<Input
					value={hexColor}
					onChange={e => handleColorChange(e.target.value)}
					maxLength={7}
					className="font-mono"
				/>
			</div>
		</div>
	)
}
