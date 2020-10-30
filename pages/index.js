import React from 'react'
import {Layout, Row, Col, Menu} from 'antd';
import classnames from 'classnames';

import styles from '../styles/Home.module.css'

const {Header, Footer, Content} = Layout;

import dynamic from 'next/dynamic'
import Head from 'next/head'

const ArchNotesEditor = dynamic(() => import('../components/arch-notes-editor'), {
    ssr: false
});

class Home extends React.Component {

    render() {
        return (
            <div>
                <Head>
                    <script src="https://apis.google.com/js/platform.js" async defer></script>
                    <meta name="google-signin-client_id" content="914280926964-idhkbcpv3irnsf9kbuac9sfjtp9j3bt5.apps.googleusercontent.com"/>
                    <meta name="google-signin-cookiepolicy" content="single_host_origin"/>
                    <meta name="google-signin-scope" content="profile email"/>
                </Head>
                <Layout className={styles.mainLayout}>
                    <Row className={styles.header}>
                        <Col span={18}>
                            <div className={styles.brandNameText}>archeun | NOTES</div>
                        </Col>
                        <Col span={6}>
                            <div className={classnames(styles.signIn, "g-signin2")} data-onsuccess="onSignIn" data-theme="dark"></div>
                        </Col>
                    </Row>
                    <Content className={styles.content}>
                        <Row className={styles.contentRow}>
                            <Col className={classnames(styles.contentRowLeftCol)} span={4}>Note List</Col>
                            <Col className={classnames(styles.contentRowRightCol)} span={20}>
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
