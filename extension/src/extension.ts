import { window, ExtensionContext, commands } from "vscode";
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
let codeQLVisViewOpened: boolean = false;

export function activate(context: ExtensionContext) {
	context.subscriptions.push(
		hotRequireExportedFn(module, Extension, Extension => new Extension())
	);
}

export function deactivate() {}

export class Extension {
	public readonly dispose = Disposable.fn();

	private readonly config = new Config();

	public readonly dataSource = new CodeQLWatchService();

	private readonly server = new WebviewServer(this.dataSource, this.config);
	private readonly views = this.dispose.track(
		new InternalWebviewManager(this.server, this.config)
	);

	constructor() {
		if (getReloadCount(module) > 0) {
			const i = this.dispose.track(window.createStatusBarItem());
			i.text = "reload" + getReloadCount(module);
			i.show();
		}


		// The API for creating graph


	
			fs.readFile('/Users/cijiexia/Project/vscode-codeql/codeqlVisData.json', 'utf8', (err: any, data: any) =>{
				if (err){
					console.log(err);
				} else {

				let obj = JSON.parse(data); //now it an object
				console.log(obj);

				if (!codeQLVisViewOpened) {
					this.views.createNew();
					codeQLVisViewOpened = true;
				}
				
				this.dataSource.createCodeQLGraph(obj);

			}});

			


		


		
	}
}
