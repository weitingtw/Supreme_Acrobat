import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Form, Input, Button, Upload, Modal } from 'antd';
import { CloseCircleOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import './LoginModal.css';
import { getHost, getGrobidHost } from '../../utils';

class ModalContent extends Component {
    state = {
        currentAction: 'signin',      // either signin or signup
        email: '',
        password: ''
    }

    switchAction = () => {
        this.setState(prevState => {
            const newAction =
                prevState.currentAction === 'signin' ?
                    'signup' : 'signin';

            return {
                currentAction: newAction
            };
        })
    }

    handleSignIn = () => {
        this.props.handleSignIn(this.state);
    }

    handleSignUp = () => {
        this.props.handleSignUp(this.state);
    }

    handleEmailInput = e => {
        this.setState({ email: e.target.value });
    }

    handlePasswordInput = e => {
        this.setState({ password: e.target.value });
    }

    render() {
        const { currentAction } = this.state;

        // layout that controls the form
        const layout = {
            labelCol: {
                span: 8,
            },
            wrapperCol: {
                span: 20,
            },
        };

        // confirm button types
        const _SignInButton =
            <Button
                type="primary"
                onClick={this.handleSignIn}
            >
                Sign In
            </Button>

        const _SignUpButton =
            <Button
                type="primary"
                onClick={this.handleSignUp}
            >
                Sign Up
            </Button>

        // action switch button types
        const _SwitchToSignInButton =
            <div>
                already have an account?
                <a href='#' onClick={this.switchAction}>
                    {' Sign In'}
                </a>
            </div>

        const _SwitchToSignUpButton =
            <div>
                Don't have an account?
                <a href='#' onClick={this.switchAction}>
                    {' Sign Up'}
                </a>
            </div>

        // select current button types according to current action
        let ConfirmButton, SwitchActionButton, titleText;
        if (currentAction === 'signin') {
            ConfirmButton = _SignInButton;
            SwitchActionButton = _SwitchToSignUpButton;
            titleText = 'Sign In';
        } else {
            ConfirmButton = _SignUpButton;
            SwitchActionButton = _SwitchToSignInButton;
            titleText = 'Sign Up';
        }

        return (
            <div className='modal-inner-content'>
                <h3>{titleText}</h3>

                <Form
                    {...layout}
                    name="signInForm"
                >
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: 'Please enter your email!',
                            },
                        ]}
                    >
                        <Input onChange={this.handleEmailInput} />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Please enter your password!',
                            },
                        ]}
                    >
                        <Input.Password onChange={this.handlePasswordInput} />
                    </Form.Item>
                </Form>
                {ConfirmButton}
                {SwitchActionButton}
            </div>
        );
    }
}

class PendingModalContent extends Component {
    render() {
        return <div> There's no pending report</div>
    }
}
class SubmitModalContent extends Component {
    formRef = React.createRef();
    state = {
        loading: false,
        file: "",
        filename: "Choose File",
        uploadedFile: {},
        message: "",
        title: "",
        authors: [],
        keywords: [],
        content: "",
        doi: "",
    }

    // handle file change
    onChangeFile = e => {
        console.log("here");
        console.log(e.target.files[0])
        if (e.target.files[0]) {
            let fname = e.target.files[0].name;
            fname = fname.replace(/\s/g, '');
            this.setState({ file: e.target.files[0] });
            this.setState({ filename: fname });
        }
    };

