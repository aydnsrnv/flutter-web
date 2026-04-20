export function ManatIcon({ size = 24, className = '', color = 'currentColor' }: { size?: number, className?: string, color?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(0, 512) scale(0.1, -0.1)" fill={color} stroke="none">
        <path d="M2230 3822 l0 -249 -87 -17 c-846 -165 -1521 -837 -1693 -1685 -33 -166 -40 -258 -40 -543 l0 -278 329 0 329 0 5 303 c5 326 12 386 72 564 156 464 543 832 1016 962 l69 20 0 -570 0 -569 330 0 330 0 0 569 0 570 69 -20 c474 -131 863 -501 1015 -966 60 -182 68 -244 73 -565 l5 -298 329 0 329 0 0 278 c0 285 -7 377 -40 543 -29 144 -65 260 -124 401 -224 538 -663 965 -1213 1182 -91 35 -316 98 -400 111 l-43 7 0 249 0 249 -330 0 -330 0 0 -248z" />
      </g>
    </svg>
  );
}
