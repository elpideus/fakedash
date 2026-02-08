import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

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