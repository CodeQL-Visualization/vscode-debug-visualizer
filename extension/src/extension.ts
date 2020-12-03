import { window, ExtensionContext, commands, extensions } from "vscode";
import { Disposable } from "@hediet/std/disposable";
import {
	enableHotReload,
	hotRequireExportedFn,
	registerUpdateReconciler,
	getReloadCount,
} from "@hediet/node-reload";

if (process.env.HOT_RELOAD) {
	enableHotReload({ entryModule: module, loggingEnabled: true });
}
registerUpdateReconciler(module);

import { InternalWebviewManager } from "./webview/InternalWebviewManager";
import { WebviewServer } from "./webview/WebviewServer";
import { Config } from "./Config";
import { VsCodeDebugger } from "./debugger/VsCodeDebugger";
import { VsCodeDebuggerView } from "./debugger/VsCodeDebuggerView";
import { CodeQLWatchService } from "./EvaluationWatchService";
import { TaintVisNode } from "./vis-helpers";
import {
	ComposedEvaluationEngine,
	JsEvaluationEngine,
	GenericEvaluationEngine,
	ConfiguredEvaluationEngine,
} from "./EvaluationWatchService/EvaluationEngine";
let fs = require('fs');

export class CodeQLVisExtension {
	public readonly dispose = Disposable.fn();

	private readonly config = new Config();

	public readonly dataSource = new CodeQLWatchService();

	private readonly server = new WebviewServer(this.dataSource, this.config);
	private readonly views = this.dispose.track(
		new InternalWebviewManager(this.server, this.config)
	);

	public produceVis(path: string) {
		if (getReloadCount(module) > 0) {
			const i = this.dispose.track(window.createStatusBarItem());
			i.text = "reload" + getReloadCount(module);
			i.show();
		}

		// The API for creating graph
		fs.readFile(path, 'utf8', (err: any, data: any) =>{
			if (err){
				console.log(err);
			} else {

			let obj = JSON.parse(data); //now it an object
			console.log(obj);

			this.views.createNew();
			
			this.dataSource.createCodeQLGraph(obj);

		}});
	}
}
const extension: CodeQLVisExtension = new CodeQLVisExtension();

export function activate(context: ExtensionContext) {
	const command = 'vscode-debug-visualizer.codeql-visualizer'
	const commandHandler = (path: string) => {
		console.log("Reading from path: " + path);
		extension.produceVis(path);
	}
	context.subscriptions.push(commands.registerCommand(command, commandHandler));
}

export function deactivate() {}


