import React from 'react'
import {Layout, Row, Col, Button} from 'antd';
import classnames from 'classnames';
import styles from '../styles/Home.module.css'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import ArchAuth from "../util/arch-auth";
import ArchNotesService from "../util/arch-notes-service";

const {Content} = Layout;
const ArchNotesEditor = dynamic(() => import('../components/arch-notes-editor'), {ssr: false});
const ArchNotesList = dynamic(() => import('../components/arch-notes-list'), {ssr: false});

class Home extends React.Component {

    state = {loading: {notesList: true}, loggedInUser: null, notesAndDirectories: []};

    constructor(props) {
        super(props);
        this.initNotesAndDirList = this.initNotesAndDirList.bind(this);
    }

    componentDidMount() {
        ArchAuth.initSignInButton('g-signin2');
        ArchAuth.onAuthStateChange(async (firebaseUser) => {
            this.setState({loggedInUser: firebaseUser});
            if (firebaseUser) {
                this.initNotesAndDirList().then();
            } else {
                this.setState({loading: {notesList: false}});
            }
        });
    }

    async initNotesAndDirList() {
        this.setState({
            notesAndDirectories: await ArchNotesService.fetchNotesAndDirectories(ArchAuth.getCurrentUser().uid),
            loading: {notesList: false}
        });
    }

    render() {
        let loggedInUser = this.state.loggedInUser;
        return (
            <div>
                <Head>
                    <script src="https://apis.google.com/js/platform.js" async defer/>
                    <meta name="google-signin-client_id" content="914280926964-idhkbcpv3irnsf9kbuac9sfjtp9j3bt5.apps.googleusercontent.com"/>
                    <meta name="google-signin-cookiepolicy" content="single_host_origin"/>
                    <meta name="google-signin-scope" content="profile email"/>
                    <title>archeun | NOTES</title>
                </Head>
                <Layout className={styles.mainLayout}>
                    <Row className={styles.header}>
                        <Col span={18}>
                            <div className={styles.brandNameText}>archeun | NOTES</div>
                        </Col>
                        <Col span={6}>
                            {loggedInUser ? '' : <div id="g-signin2" className={styles.signInOut} data-theme="dark"/>}
                            <Button className={styles.signInOut} onClick={ArchAuth.signOut}>
                                {loggedInUser ? 'Logout' : ''}
                            </Button>
                            <div className={styles.loggedInUserName}>{loggedInUser ? loggedInUser.displayName : ''}</div>
                        </Col>
                    </Row>
                    <Content className={styles.content}>
                        <Row className={styles.contentRow}>
                            <Col className={classnames(styles.contentRowLeftCol)} span={5}>
                                <ArchNotesList loggedInUser={this.state.loggedInUser}
                                               notesAndDirectories={this.state.notesAndDirectories}
                                               onNoteListChange={() => {
                                                   return this.initNotesAndDirList().then();
                                               }}
                                               loading={this.state.loading.notesList}/>
                            </Col>
                            <Col className={classnames(styles.contentRowRightCol)} span={18}>
                                <ArchNotesEditor/>
                            </Col>
                        </Row>
                    </Content>
                    <Row className={styles.footer}>
                        <Col span={24} className={styles.footerText}>Copyright © ArCheun. All rights reserved</Col>
                    </Row>
                </Layout>
            </div>
        );
    }
}

export default Home;
