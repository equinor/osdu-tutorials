import React, { FC } from "react";
import { authProvider } from "../../authProvider";
import { Button } from "@mui/material";
import "./styles.css";

const Account: FC = () => {
  const { name } = authProvider.getAccount();

  return (
    <div className="main__auth-buttons">
      {name === null ? (
        <Button
          style={{ color: "black", backgroundColor: "white" }}
          variant="contained"
          color="primary"
        >
          Login
        </Button>
      ) : (
        <Button
          className="auth-button"
          variant="contained"
          color="primary"
          style={{ color: "black", backgroundColor: "white" }}
          href={`/logout?frontend_state=${encodeURIComponent(
            window.location.href
          )}`}
        >
          Log out
        </Button>
      )}
    </div>
  );
};

export default Account;
