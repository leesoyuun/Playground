// External preview services replaced with local attachment data.
export default function Link({ url, title, info, isFile = false }: ChatServices.Format2.Elements.Link & { isFile?: boolean; nextElement?: ChatServices.Format2.Elements.SectionAllowElements }) {
  const safe = /^(https?:\/\/|\/)/.test(url);
  if (!safe) return <span>{title}</span>;
  return <a href={url} target="_blank" rel="noreferrer">{isFile && info.image && <img className="rf-preview-image" src={info.image} alt="링크 미리보기" />}{title || url}</a>;
}
