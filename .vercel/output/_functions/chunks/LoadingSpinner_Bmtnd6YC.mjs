import { jsxs, jsx } from 'react/jsx-runtime';

function LoadingSpinner({ size = "md", color = "blue", className = "", text }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };
  const colorClasses = {
    blue: "text-blue-600",
    gray: "text-gray-600",
    white: "text-white"
  };
  return /* @__PURE__ */ jsxs("div", { className: `flex flex-col items-center justify-center ${className}`, children: [
    /* @__PURE__ */ jsxs(
      "svg",
      {
        className: `animate-spin ${sizeClasses[size]} ${colorClasses[color]}`,
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        children: [
          /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
          /* @__PURE__ */ jsx(
            "path",
            {
              className: "opacity-75",
              fill: "currentColor",
              d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            }
          )
        ]
      }
    ),
    text && /* @__PURE__ */ jsx("div", { className: `mt-2 text-sm ${colorClasses[color]}`, children: text })
  ] });
}

export { LoadingSpinner as L };
