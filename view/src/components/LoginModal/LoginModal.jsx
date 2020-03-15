import React, { Component } from 'react';
import Modal from 'react-awesome-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Form } from 'react-bootstrap';
import axios from 'axios';
import './LoginModal.css';
import { getHost } from '../../utils';


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
        const { handleCloseModal } = this.props;
        const { currentAction } = this.state;

        // confirm button types
        const _SignInButton =
            <button
                onClick={this.handleSignIn}
                className='confirm-button'
            >
                Sign In
            </button>

        const _SignUpButton =
            <button
                onClick={this.handleSignUp}
                className='confirm-button'
            >
                Sign Up
            </button>

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
                don't have an account?
                <a href='#' onClick={this.switchAction}>
                    {' Sign Up'}
                </a>
            </div>

        // button to close modal
        const CloseModalButton =
            <button
                id='close-button'
                onClick={handleCloseModal
                }>
                <FontAwesomeIcon icon={['far', 'times']} />
            </button>

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
                <h2>{titleText}</h2>

                <Form.Group controlId="formGroupEmail">
                    <Form.Label>
                        <FontAwesomeIcon icon={['far', 'envelope']} />
                        Email
                    </Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter email"
                        onChange={this.handleEmailInput}
                    />
                </Form.Group>
                <Form.Group controlId="formGroupPassword">
                    <Form.Label>
                        <FontAwesomeIcon icon={['far', 'lock-alt']} />
                        Password
                    </Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Enter password"
                        onChange={this.handlePasswordInput}
                    />
                </Form.Group>

                {ConfirmButton}

                {SwitchActionButton}

                {CloseModalButton}
            </div>
        );
    }
}


class SubmitModalContent extends Component {
    state = {
        file: "",
        filename: "Choose File",
        uploadedFile: {},
        message: "",
        title: "",
        authors: [],
        keywords:[],
        content:""
    }
    // handle file change
    onChangeFile = e => {
      if(e.target.files[0]){
        let fname = e.target.files[0].name;
        fname = fname.replace(/\s/g, '');
        this.setState({ file: e.target.files[0]});
        this.setState({ filename: fname });
      }
    };

