import React, { Component } from 'react';
import { Input, Form, Button, Table, Icon } from "antd";
import './App.css';
const { Column, ColumnGroup } = Table;
const data = [{
  key: '1',
  username:"王",
  date: "2019-10-11",
  tel:"132xxxxxxxx",
  address: 'New York No. 1 Lake Park',
}, {
  key: '2',
  username:"张",
  date: "2000-10-11",
  tel:"156xxxxxxxx",
  address: 'London No. 1 Lake Park',
}, {
  key: '3',
  username:"六",
  date: "2018-09-02",
  tel:"182xxxxxxxx",
  address: 'Sidney No. 1 Lake Park',
}];

class App extends Component {
  render() {
    return (
      <div className="App">
        <header>御通车检信息管理</header>
        <div className="infobox">
          <h2 className="infotitle">用户信息存储</h2>
          <Form>
            <div className="info"><label>车主姓名：</label><Input /></div>
            <div className="info"><label>联系电话：</label><Input /></div>
            <div className="info"><label>车主地址：</label><Input /></div>
            <div className="info"><label>检测日期：</label><Input /></div>
            <div className="info"><label>车辆品牌：</label><Input /></div>
            <div className="info"><label>发动机型号：</label><Input /></div>
            <div className="info"><label>大架号位置：</label><Input /></div>
            <div className="info"><label>OB位置：</label><Input /></div>
            <div className="btnbox">
              <Button type="primary">保存</Button>
              <Button type="danger" icon="search">搜索</Button>
            </div>
          </Form>
        </div>
        <div className="serchresult">
        <h2 className="resulttitle">查询结果</h2>
          <Table dataSource={data}>
            <Column
              title="日期"
              dataIndex="date"
              key="age"
            />
            <Column
              title="车主姓名"
              dataIndex="username"
              key="address"
            />
            <Column
              title="车主电话"
              dataIndex="tel"
              key="tel"
            />
            <Column
              title="车主地址"
              dataIndex="address"
              key="address"
            />
          </Table>
        </div>
      </div>
    );
  }
}

export default App;
