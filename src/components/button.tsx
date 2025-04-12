import { cn } from "../utils";

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 duration-300 rounded focus:outline-none focus:shadow-outline hover:shadow-lg hover:cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
