
import { SVGProps } from "react";

export function SketchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 28 26" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M8.33333 1H19.1667L27.5 9.5V10.5L13.75 25L0 10.5V9.5L8.33333 1Z" fill="#5E616B"/>
        <path d="M8.33333 1L0 9.5V10.5L13.75 25L27.5 10.5V9.5L19.1667 1H8.33333Z" stroke="#5E616B" strokeWidth="2"/>
    </svg>
  );
}
