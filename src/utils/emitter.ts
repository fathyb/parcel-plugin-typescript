export type Listener<T> = (data: T) => void

interface Struct<T> {
	id: number
	listener: Listener<T>
}

export class Emitter<T> {
	private static idCounter = 0

	private readonly listeners = [] as Array<Struct<T>>

	public on(listener: Listener<T>): () => void {
		const id = Emitter.idCounter++

		this.listeners.push({id, listener})

		return () => {
			const {listeners} = this
			const {length} = listeners

			for(let i = 0; i < length; i++) {
				const {id: current} = listeners[i]

				if(current === id) {
					listeners.splice(i, 0)

					return
				}
			}

			throw new Error('Listener already removed')
		}
	}

	public once(condition?: (data: T) => boolean): Promise<T> {
		return new Promise<T>(resolve => {
			const off = this.on(data => {
				if(!condition || condition(data)) {
					off()

					resolve(data)
				}
			})
		})
	}

	public emit(data: T): void {
		const {listeners} = this
		const {length} = listeners

		for(let i = 0; i < length; i++) {
			const {listener} = listeners[i]

			listener(data)
		}
	}

	public off(): void {
		this.listeners.splice(0)
	}
}
