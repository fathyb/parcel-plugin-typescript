export type Keys<T, U> = (keyof T) & (keyof U)

export type Handler<RQ, RS> = {
	[P in Keys<RQ, RS>]: (data: RQ[P]) => Promise<RS[P]>
}

const properties = new WeakMap<any, string[]>()

export function HandlerMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
	const props = properties.get(target)

	if(!props) {
		properties.set(target, [propertyKey])
	}
	else {
		props.push(propertyKey)
	}

	return descriptor
}

export function getHandlerMethods<T extends {}>(handler: T): Array<keyof T> {
	const ctor = handler.constructor
	const prototype = ctor && ctor.prototype
	const props = (prototype && properties.get(prototype)) || Object.keys(handler)

	return props as Array<keyof T>
}
