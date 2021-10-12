import React, {useState} from "react";
import {Button, Menu} from 'antd';
import {useSelector} from "react-redux";
import {AppState} from "../../store";
import {Loader} from "../shared";
import {AppstoreAddOutlined, MenuFoldOutlined, MenuUnfoldOutlined} from "@ant-design/icons";
import MenuItem from "antd/es/menu/MenuItem";
import {loadSchedules, LoadSchedulesResponse} from "../../api/schedule.api";

export function Heliports() {
    const [collapsed, setCollapsed] = useState(false);

    const areSchedulesLoading = useSelector((state: AppState) => state.scheduleLoad.areSchedulesLoading);
    const schedules = useSelector((state: AppState) => state.scheduleLoad.schedules);

    if (areSchedulesLoading) {
        return (
            <div>
                <Loader/>
            </div>
        );
    }

    console.log(schedules.length);

    let originHeliports = schedules.map(s => s.data.OriginHeliport);
    originHeliports = originHeliports.filter((n, i) => originHeliports.indexOf(n) === i);
    let destinationHeliports = schedules.map(s => s.data.DestinationHeliport);

    console.log(originHeliports);


    let heliMap = new Map([
        ["ENZV", "Sola"],
        ["ENDR", "Draugen"],
        ["ENSL", "Sleipner A"],
        ["ENJS", "Johan Sverdrup"],
        ["ENVH", "Valhall"],
        ["ENLA", "Ula"]
    ]);

    const getHeliportName = (id: string) => {
        const arr = id.split(":");
        console.log(heliMap.get(arr[2]));
        return heliMap.get(arr[2]);
    }

    const handleHeliportSelect = (key: string) => {
       console.log(key);
    }

    return (
      <>
          <div style={{width: 128}}>
              <Button type="primary" onClick={() => setCollapsed(!collapsed)} style={{marginBottom: 6, marginTop: 10}} icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}>
                  Heliports
              </Button>
              <Menu defaultSelectedKeys={["1"]} mode="inline" theme="dark" inlineCollapsed={collapsed} onClick={(e) => handleHeliportSelect(e.key)} >
                  {
                      originHeliports.map(heliport => <MenuItem key={heliport} icon={<AppstoreAddOutlined />}>{getHeliportName(heliport)}</MenuItem>)
                  }
              </Menu>
          </div>
      </>
    );
}