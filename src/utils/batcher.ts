export class Batcher<T> {
	private timeout: NodeJS.Timer|null = null
	private readonly queue: T[] = []

	constructor(
		private readonly work: (data: T[]) => void,
		private readonly delay: number = 0
	) {}

	public emit(data: T) {
		this.queue.push(data)

		if(this.timeout === null) {
			this.timeout = setTimeout(this.batch, this.delay)
		}
	}

	public clear(): void {
		if(this.timeout != null) {
			clearTimeout(this.timeout)
		}

		this.drain()
	}

	private drain(): T[] {
		return this.queue.splice(0)
	}

	private readonly batch = () => {
		this.timeout = null

		if(this.queue.length > 0) {
			this.work(this.drain())
		}
	}
}
