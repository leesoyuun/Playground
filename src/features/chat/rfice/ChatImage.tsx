export default function ChatImage({ url, alt, onClick }: ChatServices.Format2.Elements.Image & { onClick?: (item: ChatServices.Format2.Elements.AllRichtextElements) => void }) {
  return <img className="rf-preview-image" src={url} alt={alt ?? '샘플 첨부 이미지'} onClick={() => onClick?.({ type: 'image', id: url, url, alt })} />;
}
