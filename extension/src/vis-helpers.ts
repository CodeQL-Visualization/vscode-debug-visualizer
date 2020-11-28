export type TaintVisNode = {
    uniqueID: string;
    label: string;
    tainted: boolean;
    children: TaintVisNode[];
}