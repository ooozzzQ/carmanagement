import React, { Component } from 'react';
import { Input, Button, Table, DatePicker, Popconfirm, message} from "antd";
import moment from 'moment';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import './App.css';

const { ipcRenderer } = window.electron;

class EditableCell extends React.Component {
  state = {
    item:this.props.item,
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

  handleChange = (e) => {
    const value = e.target.value;
    this.setState({ value });
    return {value}
  }

  handleDateChange = (value) => {
    this.setState({ value });
  }

  render() {
    const { value, editable} = this.state;
    return (
      <div>
        {
          editable ?
            <div>
              {
              this.props.isDate
              ? <DatePicker placeholder="选择日期" locale={locale} value={ value ? moment(value) : null } onChange={this.handleDateChange} />
              : <Input
                value={value}
                onChange={e => this.handleChange(e)}
              />
              }
            </div>
            :
            <div className="editable-row-text">
              { value ? (this.props.isDate ? moment(value).format('YYYY-MM-DD') : value.toString()) : '-'  }
            </div>
        }
      </div>
    );
  }
}

const dataDeform = (data = []) => {    
  return data.map((item) => {
    const res = {};
    for (const key in item) {
      if (key === 'id') {
        res.key = item[key];
      } else {
        res[key] = {
          editable: false,
          value: item[key],
        }
      }
    }
    return res;
  });
};

const dataTranform = (data) => {    
  const res = {};
  for (const key in data) {
    if (key === 'key') {
      res.id = data[key];
    } else {
      res[key] = data[key].value;
    }
  }
  return res;
};


class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
    })
  }

  renderColumnsFn = (keyword) => (text, record, index) => this.renderColumns(this.state.data, index, keyword, text);

  columns = [{
    title: '检测日期',
    dataIndex: 'date',
    width: '12%',
    render: this.renderColumnsFn('date'),
  }, {
    title: '车主姓名',
    dataIndex: 'username',
    width: '8%',
    render: this.renderColumnsFn('username'),
  }, {
    title: '车主地址',
    dataIndex: 'address',
    width: '15%',
    render: this.renderColumnsFn('address'),
  }, {
    title: '联系电话',
    dataIndex: 'tel',
    width: '12%',
    render: this.renderColumnsFn('tel'),
  }, {
    title: '发动机型号',
    dataIndex: 'motor',
    width: '13%',
    render: this.renderColumnsFn('motor'),
  }, {
    title: 'OB',
    dataIndex: 'obposition',
    width: '10%',
    render: this.renderColumnsFn('obposition'),
  }, {
    title: '车辆品牌',
    dataIndex: 'brand',
    width: '10%',
    render: this.renderColumnsFn('brand'),
  }, {
    title: '大架号位置',
    dataIndex: 'bignum',
    width: '10%',
    render: this.renderColumnsFn('bignum'),
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
                <a href onClick={() => this.editDone(index, 'save')} className="row-oper">保存</a>
                <a href onClick={() => this.editDone(index, 'cancel')} className="row-oper">取消</a>
              </span>
              :
              <span>
                <a href onClick={() => this.edit(index)} className="row-oper">修改</a>
                <Popconfirm title="确定删除这条数据？" okText="确定" cancelText="取消" onConfirm={() => this.delete(index)}>
                  <a href className="row-oper row-del">删除</a>
                </Popconfirm>
              </span>
          }
        </div>
      );
    },
  }];

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
      isDate={key === 'date'}
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

  delete(index) {
    if (ipcRenderer) {
      ipcRenderer.send('delete-data', this.state.data[index].key);
    }
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
      if (type === 'save') {
        if (ipcRenderer) {
          ipcRenderer.send('update-data', dataTranform(data[index]));
        }
      }

      Object.keys(data[index]).forEach((item) => {
        if (data[index][item] && typeof data[index][item].editable !== 'undefined') {
          delete data[index][item].status;
        }
      });
    });
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
    return <Table {...this.props} bordered dataSource={dataSource} columns={columns} />;
  }
}

class App extends Component {
  pageDefault = { cur: 1, size: 10, total: 0 }
  formDataDefault = {
    username: '',
    tel: '',
    address: '',
    date: null,
    brand: '',
    motor: '',
    bignum: '',
    obposition: '',
  }

