import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

export const PrimaryButton = styled(Button)(() => ({
    backgroundColor: "#000",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "12px",
    textTransform: "none",
    "&:hover": {
        backgroundColor: "#00000080",
    },
}));

export const SecondaryButton = styled(Button)(() => ({
    backgroundColor: "#fff",
    color: "#000",
    padding: "10px 20px",
    borderRadius: "12px",
    textTransform: "none",
    "&:hover": {
        backgroundColor: "#00000020",
    },
}));
