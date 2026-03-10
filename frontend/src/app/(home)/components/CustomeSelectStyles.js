export const customStyles = {
    control: (base, state) => ({
        ...base,
        width: "100%",
        backgroundColor: state.isDisabled ? "rgb(0,0,0,0.1)" : "none",
        borderColor: state.isFocused ? "var(--accent2-color)" : "#d1d5db", // focus: blue-500, default: gray-300
        boxShadow: state.isFocused ? "0 0 0 1px var(--accent2-color)" : "none",
        "&:hover": {
            borderColor: "var(--accent2-color)",
        },
        minHeight: "100%",
        fontSize: "0.875rem", // text-sm
        borderRadius: "0", // rounded-md
        padding:".3em .5em"
    }),
    menu: (base) => ({
        ...base,
        zIndex: 100,
        borderRadius: "0.375rem", // rounded-md
        fontSize: "0.875rem", // text-sm
    }),
    option: (base, { isFocused, isSelected }) => ({
        ...base,
        backgroundColor: isSelected
            ? "#2563eb" // blue-600
            : isFocused
                ? "#bfdbfe" // blue-200
                : "white",
        color: isSelected ? "white" : "black",
        cursor: "pointer",
        fontSize: "0.875rem", // text-sm
    }),
    singleValue: (base) => ({
        ...base,
        color: "#111827", // gray-900
    }),
    input: (base) => ({
        ...base,
        color: "#111827", // gray-900
    }),
};