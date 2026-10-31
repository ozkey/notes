import React from "react";
export declare function saveNotesToFile(notes: any[], articles: any[], fileHandleRef: React.MutableRefObject<any | null>): Promise<boolean>;
export declare function loadNotesFromFile(fileHandleRef: React.MutableRefObject<any | null>, replaceAllNotes: (entries: any[]) => void, replaceAllArticles: (entries: any[]) => void): Promise<boolean>;
//# sourceMappingURL=notesFileIO.d.ts.map