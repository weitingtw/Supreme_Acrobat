import React, { Component } from "react";
import axios from "axios";
import { getHost } from "../../utils";
import ucla_logo from "../../static/ucla.png";
import LoginModal from "../LoginModal/LoginModal";
import { PacmanLoader } from "react-spinners";
import Sidebar from "react-sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Result from '../SearchResults/Result/Result';

class KeywordPage extends Component {
    state = {
        pmID_List: null,
    };

    componentDidMount() {
        const { keyword } = this.props.match.params;
        axios
            .post(getHost() + "/api/getKeyword", { keyword })
            .then((res) => {
                const data = res.data.data;
                console.log(data)
                this.setState({ pmID_List: data });
            })
            .catch((err) => console.log(err));
    }

    render() {
        const { keyword } = this.props.match.params;
        const { pmID_List } = this.state;
        console.log(pmID_List)
        const styles = {
            sidebar: {
                width: 400,
                height: "100%",
            },
            sidebarLink: {
                width: "inherit",
                display: "block",
                padding: "16px 0px",
                color: "#757575",
                textDecoration: "none",
            },
            content: {
                padding: "16px",
                height: "100%",
                backgroundColor: "white",
                display: "inline-block",
                textAlign: "center",
                width: "-webkit-fill-available",
            },
            root: {
                fontFamily:
                    '"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif',
                fontWeight: 300,
                width: 200,
                height: "100%",
            },
            header: {
                backgroundColor: "#03a9f4",
                color: "white",
                padding: "16px",
                fontSize: "24px",
            },
            title: {
                padding: "30px",
                fontSize: "24px"
            },
            pmID_block: {
                margin: "20px"
            },
            pmID_link: {
                padding: "10px",
                display: "block",
            }
        }

        const sidebar_content = (
            <div style={styles.root}>
                <div style={styles.header}>
                    CREAT
                <span style={styles.e}>e</span>
                </div>
                <div style={styles.content}>
                    <a href="/" style={styles.sidebarLink}>
                        Home
                </a>
                </div>
            </div>
        );


        return <div>
            {pmID_List && (
                <Sidebar
                    sidebar={sidebar_content}
                    styles={{ sidebar: { background: "white" } }}
                    docked={true}
                    shadow={true}
                ><div className="banner">
                        <React.Fragment>
                            <img
                                src={ucla_logo}
                                alt="uclalogo"
                                width="184.3"
                                height="60.5"
                            />
                            <LoginModal />
                        </React.Fragment>
                    </div>
                    <div style={styles.title} id="title">
                        <FontAwesomeIcon icon={["fal", "file-alt"]} />
                    List of pmIDs related to {keyword}
                    </div>
                    <div style={styles.pmID_block}>
                        {pmID_List && pmID_List.map((pmID, index) => <Result
                            displayData={{ id: pmID, previewText: "previewText", textEntities: [], entities: [] }}
                        />)}
                    </div>
                </Sidebar>)}
            {!pmID_List && (
                <div className="loading-container">
                    <span className="loading-text">Loading ......</span>
                    <PacmanLoader
                        sizeUnit={"px"}
                        size={150}
                        color={"rgb(1, 136, 203)"}
                    />
                </div>
            )}
        </div >
    }
}

export default KeywordPage;