  state = {
    data: [],
    page: { ...this.pageDefault },
    formData: { ...this.formDataDefault }
  }

  componentDidMount() {
    if (ipcRenderer) {
      // 发送数据到主进程
      ipcRenderer.send('query-data', { page: this.state.page });

      // 接受主进程返回数据
      ipcRenderer.on('save-data', (event, arg) => {
        message.success('保存成功');
        ipcRenderer.send('query-data', { page: this.pageDefault });
      });

      ipcRenderer.on('update-data', (event, arg) => {
        message.success('更新数据成功');
        ipcRenderer.send('query-data', { page: this.state.page });
      });

      ipcRenderer.on('delete-data', (event, arg) => {
        message.success('删除成功');
        ipcRenderer.send('query-data', { page: this.pageDefault });
      });

      // 接受主进程返回数据
      ipcRenderer.on('query-data', (event, arg) => {
          if (arg) {
            this.setState({
              data: dataDeform(arg.data),
              page: arg.page,
            })
          } else {
            this.setState({
              data: [],
              page: { ...this.pageDefault }
            })
          }
      });
    }
  }

  getFormData() {
    const data = {...this.state.formData};
    if (data.date) {
      data.date = data.date.format("YYYY-MM-DD");
    }
    return data;
  }

  onSave = () => {
    const data = this.getFormData();
    let edit = false;
    for (const key in data) {
      if(data[key] && key !== 'date') {
        edit = true;
        break;
      }
    }
    if (!edit) {
      message.warn('请输入数据');
      return;
    }
    if (ipcRenderer) {
      // 发送数据到主进程
      ipcRenderer.send('save-data', data);
    }
  }

  onSearch = () => {
    this.search(this.pageDefault);
  }

  search = (page) => {
    const data = this.getFormData();
    if (ipcRenderer) {
      ipcRenderer.send('query-data', { page: page ? page : this.pageDefault, data });
    }
  }

  onTabeChange = (pagination) => {
    const { page } = this.state;
    page.cur = pagination.current;
    this.setState({
      page,
    })
    this.search(page);
  }

  onDateChange = (moment, dateString) => {
    this.setState({
      formData: {
        ...this.state.formData,
        date: moment,
      },
    });
  }

  onFormChange = (key, e) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [key]: e.target.value,
      },
    });
  }

  onReset = () => {
    this.setState({
      formData: { ...this.formDataDefault }
    })
  }

  render() {
    const { data, page, formData} = this.state;

    return (
      <div className="App">
        <header>御通车检信息管理</header>
        <div className="infobox">
          <h2 className="infotitle">用户信息搜索/存储</h2>
          <form id="form">
            <div className="info"><label>车主姓名：</label><Input value={formData.username} onChange={(e) => this.onFormChange('username', e)} /></div>
            <div className="info"><label>联系电话：</label><Input value={formData.tel} onChange={(e) => this.onFormChange('tel', e)} /></div>
            <div className="info"><label>车主地址：</label><Input value={formData.address} onChange={(e) => this.onFormChange('address', e)} /></div>
            <div className="info"><label>检测日期：</label><DatePicker placeholder="选择日期" value={formData.date} onChange={this.onDateChange} locale={locale} /></div>            
            <div className="info"><label>车辆品牌：</label><Input value={formData.brand} onChange={(e) => this.onFormChange('brand', e)} /></div>
            <div className="info"><label>发动机型号：</label><Input value={formData.motor} onChange={(e) => this.onFormChange('motor', e)} /></div>
            <div className="info"><label>大架号位置：</label><Input value={formData.bignum} onChange={(e) => this.onFormChange('bignum', e)} /></div>
            <div className="info"><label>OB位置：</label><Input value={formData.obposition} onChange={(e) => this.onFormChange('obposition', e)} /></div>
            <div className="btnbox">
              <Button type="primary" onClick={this.onSave}>保存</Button>
              <Button htmlType="reset" onClick={this.onReset}>重置</Button>
              <Button type="danger" icon="search" onClick={this.onSearch}>搜索</Button>
            </div>
          </form>
        </div>
        <div className="serchresult">
        <h2 className="resulttitle">查询结果</h2>
        <EditableTable data={data} pagination={{ current: page.cur, total: page.total, pageSize: page.size }} onChange={this.onTabeChange} />
        </div>
      </div>
    );
  }
}

export default App;
