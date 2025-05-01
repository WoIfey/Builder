import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'

export default function BuilderPage() {
	return (
		<div className="min-h-dvh w-full flex items-center justify-center">
			<div className="flex sm:flex-row flex-col items-center justify-center py-12 lg:gap-12 gap-4">
				<Card className="w-full max-w-md p-6">
					<div className="text-center">
						<Image
							src="https://wolfey.s-ul.eu/Md4nVRhf"
							width={500}
							height={200}
							alt="v2 Builder"
							className="w-full h-48 md:h-64 object-cover rounded-lg mb-6"
						/>
						<h1 className="text-2xl font-bold mb-4">Message Components (WIP)</h1>
						<p className="text-muted-foreground">Latest version of Discord embeds.</p>
					</div>

					<div className="grid gap-4">
						<Button size="lg" disabled className="w-full dark:text-black">
							<Link href="/v2" className="w-full">
								Latest
							</Link>
						</Button>
					</div>
				</Card>
				<Card className="w-full max-w-2xl p-6">
					<div className="text-center">
						<img
							src="https://wolfey.s-ul.eu/Md4nVRhf"
							width={500}
							height={200}
							alt="v1 Builder"
							className="w-full h-48 md:h-64 object-cover rounded-lg mb-6"
						/>
						<h1 className="text-2xl font-bold mb-4">Embeds</h1>
						<p className="text-muted-foreground">Older version of Discord embeds.</p>
					</div>

					<div className="grid gap-4">
						<Button variant="outline" size="lg" className="w-full" asChild>
							<Link href="/v1" className="w-full">
								Older
							</Link>
						</Button>
					</div>
				</Card>
			</div>
		</div>
	)
}
