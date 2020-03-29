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
        text: ""
    }

    handleSubmitInput = e => {
        this.setState({ text: e.target.value });
    }

    handleSubmit = () => {
        this.props.handleSubmit(this.state);
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
            <span>Submit your Report</span>
            <div>
                <textarea value={this.state.value} onChange={this.handleSubmitInput} rows={10} cols={30} />
            </div>
            {CloseModalButton}
            {_submitButton}

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