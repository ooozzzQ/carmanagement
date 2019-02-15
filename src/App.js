import React, { Component } from 'react';
import { Input, Form, Button, Table, Popconfirm} from "antd";
import './App.css';
class EditableCell extends React.Component {
  state = {
    value: this.props.value,
    editable: this.props.editable || false,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.editable !== this.state.editable) {
      this.setState({ editable: nextProps.editable });
      if (nextProps.editable) {
        this.cacheValue = this.state.value;
      }
    }
    if (nextProps.status && nextProps.status !== this.props.status) {
      if (nextProps.status === 'save') {
        this.props.onChange(this.state.value);
      } else if (nextProps.status === 'cancel') {
        this.setState({ value: this.cacheValue });
        this.props.onChange(this.cacheValue);
      }
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.editable !== this.state.editable ||
           nextState.value !== this.state.value;
  }
  handleChange(e) {
    const value = e.target.value;
    this.setState({ value });
  }
  render() {
    const { value, editable } = this.state;
    return (
      <div>
        {
          editable ?
            <div>
              <Input
                value={value}
                onChange={e => this.handleChange(e)}
              />
            </div>
            :
            <div className="editable-row-text">
              {value.toString() || ' '}
            </div>
        }
      </div>
    );
  }
}

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    // 表格的行
    this.columns = [{
      title: '日期',
      dataIndex: 'date',
      width: '10%',
      render: (text, record, index) => this.renderColumns(this.state.data, index, 'date', text),
    }, {
      title: '车主姓名',
      dataIndex: 'username',
      width: '10%',
      render: (text, record, index) => this.renderColumns(this.state.data, index, 'username', text),
    }, {
      title: '车主地址',
      dataIndex: 'address',
      width: '15%',
      render: (text, record, index) => this.renderColumns(this.state.data, index, 'address', text),
    }, {
      title: '联系电话',
      dataIndex: 'tel',
      width: '12%',
      render: (text, record, index) => this.renderColumns(this.state.data, index, 'tel', text),
    }, {
      title: '发动机型号',
      dataIndex: 'motor',
      width: '13%',
      render: (text, record, index) => this.renderColumns(this.state.data, index, 'motor', text),
    }, {
      title: 'OB',
      dataIndex: 'obposition',
      width: '10%',
      render: (text, record, index) => this.renderColumns(this.state.data, index, 'obposition', text),
    }, {
      title: '车辆品牌',
      dataIndex: 'brand',
      width: '10%',
      render: (text, record, index) => this.renderColumns(this.state.data, index, 'brand', text),
    }, {
      title: '大架号位置',
      dataIndex: 'bignum',
      width: '10%',
      render: (text, record, index) => this.renderColumns(this.state.data, index, 'brand', text),
    }, {
      title: '操作',
      dataIndex: 'operation',
      width: '10%',
      render: (text, record, index) => {
        const { editable } = this.state.data[index].username;
        return (
          <div className="editable-row-operations">
            {
              editable ?
                <span>
                  <Popconfirm title="确定修改?"  okText="保存" cancelText="继续编辑" onConfirm={() => this.editDone(index, '保存修改')}>
                    <a>保存</a>
                  </Popconfirm>
                  {/* 这里需要改一下逻辑，修改为点击取消，退出编辑，还原成之前的数据 */}
                  <a onClick={() => this.editCancel(index, '取消修改')}>取消</a>
                </span>
                :
                <span>
                  <a onClick={() => this.edit(index)}>修改</a>
                </span>
            }
          </div>
        );
      },
    }];
    // 后台返回的数据
    this.state = {
      data: [{
        key: '0',
        username: {
          editable: false,
          value: 'wang',
        },
        date: {
          editable: false,
          value: '2019-09-10',
        },
        address: {
          editable: false,
          value: 'London, Park Lane no. 0',
        },
        tel: {
          editable: false,
          value: '132xxxxxxxx',
        },
        motor: {
          editable: false,
          value: '132xxxxxxxx',
        },
        obposition: {
          editable: false,
          value: '132xxxxxxxx',
        },
        brand: {
          editable: false,
          value: '132xxxxxxxx',
        },
        bignum: {
          editable: false,
          value: '132xxxxxxxx',
        }
      },{
        key: '1',
        username: {
          editable: false,
          value: 'wang',
        },
        date: {
          editable: false,
          value: '2019-09-10',
        },
        address: {
          editable: false,
          value: 'London, Park Lane no. 0',
        },
        tel: {
          editable: false,
          value: '132xxxxxxxx',
        },
        motor: {
          editable: false,
          value: '132xxxxxxxx',
        },
        obposition: {
          editable: false,
          value: '132xxxxxxxx',
        },
        brand: {
          editable: false,
          value: '132xxxxxxxx',
        },
        bignum: {
          editable: false,
          value: '132xxxxxxxx',
        }
      }],
    };
  }
  renderColumns(data, index, key, text) {
    const { editable, status } = data[index][key];
    if (typeof editable === 'undefined') {
      return text;
    }
    return (<EditableCell
      editable={editable}
      value={text}
      onChange={value => this.handleChange(key, index, value)}
      status={status}
    />);
  }
  handleChange(key, index, value) {
    const { data } = this.state;
    data[index][key].value = value;
    this.setState({ data });
  }
  edit(index) {
    const { data } = this.state;
    Object.keys(data[index]).forEach((item) => {
      if (data[index][item] && typeof data[index][item].editable !== 'undefined') {
        data[index][item].editable = true;
      }
    });
    this.setState({ data });
  }
  editDone(index, type) {
    const { data } = this.state;
    Object.keys(data[index]).forEach((item) => {
      if (data[index][item] && typeof data[index][item].editable !== 'undefined') {
        data[index][item].editable = false;
        data[index][item].status = type;
      }
    });
    this.setState({ data }, () => {
      Object.keys(data[index]).forEach((item) => {
        if (data[index][item] && typeof data[index][item].editable !== 'undefined') {
          console.log(data[index][item].status)
          delete data[index][item].status;
        }
      });
    });
  }
  // 取消编辑并退出的逻辑
  editCancel(index, type) {
    const { data } = this.state;
    console.log(data)
    const datastring = data.join()
    console.log(datastring);
    // const olddata = JSON.parse
    // console.dir(olddata)
    Object.keys(data[index]).forEach((item) => {
      if (data[index][item] && typeof data[index][item].editable !== 'undefined') {
        data[index][item].editable = false;
        // data[index][item].value = olddata[index][item].value;
      }
    });
    this.setState({ data });
  }
  render() {
    const { data } = this.state;
    const dataSource = data.map((item) => {
      const obj = {};
      Object.keys(item).forEach((key) => {
        obj[key] = key === 'key' ? item[key] : item[key].value;
      });
      return obj;
    });
    const columns = this.columns;
    return <Table bordered dataSource={dataSource} columns={columns} />;
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date:new Date()
    }
  }
  savedate(){
    let form = document.getElementById("form");
    console.log(form);
    let formdata = new FormData(form);
    console.log(formdata.get("date"))
  }  
  render() {
    return (
      <div className="App">
        <header>御通车检信息管理</header>
        <div className="infobox">
          <h2 className="infotitle">用户信息存储</h2>
          <Form id="form">
            <div className="info"><label>车主姓名：</label><Input name="username" /></div>
            <div className="info"><label>联系电话：</label><Input name="tel"/></div>
            <div className="info"><label>车主地址：</label><Input name="address"/></div>
            <div className="info"><label>检测日期：</label><Input name="date" defaultValue={this.state.date.toLocaleDateString()} /></div>
            <div className="info"><label>车辆品牌：</label><Input  name="brand"/></div>
            <div className="info"><label>发动机型号：</label><Input name="motor"/></div>
            <div className="info"><label>大架号位置：</label><Input name="bignum"/></div>
            <div className="info"><label>OB位置：</label><Input name="obposition" /></div>
            <div className="btnbox">
              <Button type="primary" onClick={this.savedate}>保存</Button>
              <Button type="danger" icon="search">搜索</Button>
            </div>
          </Form>
        </div>
        <div className="serchresult">
        <h2 className="resulttitle">查询结果</h2>
        <EditableTable />
        </div>
      </div>
    );
  }
}

export default App;
