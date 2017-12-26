import {CompileRequest, CompileResult, Request, Response} from '../../interfaces'
import {HandlerMethod, Server, setSocketPath, Worker} from '../../ipc'

export class TypeScriptWorker extends Worker<Request, Response> {
	constructor() {
		// We append the socket path to process.env beforce spawning the worker
		setSocketPath('typescript')

		super(require.resolve('./launcher'))
	}

	@HandlerMethod
	public compile(data: CompileRequest): Promise<CompileResult> {
		return this.request('compile', data)
	}

	@HandlerMethod
	public typeCheck(data: CompileRequest): Promise<void> {
		return this.request('typeCheck', data)
	}
}

export class TypeScriptServer extends Server<Request, Response> {
	private readonly worker: TypeScriptWorker

	constructor() {
		const worker = new TypeScriptWorker()

		super('typescript', worker)

		this.worker = worker
	}

	public close() {
		this.worker.kill()

		super.close()
	}
}