    // upload file to grobid
    onSubmitFile = async e => {
      if(!this.state.file){
        alert("please select the file!");
      }
      else{
        this.startLoading();

        e.preventDefault();
        const formData = new FormData();
        formData.append('input', this.state.file);
        console.log("file appended");

        // upload file to grobid
        try {
            const res = await axios.post(getGrobidHost() + '/api/processFulltextDocument', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(res.data);
            this.setState({ message: 'File Uploaded' });
            console.log("state updated");
            this.processXML(new window.DOMParser().parseFromString(res.data, "text/xml"))
        } catch (err) {
            console.log(err);
        }
    };

    processXML = data => {
        console.log("in process xml");
        var xml = data;
        //extract title
        var title = xml.getElementsByTagName("title")[0].innerHTML;
        this.setState({ title: title });
        console.log(this.state.title);
        //extract keywords
        var terms = xml.getElementsByTagName("term");
        const kwarr = [];
        for (let i = 0; i < terms.length; i++) {
            kwarr.push(terms[i].innerHTML);
        }
        this.setState({ keywords: kwarr });
        //extract authors
        var author = xml.querySelectorAll("fileDesc author");
        const authorList = [];
        for (let i = 0; i < author.length; i++) {
            let name = "";
            const fore = author[i].getElementsByTagName('forename');
            const sur = author[i].getElementsByTagName('surname');
            for (let j = 0; j < fore.length; j++) {
                name = name + fore[j].innerHTML + " ";
            }
            for (let j = 0; j < sur.length; j++) {
                name = name + sur[j].innerHTML;
            }
            authorList.push(name);
        }

        this.setState({ authors: authorList });
        console.log(this.authors);

        const contentList = [];

        //extract abstract
        // var abstract = xml.querySelectorAll("abstract div");
        // for(let i = 0; i < abstract.length; i++){
        //   for(let j = 0; j < abstract[i].children.length; j++){
        //     if(abstract[i].children[j].tagName.toLowerCase() === "head"){
        //       contentList.push("\n");
        //       contentList.push(abstract[i].children[j].innerHTML);
        //       contentList.push("\n");
        //     }
        //     if(abstract[i].children[j].tagName.toLowerCase() === "p"){
        //       var elements = abstract[i].children[j].getElementsByTagName('ref');
        //       // remove all <a> elements
        //       while (elements[0]){
        //         elements[0].parentNode.removeChild(elements[0])
        //       }
        //       contentList.push(abstract[i].children[j].innerHTML);
        //     }
        //   }
        // }

        //extract contents
        var content = xml.querySelectorAll("body div");

        for (let i = 0; i < content.length; i++) { // iterate through each div under body tag
            for (let j = 0; j < content[i].children.length; j++) {// iterate through each tag under each div
                if (content[i].children[j].tagName.toLowerCase() === "head" && content[i].children[j].innerHTML.toLowerCase().indexOf("case") != -1) {
                    // extract content
                    while (j < content[i].children.length) {
                        if (content[i].children[j].tagName.toLowerCase() === "p") {
                            var tmp = content[i].children[j].getElementsByTagName('ref');
                            // remove all <a> elements
                            while (tmp[0]) {
                                tmp[0].parentNode.removeChild(tmp[0])
                            }
                            contentList.push(content[i].children[j].innerHTML);
                        }
                        j++;
                    }
                }

            }
        }
      }
      //console.log(contentList.join(''));
      this.setState({content: contentList.join('')});
      this.formRef.current.setFieldsValue({
          title: this.state.title,
          authors: this.state.authors,
          doi: this.state.doi,
          keywords: this.state.keywords,
          content: this.state.content,
      });
      this.setState({loading: false});
    }

    startLoading = () => {
      this.setState({loading: true});
    }

    onChangeContent = e => {
        this.setState({ content: e.target.value });
    }
    onChangeTitle = e => {
        this.setState({ title: e.target.value });
    }
    onChangeKeywords = e => {
        this.setState({ keywords: e.target.value.split(',') });
    }
    onChangeAuthor = e => {
        this.setState({ authors: e.target.value.split(',') });
    }
    onChangeDoi = e => {
        this.setState({ doi: e.target.value });
    }

    handleSubmit = () => {
        this.props.handleSubmit(this.state);
        //.split(',').map(item => {return item.trim();})
    }



    render() {

        const layout = {
          labelCol: {
            span: 4,
          },
          wrapperCol: {
            span: 20,
          },
        };

        const _submitButton =
            <Button
                type="primary"
                onClick={this.handleSubmit}
                className='confirm-button'
            >
                Submit
            </Button>
        let SubmitButton = _submitButton;

        return (
              <Form
              {...layout}
              ref={this.formRef}
              name="pdfUploadForm"
              >
              <Form.Item
              label="Upload">
                <div className="pdfSubmit">
                  <input
                    type="file"
                    accept=".pdf"
                    style={{width: '305px', overflow: 'hidden',textOverflow: 'ellipsis'}}
                    onChange={this.onChangeFile} />
                  <Button
                    type="primary"
                    onClick={this.onSubmitFile}
                    loading={this.state.loading}>
                    Parse
                  </Button>
                </div>
              </Form.Item>
              <Form.Item
                  label="Title"
                  name="title"
                  rules={[{ required: true, message: 'Title is required!' }]}
                  value={this.state.title}
                >
                    <Input placeholder="Title" onChange={this.onChangeTitle} />
                </Form.Item>
                <Form.Item
                    label="Authors"
                    name="authors"
                    rules={[{ required: true, message: 'Authors are required!' }]}
                >
                    <Input placeholder="Author (Seperate with comma)" onChange={this.onChangeAuthor} />
                </Form.Item>
                <Form.Item
                    label="DOI"
                    name="doi"
                >
                    <Input placeholder="Doi" onChange={this.onChangeDoi} />
                </Form.Item>
                <Form.Item
                    label="Keywords"
                    name="keywords"
                >
                    <Input placeholder="Keywords (Seperate with comma)" onChange={this.onChangeKeywords} />
                </Form.Item>
                <Form.Item
                    label="Content"
                    name="content"
                    rules={[{ required: true, message: 'Content is required!' }]}
                >
                  <Input.TextArea rows={10} placeholder="Content" onChange={this.onChangeContent}/>
                </Form.Item>
                {SubmitButton}
            </Form>)
    }
}

class LoginModal extends Component {
    state = {
        login_visible: false,
        submit_visible: false,
        pending_visible: false
    }

