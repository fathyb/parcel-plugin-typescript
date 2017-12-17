import {ConfigurationLoader} from '../../backend/config-loader'
import {reportDiagnostics} from '../../backend/reporter'
import {LanguageService} from '../../backend/service'
import {TypeCheckResult} from '../../interfaces'

let serviceConfig: ConfigurationLoader<LanguageService>|null = null

export async function typeCheck(...files: string[]): Promise<TypeCheckResult[]> {
	if(files.length === 0) {
		return []
	}

	if(serviceConfig === null) {
		serviceConfig = new ConfigurationLoader(files[0], config => new LanguageService(config))
	}

	const service = await serviceConfig.wait()

	return files.map(file => {
		const result = service.parse(file)

		reportDiagnostics([...result.semanticDiagnostics, ...result.syntacticDiagnostics])

		return result
	})
}
