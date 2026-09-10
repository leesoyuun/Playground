import { FileText } from 'lucide-react';
export default function ContentPreview({ title, displaySize }: ChatServices.Format2.Elements.File & { enableQuickPlay?: boolean }) {
  return <div className="rf-file"><FileText size={26} /><div><strong>{title}</strong><small>{displaySize} · mock 파일</small></div></div>;
}
