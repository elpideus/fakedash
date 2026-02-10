import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

/**
 * A customized Material UI Button used for primary actions.
 *
 * **Visuals:**
 * - Solid black background with white text.
 * - High emphasis with a 12px border radius.
 * - Hover state reduces opacity to 80%.
 *
 * @component
 * @see {@link https://mui.com/material-ui/react-button/ MUI Button API}
 */
export const PrimaryButton = styled(Button)(() => ({
    backgroundColor: "#000",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "12px",
    textTransform: "none",
    "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.8)", // 80% opacity black
        color: "#fff",
    }
}));

/**
 * A customized Material UI Button used for secondary or neutral actions.
 *
 * **Visuals:**
 * - White background with black text and a subtle border.
 * - Matches the 12px border radius of the PrimaryButton for visual consistency.
 * - Used typically for "Cancel", "Back", or "Dismiss" actions.
 *
 * @component
 * @see {@link https://mui.com/material-ui/react-button/ MUI Button API}
 */
export const SecondaryButton = styled(Button)(() => ({
    backgroundColor: "#fff",
    color: "#000",
    padding: "10px 20px",
    borderRadius: "12px",
    textTransform: "none",
    border: "1px solid rgba(0, 0, 0, 0.23)",
    "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
        border: "1px solid rgba(0, 0, 0, 0.23)",
    },
}));