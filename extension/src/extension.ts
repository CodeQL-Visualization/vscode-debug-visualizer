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

		const root:TaintVisNode = {
			uniqueID: "1",
			label: "foo()",
			tainted: true,
			children: []
		 }
   
		 root.children.push({
			uniqueID: "2",
			label: "bar()",
			tainted: false,
			children: []
		 })
   
		 root.children.push({
			uniqueID: "3",
			label: "bar2()",
			tainted: false,
			children: []
		 })
   
		 const foo2: TaintVisNode = {
			uniqueID: "4",
			label: "foo2()",
			tainted: true,
			children: []
		 }
   
		 root.children[0].children.push(foo2);
		 root.children[1].children.push(foo2);

		// The API for creating graph
		this.views.createNew();
		this.dataSource.createCodeQLGraph(root);
	}
}
