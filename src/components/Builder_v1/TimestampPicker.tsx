'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { format, setHours, setMinutes } from 'date-fns'

interface TimestampPickerProps {
	timestamp?: string
	onChange: (timestamp: string) => void
}

export default function TimestampPicker({
	timestamp,
	onChange,
}: TimestampPickerProps) {
	const handleTimeChange = (hours: number, minutes: number) => {
		const currentDate = timestamp ? new Date(timestamp) : new Date()
		const newDate = setMinutes(setHours(currentDate, hours), minutes)
		onChange(newDate.toISOString())
	}

	return (
		<div className="space-y-2">
			<Label>Timestamp</Label>
			<div className="grid gap-2">
				<div className="flex gap-2">
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className="w-full justify-start text-left font-normal"
							>
								{timestamp ? (
									format(new Date(timestamp), 'PPP')
								) : (
									<span>Pick a date</span>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<Calendar
								mode="single"
								selected={timestamp ? new Date(timestamp) : undefined}
								onSelect={date => date && onChange(date.toISOString())}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
					<div className="flex gap-2 items-center">
						<Input
							type="number"
							min={0}
							max={23}
							className="w-16"
							placeholder="HH"
							value={timestamp ? format(new Date(timestamp), 'HH') : '00'}
							onChange={e => {
								const hours = Math.max(0, Math.min(23, parseInt(e.target.value) || 0))
								handleTimeChange(
									hours,
									timestamp ? new Date(timestamp).getMinutes() : 0
								)
							}}
						/>
						<span>:</span>
						<Input
							type="number"
							min={0}
							max={59}
							className="w-16"
							placeholder="mm"
							value={timestamp ? format(new Date(timestamp), 'mm') : '00'}
							onChange={e => {
								const minutes = Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
								handleTimeChange(
									timestamp ? new Date(timestamp).getHours() : 0,
									minutes
								)
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
