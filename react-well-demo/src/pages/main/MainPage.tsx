import React, { useState } from "react";
import "./styles.css";
import WellCanvas from "../../components/well/WellCanvas";
import Search from "../../components/well/Search";
import Account from "../../components/account";
import { Box, AppBar, Toolbar } from "@mui/material";
import WellLogContextProvider from "../../contexts/wellLogContext/wellLogContextProvider";

/**
 * Contains login-logout functionality, search wells form,
 * found wells list and area for drawing well trajectories
 */
export function MainPage() {
  const [searchName, setSearchName] = useState<string>("");

  const Navbar = () => {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="static"
          style={{ backgroundColor: "rgb(39, 77, 83)" }}
        >
          <Toolbar>
            <Search setSearchNameCallback={setSearchName} />
            <Account />
          </Toolbar>
        </AppBar>
      </Box>
    );
  };

  return (
    <div className="main">
      <div className="main__page">
        <WellLogContextProvider>
          <Box>
            <Navbar />
          </Box>
          <WellCanvas searchName={searchName} />
        </WellLogContextProvider>
      </div>
    </div>
  );
}
