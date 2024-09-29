interface ColumnData {
    name: string,
    type: string,
    key?: boolean
    scope: string,
    code: string,
}

interface RouterOptions {
    padding?: number,
    sourcePadding?: number,
    targetPadding?: number
}

export {
    ColumnData,
    RouterOptions
}
