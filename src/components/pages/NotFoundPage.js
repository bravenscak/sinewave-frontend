import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col gap-2">
      404 Not Found
      <br />
      <Link to="/">Return Home</Link>
    </div>
  );
}
