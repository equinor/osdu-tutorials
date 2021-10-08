import React, {useState} from "react";
import {Button, Collapse, Menu} from 'antd';
import {useSelector} from "react-redux";
import {AppState} from "../../store";
import {Loader} from "../shared";
import {AppstoreAddOutlined, MenuFoldOutlined, MenuUnfoldOutlined} from "@ant-design/icons";
import MenuItem from "antd/es/menu/MenuItem";

export function Heliports() {
    const [collapsed, setCollapsed] = useState(false);

    const areHeliportsLoadding = useSelector((state: AppState) => state.heliportLoad.areHeliportsLoading);
    const heliports = useSelector((state: AppState) => state.heliportLoad.heliports);

    if (areHeliportsLoadding) {
        return (
            <div>
                <Loader/>
            </div>
        );
    };

    const getHeliportName = (id: string) => {
        const arr = id.split(":");
        return arr[2];
    }

    return (
      <>
          <div style={{width: 128}}>
              <Button type="primary" onClick={() => setCollapsed(!collapsed)} style={{marginBottom: 6, marginTop: 10}} icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}>
                  Heliports
              </Button>
              <Menu defaultSelectedKeys={["1"]} mode="inline" theme="dark" inlineCollapsed={collapsed} >
                  {
                      heliports.map(heliport => <MenuItem key={heliport.id} icon={<AppstoreAddOutlined />}>{getHeliportName(heliport.id)}</MenuItem>)
                  }
              </Menu>
          </div>
      </>
    );
}