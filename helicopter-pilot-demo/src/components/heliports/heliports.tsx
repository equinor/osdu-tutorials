import React, {useEffect, useState} from "react";
import {Button, Menu} from 'antd';
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../store";
import {Loader} from "../shared";
import {MenuFoldOutlined, MenuUnfoldOutlined} from "@ant-design/icons";
import MenuItem from "antd/es/menu/MenuItem";
import {loadActivitiesAction} from "../../store/activity/actions";

export function Heliports() {
    const {SubMenu} = Menu;
    const dispatch = useDispatch();
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

    let originHeliports = schedules.map(s => s.data.OriginHeliport);
    originHeliports = originHeliports.filter((n, i) => originHeliports.indexOf(n) === i);

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
        return heliMap.get(arr[2]);
    }

    const handleHeliportSelect = (key: string) => {
       console.log(key);
       //schedules.filter(s => s.data.OriginHeliport === key).map(s => dispatch(loadActivitiesAction("opendes:work-product-component--HelicopterResourceSchedule:Platform_2")));
       dispatch(loadActivitiesAction(key));
    }

    const heliportView = (originHeliportId: string) => {
        let destinationHeliports = schedules.filter(s => s.data.OriginHeliport === originHeliportId);

        return (
            <>
                <SubMenu key={originHeliportId} title={getHeliportName(originHeliportId)} onTitleClick={(e) => handleHeliportSelect(e.key)}>
                    {destinationHeliports.map(heliport => (
                        <MenuItem key={heliport.id}>{getHeliportName(heliport.data.DestinationHeliport)}</MenuItem>
                    ))}
                </SubMenu>
            </>
        )
    }

    return (
      <>
          <div style={{width: 128}}>
              <Button type="primary" onClick={() => setCollapsed(!collapsed)} style={{marginBottom: 6, marginTop: 10}} icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}>
                  Heliports
              </Button>
              <Menu defaultSelectedKeys={["1"]} mode="inline" theme="dark" inlineCollapsed={collapsed}>
                  {
                      originHeliports.map(heliport => heliportView(heliport))
                  }
              </Menu>
          </div>
      </>
    );
}