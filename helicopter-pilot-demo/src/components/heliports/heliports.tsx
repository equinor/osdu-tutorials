import React from "react";
import { Collapse } from 'antd';
import {useSelector} from "react-redux";
import {AppState} from "../../store";
import {Loader} from "../shared";

const { Panel } = Collapse;

export function Heliports() {
    const text = "heliport name";

    const areHeliportsLoadding = useSelector((state: AppState) => state.heliportLoad.areHeliportsLoading);
    const heliports = useSelector((state: AppState) => state.heliportLoad.heliports);

    console.log(heliports);

    if (areHeliportsLoadding) {
        return (
            <div>
                <Loader/>
            </div>
        );
    };

    return (
      <>
          <Collapse defaultActiveKey={['1']}>
              <Panel header="This is panel header 1" key="1">
                  <p>{text}</p>
              </Panel>
              <Panel header="This is panel header 2" key="2">
                  <p>{text}</p>
              </Panel>
              <Panel header="This is panel header 3" key="3">
                  <p>{text}</p>
              </Panel>
          </Collapse>
      </>
    );
}