'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { format, setHours, setMinutes } from 'date-fns'
import { X } from 'lucide-react'

export default function TimestampPicker({
	timestamp,
	onChange,
}: TimestampPickerProps) {
	const handleTimeChange = (hours: number, minutes: number) => {
		const currentDate = timestamp ? new Date(timestamp) : new Date()
		const newDate = setMinutes(setHours(currentDate, hours), minutes)
		onChange(newDate.toISOString())
	}

	const handleClear = () => {
		onChange('')
	}

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<Label>Timestamp</Label>
				{timestamp && (
					<Button
						variant="ghost"
						size="sm"
						className="h-6 w-6 p-0"
						onClick={handleClear}
					>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>
			<div className="flex gap-2">
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline" className="justify-start text-left font-normal">
							{timestamp ? (
								format(new Date(timestamp), 'PPP')
							) : (
								<span className="text-muted-foreground">Pick a date</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="single"
							selected={timestamp ? new Date(timestamp) : undefined}
							onSelect={date => date && onChange(date.toISOString())}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
				<div className="flex items-center space-x-2 rounded-md">
					<Input
						type="number"
						min={0}
						max={23}
						className="w-12 border-0 p-0 text-center"
						placeholder="00"
						value={timestamp ? format(new Date(timestamp), 'HH') : ''}
						onChange={e => {
							const hours = Math.max(0, Math.min(23, parseInt(e.target.value) || 0))
							handleTimeChange(hours, timestamp ? new Date(timestamp).getMinutes() : 0)
						}}
					/>
					<span className="text-sm text-muted-foreground">:</span>
					<Input
						type="number"
						min={0}
						max={59}
						className="w-12 border-0 p-0 text-center"
						placeholder="00"
						value={timestamp ? format(new Date(timestamp), 'mm') : ''}
						onChange={e => {
							const minutes = Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
							handleTimeChange(timestamp ? new Date(timestamp).getHours() : 0, minutes)
						}}
					/>
				</div>
			</div>
		</div>
	)
}
