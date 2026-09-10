import { useMockUser } from '../mock/store';
export default function User({ id, name }: ChatServices.Format2.Elements.User) {
  const user = useMockUser(id);
  return <span className="mention">@{user?.name ?? name}</span>;
}
