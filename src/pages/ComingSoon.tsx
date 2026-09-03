import { useNavigate } from "react-router";
import { Button } from "../components/ui/index";

interface ComingSoonProps {
  icon: string;
  title: string;
  description: string;
}

export default function ComingSoon({ icon, title, description }: ComingSoonProps) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center h-full">
      <div className="text-6xl mb-5">{icon}</div>
      <h2 className="font-display font-bold text-2xl text-[#1C1B29] mb-2">{title}</h2>
      <p className="text-[#6B6B80] max-w-sm mb-6">{description}</p>
      <Button variant="secondary" onClick={() => navigate("/my-decks")}>← Back to My Decks</Button>
    </div>
  );
}
