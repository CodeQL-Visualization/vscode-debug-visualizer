import {
   EvaluationWatchService,
   EvaluationWatcher,
   EvaluationWatcherOptions,
} from "./EvaluationWatchService";
import { observable, autorun, action } from "mobx";
import { Disposable } from "@hediet/std/disposable";
import { DataExtractorId, GraphNode, GraphVisualizationData } from "@hediet/debug-visualizer-data-extraction";
import { DataExtractionState, CompletionItem } from "../webviewContract";
import { hotClass } from "@hediet/node-reload";
import { TaintVisNode } from "../vis-helpers";

@hotClass(module)
export class CodeQLWatchService implements EvaluationWatchService {
   public readonly dispose = Disposable.fn();
   private watcher : CodeQLWatcher;

   constructor() {
        this.watcher = new CodeQLWatcher('', this, {preferredDataExtractor: undefined});
      this.dispose.track({
         dispose: autorun(() => {
            this.watcher.refresh();
         }),
      });
   }

   public createEvaluationWatcher(
      expression: string,
      options: EvaluationWatcherOptions
   ): EvaluationWatcher {
      this.refresh(this.watcher);
      return this.watcher;
    }
    
    public createCodeQLGraph(graphData: any) {
        const graph : GraphVisualizationData = {
         kind: { graph: true },
         nodes: [],
         edges: []
        };
 
        const result = {
            kind: "data",
            result: {
                availableExtractors: [],
                usedExtractor: {
                    id: "generic" as any,
                    name: "Generic",
                    priority: 1,
                },
                data: graph,
            },
      } as DataExtractionState;
      
      graph.nodes = graphData.nodes;
      graph.edges = graphData.edges;
      
      this.watcher._state = result;
    }

   get languageId(): string | undefined {
      return undefined;
   }

   public async refresh(w: CodeQLWatcher): Promise<void> {
   }

   public async getCompletions(
      text: string,
      column: number
   ): Promise<CompletionItem[]> {
        return [];
   }
}

class CodeQLWatcher implements EvaluationWatcher {
   constructor(
      public readonly expression: string,
      private readonly source: CodeQLWatchService,
      options: EvaluationWatcherOptions
   ) {
      this._preferredDataExtractor = options.preferredDataExtractor;
   }

   @observable
   private _preferredDataExtractor: DataExtractorId | undefined = undefined;

   public get preferredDataExtractor(): DataExtractorId | undefined {
      return this._preferredDataExtractor;
   }

   @action
   public setPreferredDataExtractor(id: DataExtractorId | undefined): void {
      this._preferredDataExtractor = id;
      this.refresh();
   }

   public refresh(): void {
      this.source.refresh(this);
   }

   @observable
   public _state: DataExtractionState = { kind: "error", message:"Unexpected error" };
   public get state(): DataExtractionState {
      return this._state;
   }

   public dispose(): void {
   }
}
