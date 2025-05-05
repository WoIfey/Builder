import Builder from '@/components/Builder'
import { Suspense } from 'react'

export default function BuilderPage() {
	return (
		<Suspense>
			<Builder />
		</Suspense>
	)
}