    openSubmitModal = () => {
        this.setState({ submit_visible: true });
    }

    closeSubmitModal = () => {
        this.setState({ submit_visible: false })
    }

    openPendingModal = () => {
        this.setState({ pending_visible: true });
    }

    closePendingModal = () => {
        this.setState({ pending_visible: false })
    }

    openModal = () => {
        this.setState({ login_visible: true });
    }

    closeModal = () => {
        this.setState({ login_visible: false });
    }

    handleSignIn = data => {
        console.log('signin', data);
        axios.post(getHost() + "/api/login", data)
            .then(res => {
                // console.log(res.data);
                if (res.data.success === true) {
                    const { user } = res.data;
                    localStorage.setItem('user', JSON.stringify(user));
                    alert('welcome!')
                } else {
                    alert('login failed!')
                }
                this.closeModal();
            })
    }

    handleSignUp = data => {
        console.log('signup', data);
        axios.post(getHost() + "/api/createUser", data)
            .then(res => {
                console.log(res.data);
                if (res.data.success === true) {
                    alert('sign up success!')
                } else {
                    alert('sign up failed!')
                }
                this.closeModal();
            })
    }

    handleSignOut = () => {
        localStorage.clear();
        this.forceUpdate();
    }

    handleSubmit = text => {
        axios.post(getHost() + "/api/uploadReport", text)
            .then(res => {
                console.log(res.data);
                if (res.data.success === false) {
                    alert('upload failed')
                } else {
                    alert('upload succeeded')
                }
                this.closeSubmitModal();
            })
    }

    showProfile = () => {
        let user = JSON.parse(localStorage.getItem('user'));
        const { email, createdAt } = user;
        alert(email + '\n\n' + createdAt);
    }

    render() {
        const { login_visible, submit_visible, pending_visible } = this.state;

        let hasUser = false;
        let user = localStorage.getItem('user');
        if (user) {
            user = JSON.parse(user);
            hasUser = true;
        }
        console.log(user, hasUser);

        const MyButton = hasUser ?
            <div className='button'>
                <Button onClick={this.showProfile}>
                    <FontAwesomeIcon icon={['far', 'user-astronaut']} />
                    Profile
                </Button>

                <Button onClick={this.openSubmitModal}>
                    <FontAwesomeIcon icon={['far', 'arrow-alt-circle-up']} />
                    Submit
                </Button>

                <Button onClick={this.openPendingModal}>
                    <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} />
                    Pending
                </Button>

                |
                <Button onClick={this.handleSignOut}>
                    Sign Out
                </Button>

            </div>
            :
            <Button onClick={this.openModal} className='button'>
                <FontAwesomeIcon icon={['far', 'user-astronaut']} />
                Login
            </Button>


        return (
            <div id='login-modal'>
                {MyButton}
                <Modal
                    visible={this.state.login_visible}
                    onCancel={this.closeModal}
                    footer={null}
                    closeIcon={<CloseCircleOutlined />}
                    destroyOnClose={true}
                >

                    <ModalContent
                        handleSignIn={this.handleSignIn}
                        handleSignUp={this.handleSignUp}
                    />
                </Modal>
                <Modal
                    visible={this.state.submit_visible}
                    onCancel={this.closeSubmitModal}
                    footer={null}
                    closeIcon={<CloseCircleOutlined />}
                    destroyOnClose={true}
                >
                    <h4>Submit New Case Report</h4>
                    <SubmitModalContent
                        handleSubmit={this.handleSubmit}
                    />
                </Modal>
                <Modal
                    visible={pending_visible}
                    width="600"
                    height="500"
                    effect="fadeInDown"
                    onCancel={this.closePendingModal}
                >
                    <PendingModalContent
                        handleCloseModal={this.closePendingModal}
                    />
                </Modal>
            </div>
        );
    }
}


export default LoginModal;
