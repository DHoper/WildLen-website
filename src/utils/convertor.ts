import { QuillDeltaToHtmlConverter } from "quill-delta-to-html"

export const getConvertedHtml = (delta: any) => {

    const converter = new QuillDeltaToHtmlConverter(delta.ops, {})
    return converter.convert()
}


export const getFirstLineWithEllipsis = (delta: any): string => {
    let text = '';
  
    for (const op of delta.ops) {
      if (op.insert && typeof op.insert === 'string') {
        const lines = op.insert.split('\n');
        if (lines.length > 0) {
          text = lines[0].trim();
          break;
        }
      }
    }
  
    text += '...';
  
    return text;
  };