    // upload file to grobid
    onSubmitFile = async e => {
      e.preventDefault();
      alert("clicked");
      const formData = new FormData();
      formData.append('input', this.state.file);
      console.log("file appended");

      // upload file to grobid
      try {
        const res = await axios.post('http://localhost:8070/api/processFulltextDocument', formData, {
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
      for(let i = 0; i < terms.length; i++){
        kwarr.push(terms[i].innerHTML);
      }
      this.setState({ keywords: kwarr});
      //extract authors
      var author = xml.querySelectorAll("fileDesc author");
      const authorList = [];
      for(let i = 0; i < author.length; i++){
        let name = "";
        const fore = author[i].getElementsByTagName('forename');
        const sur = author[i].getElementsByTagName('surname');
        for(let j = 0; j < fore.length; j++){
          name = name + fore[j].innerHTML + " ";
        }
        for(let j = 0; j < sur.length; j++){
          name = name + sur[j].innerHTML;
        }
        authorList.push(name);
      }

      this.setState({ authors: authorList});
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

      for(let i = 0; i < content.length; i++){ // iterate through each div under body tag
        for(let j = 0; j < content[i].children.length; j++){// iterate through each tag under each div
          if(content[i].children[j].tagName.toLowerCase() === "head" && content[i].children[j].innerHTML.toLowerCase().indexOf("case") != -1){
            // extract content
            while(j < content[i].children.length){
              if(content[i].children[j].tagName.toLowerCase() === "p"){
                var tmp = content[i].children[j].getElementsByTagName('ref');
                // remove all <a> elements
                while (tmp[0]){
                  tmp[0].parentNode.removeChild(tmp[0])
                }
                contentList.push(content[i].children[j].innerHTML);
              }
              j++;
            }
          }

        }
      }
      //console.log(contentList.join(''));
      this.setState({content: contentList.join('')});
    }

    onChangeContent = e => {
      this.setState({content: e.target.value});
    }
    onChangeTitle = e => {
      this.setState({title: e.target.value});
    }
    onChangeKeywords = e => {
      this.setState({keywords: e.target.value});
    }
    onChangeAuthor = e => {
      this.setState({authors: e.target.value});
    }

    handleSubmit = () => {
        this.props.handleSubmit(this.state);
        //.split(',').map(item => {return item.trim();})
    }

    render() {
        const { handleCloseModal } = this.props;

        const CloseModalButton =
            <button
                id='close-button'
                onClick={handleCloseModal}>
                <FontAwesomeIcon icon={['far', 'times']} />
            </button>

        const _submitButton =
            <button
                onClick={this.handleSubmit}
                className='confirm-button'
            >
                Submit
            </button>


        return <div className='modal-inner-content'>
            <span>Submit your Report from PDF</span>
            <div>
              <div className="custom-file">
                <input type="file" className="custom-file-input" id="customFile" onChange={this.onChangeFile} />
                <label className="custom-file-label" for="customFile">{this.state.filename}</label>
                <button type="submit" onClick={this.onSubmitFile} className="btn btn-primary">Submit</button>
              </div>
            </div>

            <div>
            <form>
              <div className="form-row formitem">
                <label className="col-sm-2 col-form-label" for="reportTitle">Title</label>
                <input type="text"
                className="form-control col-sm-10"
                value={this.state.title}
                onChange={this.onChangeTitle}
                id="reportTitle"
                placeholder="Title" />
              </div>
              <div className="form-row">
                <label className="col-sm-2 col-form-label" for="reportAuthors">Authors</label>
                <input type="text" value={this.state.authors} className="form-control col-sm-10" onChange={this.onChangeAuthor} id="reportAuthors" placeholder="Authors (separate using commas)" />
              </div>
              <div className="form-row">
                <label className="col-form-label col-sm-2"for="reportKeywords">Keywords</label>
                <input type="text" value={this.state.keywords} className="form-control col-sm-10" onChange={this.onChangeKeywords} id="reportKeywords" placeholder="Keywords (separate using commas)" />
              </div>
              <div className="form-row">
                <label className="col-form-label col-sm-2" for="reportContent">Content</label>
                <textarea className="form-control col-sm-10" value={this.state.content} style={{ resize: 'none' }} onChange={this.onChangeContent} id="reportContent" rows="5"></textarea>
              </div>
              <button type="submit" onSubmit={this.onSubmitReport} className="btn btn-primary">Submit Report</button>
            </form>
            </div>
            {CloseModalButton}

        </div >
    }
}

class LoginModal extends Component {
    state = {
        login_visible: false,
        submit_visible: false
    }

    openSubmitModal = () => {
        this.setState({ submit_visible: true });
    }

    closeSubmitModal = () => {
        this.setState({ submit_visible: false })
    }

    openModal = () => {
        this.setState({ login_visible: true });
    }

    closeModal = () => {
        this.setState({ login_visible: false });
    }

    handleSignIn = data => {
        console.log('signin', data);
        axios.post(getHost() + ":3001/api/login", data)
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
        axios.post(getHost() + ":3001/api/createUser", data)
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
        axios.post(getHost() + ":3001/api/uploadReport", text)
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
        const { login_visible, submit_visible } = this.state;

        let hasUser = false;
        let user = localStorage.getItem('user');
        if (user) {
            user = JSON.parse(user);
            hasUser = true;
        }
        console.log(user, hasUser);

        const Button = hasUser ?
            <div className='button'>
                <button onClick={this.showProfile}>
                    <FontAwesomeIcon icon={['far', 'user-astronaut']} />
                    Profile
                </button>

                <button onClick={this.openSubmitModal}>
                    <FontAwesomeIcon icon={['far', 'arrow-alt-circle-up']} />
                    Submit
                </button>

                |
                <button onClick={this.handleSignOut}>
                    Sign Out
                </button>

            </div>
            :
            <button onClick={this.openModal} className='button'>
                <FontAwesomeIcon icon={['far', 'user-astronaut']} />
                Login
            </button>


        return (
            <div id='login-modal'>
                {Button}
                <Modal
                    visible={login_visible}
                    width="600"
                    height="500"
                    effect="fadeInDown"
                    onClickAway={this.closeModal}
                >
                    <ModalContent
                        handleCloseModal={this.closeModal}
                        handleSignIn={this.handleSignIn}
                        handleSignUp={this.handleSignUp}
                    />
                </Modal>
                <Modal
                    visible={submit_visible}
                    width="600"
                    height="500"
                    effect="fadeInDown"
                    onClickAway={this.closeSubmitModal}
                >
                    <SubmitModalContent
                        handleCloseModal={this.closeSubmitModal}
                        handleSubmit={this.handleSubmit}
                    />
                </Modal>
            </div>
        );
    }
}


export default LoginModal;
