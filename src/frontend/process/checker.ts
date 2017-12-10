import {ConfigurationLoader} from '../../backend/config-loader'
import {reportDiagnostics} from '../../backend/reporter'
import {LanguageService} from '../../backend/service'

let serviceConfig: ConfigurationLoader<LanguageService>|null = null

export async function typeCheck(...files: string[]) {
	if(files.length === 0) {
		return
	}

	if(serviceConfig === null) {
		serviceConfig = new ConfigurationLoader(files[0], config => new LanguageService(config))
	}

	const service = await serviceConfig.wait()

	files.forEach(file =>
		reportDiagnostics(service.parse(file))
	)
}
